// auth.js — v4 (with Supabase DB integration)

let supabaseClient = null;

// Hybrid Storage (Cookie + LocalStorage) for Session Persistence
const cookieStorage = {
    getItem: (key) => {
        let val = window.localStorage.getItem(key);
        if (val) return val;
        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
        if (match) {
            val = decodeURIComponent(match[2]);
            window.localStorage.setItem(key, val);
            return val;
        }
        return null;
    },
    setItem: (key, value) => {
        window.localStorage.setItem(key, value);
        const d = new Date();
        d.setTime(d.getTime() + (7*24*60*60*1000));
        document.cookie = key + "=" + encodeURIComponent(value) + ";expires=" + d.toUTCString() + ";path=/";
    },
    removeItem: (key) => {
        window.localStorage.removeItem(key);
        document.cookie = key + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    }
};

// Initialize Supabase
try {
    if (CONFIG.SUPABASE_URL && 
        !CONFIG.SUPABASE_URL.includes("GANTI_DENGAN") &&
        CONFIG.SUPABASE_ANON_KEY && 
        !CONFIG.SUPABASE_ANON_KEY.includes("GANTI_DENGAN")) {
        
        supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: cookieStorage
            }
        });
        console.log("✅ Supabase berhasil diinisialisasi.");
        checkUserSession();
    } else {
        console.warn("⚠️ Supabase belum dikonfigurasi.");
    }
} catch (error) {
    console.error("❌ Error inisialisasi Supabase:", error);
}

async function checkUserSession() {
    // Cek manual mock session
    const mockUserStr = localStorage.getItem('inat_mock_user');
    const now = new Date().getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const lastActive = localStorage.getItem('inat_last_active');

    if (mockUserStr) {
        if (lastActive && (now - parseInt(lastActive)) > sevenDays) {
            console.log("Sesi kadaluarsa (7 hari tidak aktif). Logout otomatis.");
            localStorage.removeItem('inat_mock_user');
            localStorage.removeItem('inat_last_active');
            onLogout();
        } else {
            localStorage.setItem('inat_last_active', now.toString());
            const mockUser = JSON.parse(mockUserStr);
            onLogin(mockUser);
        }
        return; // Supabase not needed if mock is active
    }

    if (!supabaseClient) return;
    
    // Ambil session saat ini secara eksplisit untuk mencegah status null sementara saat refresh
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        const now = new Date().getTime();
        const lastActive = localStorage.getItem('inat_last_active');
        
        if (session) {
            // Bersihkan hash jika ada (karena Google login melempar token di URL)
            if (window.location.hash && window.location.hash.includes('access_token')) {
                window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
            }

            if (lastActive && (now - parseInt(lastActive)) > sevenDays) {
                console.log("Sesi kadaluarsa (7 hari tidak aktif). Logout otomatis.");
                supabaseClient.auth.signOut();
                onLogout();
            } else {
                localStorage.setItem('inat_last_active', now.toString());
                onLogin(session.user);
            }
        } else {
            localStorage.removeItem('inat_last_active');
            onLogout();
        }
    }).catch(err => console.error("Session error:", err));

    // Dengarkan perubahan sesi di masa depan (misal: ada tab lain yang logout)
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (_event === 'INITIAL_SESSION') return; // Sudah ditangani oleh getSession() di atas
        
        if (session) {
            if (window.location.hash && window.location.hash.includes('access_token')) {
                window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
            }
            localStorage.setItem('inat_last_active', new Date().getTime().toString());
            onLogin(session.user);
        } else {
            localStorage.removeItem('inat_last_active');
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
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const err = document.getElementById('login-error');
    err.textContent = "";
    if (!email || !password) { err.textContent = "Email dan password harus diisi."; return; }
    
    // Hardcoded bypass for the user's account request
    if (email === 'mykhrll' && password === 'Khoirul710.') {
        const mockUser = { id: 'mock-123', email: 'mykhrll', user_metadata: { full_name: 'mykhrll' } };
        localStorage.setItem('inat_mock_user', JSON.stringify(mockUser));
        localStorage.setItem('inat_last_active', new Date().getTime().toString());
        document.getElementById('auth-modal').classList.remove('active');
        onLogin(mockUser);
        return;
    }

    if (!supabaseClient) { alert("Supabase belum dikonfigurasi."); return; }
    
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

        document.getElementById('btn-logout').addEventListener('click', async () => {
            localStorage.removeItem('inat_mock_user');
            localStorage.removeItem('inat_last_active');
            if (supabaseClient) {
                await supabaseClient.auth.signOut();
            }
            onLogout();
        });
    }
    
    // Switch UI
    switchToLoggedInUI();
    document.getElementById('auth-modal').classList.remove('active');

    // Load user data from Supabase
    loadUserData(user.id);
    
    if (typeof loadExploreDataFromDB === 'function') loadExploreDataFromDB();
}

// On Logout
function onLogout() {
    profileListenersAttached = false;
    switchToLoggedOutUI();
    
    // Cleanup realtime subscriptions
    if (window.monitoringChannel && supabaseClient) {
        supabaseClient.removeChannel(window.monitoringChannel);
        window.monitoringChannel = null;
    }
    if (window.helpIdentifyChannel && supabaseClient) {
        supabaseClient.removeChannel(window.helpIdentifyChannel);
        window.helpIdentifyChannel = null;
    }
    if (window.userObsChannel && supabaseClient) {
        supabaseClient.removeChannel(window.userObsChannel);
        window.userObsChannel = null;
    }
    
    // Reset Stats
    resetDashboardStats();
}

function resetDashboardStats() {
    // Reset Top Cards
    const ids = ['k-obs', 'k-species', 'k-families', 'k-locations', 'k-identifikasi', 'k-points'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });

    // Reset Badges
    const badgeIds = ['badge-pemula', 'badge-fotografer', 'badge-pengidentifikasi', 'badge-botanis', 'badge-penjelajah', 'badge-ekologi', 'badge-research', 'badge-citizen'];
    badgeIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('badge-earned');
    });

    // Reset Laporan Biodiversitas
    if (typeof renderBiodiversityReport === 'function') {
        renderBiodiversityReport([], 0, 0); // Will trigger empty state
    }
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
    
    let uName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
    if (!uName && session.user.email) uName = session.user.email.split('@')[0];
    if (!uName) uName = 'Pengguna';

    const row = {
        user_id: session.user.id,
        user_name: uName,
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
        // 1. Ambil semua observasi milik user (satu kueri efisien)
        const { data: obsData, error: obsError } = await supabaseClient
            .from('observations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!obsError && obsData) {
            // Update top stats
            const obsCount = obsData.length;
            const elObs = document.getElementById('k-obs');
            if (elObs) elObs.textContent = obsCount;

            const uniqueSpecies = new Set(obsData.map(o => o.scientific_name).filter(Boolean)).size;
            const elSpecies = document.getElementById('k-species');
            if (elSpecies) elSpecies.textContent = uniqueSpecies;

            const families = new Set(obsData.map(o => {
                try { return o.classification?.family || ''; } catch(e) { return ''; }
            }).filter(Boolean));
            const elFam = document.getElementById('k-families');
            if (elFam) elFam.textContent = families.size;

            // Lokasi Berbeda
            const locations = new Set(
                obsData.map(o => o.distribution_indonesia).filter(Boolean)
                    .flatMap(loc => loc.split(',').map(s => s.trim()))
            );
            const elLoc = document.getElementById('k-locations');
            if (elLoc) elLoc.textContent = locations.size;

            // Identifikasi Dibantu (set 0 for now)
            const identifikasiDibantu = 0;
            const elIdent = document.getElementById('k-identifikasi');
            if (elIdent) elIdent.textContent = identifikasiDibantu;

            // Kalkulasi Poin (10 poin per observasi, 5 poin per spesies unik)
            const totalPoin = (obsCount * 10) + (uniqueSpecies * 5);
            const elPoin = document.getElementById('k-points');
            if (elPoin) elPoin.textContent = totalPoin;

            // Hitung Badge
            const badges = {
                'badge-pemula': obsCount >= 1,
                'badge-fotografer': obsCount >= 10,
                'badge-pengidentifikasi': identifikasiDibantu >= 5,
                'badge-botanis': uniqueSpecies >= 25,
                'badge-penjelajah': locations.size >= 5,
                'badge-ekologi': totalPoin >= 1000,
                // Dua badge di bawah kita buat default false karena butuh validasi manual / research grade
                'badge-research': false,
                'badge-citizen': false 
            };

            // Terapkan class badge-earned
            Object.keys(badges).forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (badges[id]) el.classList.add('badge-earned');
                    else el.classList.remove('badge-earned');
                }
            });

            // Trigger Laporan Biodiversitas di app.js
            if (typeof renderBiodiversityReport === 'function') {
                renderBiodiversityReport(obsData, uniqueSpecies, families.size);
            }
        }

        // 2. Ambil data monitoring (Lacak)
        const { data: monitoringData } = await supabaseClient
            .from('monitoring')
            .select('*')
            .eq('user_id', userId)
            .order('observation_date', { ascending: true });

        // Update UI Lacak
        if (typeof updateLacakFromDB === 'function') {
            updateLacakFromDB(monitoringData || []);
        }

        // 3. Setup Realtime Subscription untuk monitoring (jika belum)
        if (!window.monitoringChannel) {
            window.monitoringChannel = supabaseClient.channel('custom-monitoring-channel')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'monitoring', filter: `user_id=eq.${userId}` }, (payload) => {
                    console.log('Realtime monitoring change:', payload);
                    loadUserData(userId);
                })
                .subscribe();
        }

        // 4. Setup Realtime Subscription untuk observations user ini (jika belum)
        if (!window.userObsChannel) {
            window.userObsChannel = supabaseClient.channel('custom-user-obs-channel')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'observations', filter: `user_id=eq.${userId}` }, (payload) => {
                    console.log('Realtime observations change:', payload);
                    loadUserData(userId);
                })
                .subscribe();
        }

        console.log("✅ User data loaded.");
        
        // Load data for "Bantu Identifikasi" cards (other users' observations)
        loadHelpIdentifyData(userId);

    } catch (err) {
        console.error("Error loading user data:", err);
    }
}

// ===== Bantu Identifikasi (Realtime) =====
async function loadHelpIdentifyData(currentUserId) {
    if (!supabaseClient) return;

    try {
        // Fetch all recent observations
        const { data, error } = await supabaseClient
            .from('observations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20); // Ambil 20 terbaru, di app.js akan disaring
            
        if (error) throw error;
        
        if (typeof renderHelpIdentifyCards === 'function') {
            renderHelpIdentifyCards(data || [], currentUserId);
        }

        // Setup Realtime Subscription jika belum ada
        if (!window.helpIdentifyChannel) {
            window.helpIdentifyChannel = supabaseClient.channel('custom-help-identify-channel')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'observations' },
                    (payload) => {
                        console.log('Realtime change received for help identify:', payload);
                        // Refresh data
                        loadHelpIdentifyData(currentUserId);
                    }
                )
                .subscribe();
        }

    } catch (err) {
        console.error("Error loading help identify data:", err);
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

// Delete observation
async function deleteObservation(id) {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient
            .from('observations')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Error deleting observation:", err);
        return false;
    }
}


// Expose to window for app.js
window.saveObservation = saveObservation;
window.saveLacakEntry = saveLacakEntry;
window.saveQuizScore = saveQuizScore;
window.loadUserData = loadUserData;
window.getAllObservations = getAllObservations;
window.deleteObservation = deleteObservation;
