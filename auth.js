// auth.js — v4 (with Supabase DB integration)

let supabaseClient = null;

// Initialize Supabase
try {
    if (CONFIG.SUPABASE_URL && 
        !CONFIG.SUPABASE_URL.includes("GANTI_DENGAN") &&
        CONFIG.SUPABASE_ANON_KEY && 
        !CONFIG.SUPABASE_ANON_KEY.includes("GANTI_DENGAN")) {
        
        supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        console.log("✅ Supabase berhasil diinisialisasi.");
        checkUserSession();
    } else {
        console.warn("⚠️ Supabase belum dikonfigurasi.");
    }
} catch (error) {
    console.error("❌ Error inisialisasi Supabase:", error);
}

async function checkUserSession() {
    if (!supabaseClient) return;
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        onLogin(session.user);
    }
    
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (session) {
            onLogin(session.user);
        } else {
            onLogout();
        }
    });
}

// Register
document.getElementById('btn-submit-register').addEventListener('click', async () => {
    if (!supabaseClient) { alert("Supabase belum dikonfigurasi."); return; }
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const err = document.getElementById('reg-error');
    err.textContent = "";
    if (!email || !password) { err.textContent = "Email dan password harus diisi."; return; }
    if (password.length < 6) { err.textContent = "Password minimal 6 karakter."; return; }
    
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) { err.textContent = error.message; }
    else { alert("Pendaftaran berhasil! Cek email untuk verifikasi."); document.getElementById('auth-modal').classList.remove('active'); }
});

// Login
document.getElementById('btn-submit-login').addEventListener('click', async () => {
    if (!supabaseClient) { alert("Supabase belum dikonfigurasi."); return; }
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const err = document.getElementById('login-error');
    err.textContent = "";
    if (!email || !password) { err.textContent = "Email dan password harus diisi."; return; }
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) { err.textContent = error.message; }
    else { document.getElementById('auth-modal').classList.remove('active'); }
});

// Google Login
document.getElementById('btn-google-auth').addEventListener('click', async () => {
    if (!supabaseClient) { alert("Supabase belum dikonfigurasi."); return; }
    
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            queryParams: {
                prompt: 'select_account'
            }
        }
    });
    
    if (error) {
        alert("Error login Google: " + error.message);
    }
});

// On Login — set up UI (guarded against duplicate listeners)
let profileListenersAttached = false;

function onLogin(user) {
    const meta = user.user_metadata || {};
    const avatarUrl = meta.avatar_url || meta.picture || null;
    const fullName = meta.full_name || meta.name || user.email.split('@')[0];
    const initials = fullName.charAt(0).toUpperCase();
    
    // Update avatar in logged-in navbar
    const avatarEl = document.getElementById('avatar-content');
    if (avatarUrl) {
        avatarEl.innerHTML = `<img src="${avatarUrl}" alt="Profil" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
        avatarEl.textContent = initials;
    }
    
    // Update profile name
    document.getElementById('profile-name').textContent = fullName;
    
    // Attach profile dropdown & logout listeners ONCE
    if (!profileListenersAttached) {
        profileListenersAttached = true;

        document.getElementById('profile-trigger').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('profile-dropdown').classList.toggle('active');
        });

        document.getElementById('btn-logout').addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
        });
    }
    
    // Switch UI
    switchToLoggedInUI();
    document.getElementById('auth-modal').classList.remove('active');

    // Load user data from Supabase
    loadUserData(user.id);
    
    // Seed and load explore data
    seedSampleData().then(() => {
        if (typeof loadExploreDataFromDB === 'function') loadExploreDataFromDB();
    });
}

// On Logout
function onLogout() {
    profileListenersAttached = false;
    switchToLoggedOutUI();
}

// ===== DATABASE HELPERS =====

// Get current user ID
function getCurrentUserId() {
    if (!supabaseClient) return null;
    // supabaseClient.auth.getUser() is async, use session instead
    return supabaseClient.auth.getSession().then(({ data }) => data.session?.user?.id || null);
}

// Save an observation (from Identifikasi feature)
async function saveObservation(obsData) {
    if (!supabaseClient) { console.warn("Supabase not initialized"); return null; }
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { console.warn("Not logged in"); return null; }
    
    const row = {
        user_id: session.user.id,
        species_name: obsData.name_id || '',
        scientific_name: obsData.scientific_name || '',
        classification: obsData.classification || {},
        distribution_indonesia: obsData.distribution_indonesia || '',
        distribution_world: obsData.distribution_world || '',
        habitat: obsData.habitat || '',
        fun_fact: obsData.fun_fact || '',
        ecological_role: obsData.ecological_role || '',
        references: obsData.references || [],
        related_species: obsData.related_species || [],
        confidence: obsData.confidence || '',
        image_base64: obsData.image_thumbnail || null,
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
        .from('observations')
        .insert([row])
        .select();

    if (error) {
        console.error("Error saving observation:", error);
        return null;
    }
    console.log("✅ Observation saved:", data);
    return data;
}

// Save a monitoring/lacak entry
async function saveLacakEntry(entry) {
    if (!supabaseClient) return null;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return null;

    const row = {
        user_id: session.user.id,
        plant_name: entry.nama,
        observation_date: entry.tanggal,
        height_cm: entry.tinggi || 0,
        leaf_count: entry.daun || 0,
        growth_phase: entry.fase,
        health_condition: entry.kondisi,
        notes: entry.catatan || '',
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
        .from('monitoring')
        .insert([row])
        .select();

    if (error) {
        console.error("Error saving monitoring entry:", error);
        return null;
    }
    console.log("✅ Monitoring entry saved:", data);
    return data;
}

// Load all user data (observations + monitoring)
async function loadUserData(userId) {
    if (!supabaseClient || !userId) return;

    try {
        // Load observations count
        const { count: obsCount } = await supabaseClient
            .from('observations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Load monitoring entries
        const { data: monitoringData } = await supabaseClient
            .from('monitoring')
            .select('*')
            .eq('user_id', userId)
            .order('observation_date', { ascending: true });

        // Update kontribusi stats if available
        if (obsCount !== null && obsCount !== undefined) {
            const el = document.getElementById('k-obs');
            if (el) el.textContent = obsCount;
        }

        // Update lacak data if monitoring entries exist
        if (monitoringData && monitoringData.length > 0) {
            // Replace default lacak data with real data
            if (typeof updateLacakFromDB === 'function') {
                updateLacakFromDB(monitoringData);
            }
        }

        // Load unique species count
        const { data: speciesData } = await supabaseClient
            .from('observations')
            .select('scientific_name')
            .eq('user_id', userId);
        
        if (speciesData) {
            const uniqueSpecies = new Set(speciesData.map(s => s.scientific_name)).size;
            const el = document.getElementById('k-species');
            if (el) el.textContent = uniqueSpecies || 0;
        }

            // Count unique families from observations
            const { data: familyData } = await supabaseClient
                .from('observations')
                .select('classification')
                .eq('user_id', userId);
            
            if (familyData) {
                const families = new Set(familyData.map(f => {
                    try { return f.classification?.family || ''; } catch(e) { return ''; }
                }).filter(f => f));
                const fEl = document.getElementById('k-families');
                if (fEl) fEl.textContent = families.size;
            }

        console.log("✅ User data loaded.");
    } catch (err) {
        console.error("Error loading user data:", err);
    }
}

// Save quiz score
async function saveQuizScore(score, total) {
    if (!supabaseClient) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { error } = await supabaseClient
        .from('quiz_scores')
        .insert([{
            user_id: session.user.id,
            score: score,
            total_questions: total,
            quiz_type: 'ekologi_tumbuhan',
            created_at: new Date().toISOString()
        }]);

    if (error) console.error("Error saving quiz score:", error);
    else console.log("✅ Quiz score saved.");
}

// Fetch all observations for Explore view
async function getAllObservations() {
    if (!supabaseClient) return [];
    try {
        const { data, error } = await supabaseClient
            .from('observations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Error fetching all observations:", err);
        return [];
    }
}

// Seed sample data if empty
async function seedSampleData() {
    if (!supabaseClient) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;
    
    // Check if user already has data
    const { count } = await supabaseClient
        .from('observations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
        
    if (count === 0) {
        console.log("Seeding initial data...");
        const samples = [
            {
                user_id: session.user.id,
                species_name: 'Anggrek Bulan',
                scientific_name: 'Phalaenopsis amabilis',
                distribution_indonesia: 'Kalimantan',
                habitat: 'Hutan Hujan',
                image_base64: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Phalaenopsis_amabilis_01.JPG/800px-Phalaenopsis_amabilis_01.JPG',
                created_at: new Date().toISOString()
            },
            {
                user_id: session.user.id,
                species_name: 'Rafflesia Arnoldii',
                scientific_name: 'Rafflesia arnoldii',
                distribution_indonesia: 'Sumatera',
                habitat: 'Hutan Tropis',
                image_base64: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Rafflesia_arnoldii_at_Bengkulu.jpg/800px-Rafflesia_arnoldii_at_Bengkulu.jpg',
                created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                user_id: session.user.id,
                species_name: 'Kantong Semar',
                scientific_name: 'Nepenthes mirabilis',
                distribution_indonesia: 'Kalimantan',
                habitat: 'Lahan Gambut',
                image_base64: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Nepenthes_mirabilis.jpg/800px-Nepenthes_mirabilis.jpg',
                created_at: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        
        await supabaseClient.from('observations').insert(samples);
        console.log("Sample data seeded.");
    }
}

// Expose to window for app.js
window.saveObservation = saveObservation;
window.saveLacakEntry = saveLacakEntry;
window.saveQuizScore = saveQuizScore;
window.loadUserData = loadUserData;
window.getAllObservations = getAllObservations;
window.seedSampleData = seedSampleData;
