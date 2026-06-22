// auth.js — v5 (Hybrid: Firebase Auth & Monitoring + Supabase Observations)

let supabaseClient = null;
let firebaseApp = null;
let db = null; // Firestore reference

// Initialize Supabase
try {
    if (CONFIG.SUPABASE_URL && !CONFIG.SUPABASE_URL.includes("GANTI_DENGAN")) {
        // Hanya inisialisasi minimal tanpa persistensi sesi lokal karena Auth ditangani Firebase
        supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        console.log("✅ Supabase berhasil diinisialisasi (untuk Observations).");
    }
} catch (error) {
    console.error("❌ Error inisialisasi Supabase:", error);
}

// Initialize Firebase
try {
    if (CONFIG.FIREBASE_CONFIG && !CONFIG.FIREBASE_CONFIG.apiKey.includes("GANTI_DENGAN")) {
        firebaseApp = firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
        db = firebase.firestore();
        console.log("✅ Firebase berhasil diinisialisasi.");
        
        // Setup Firebase Auth State Listener
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // Konversi data Firebase User agar mirip dengan struktur sebelumnya
                const formattedUser = {
                    email: user.email,
                    id: user.uid, // Ini Firebase UID, kita gunakan sebagai referensi utama
                    phoneNumber: user.phoneNumber,
                    isAnonymous: user.isAnonymous,
                    user_metadata: {
                        full_name: user.displayName,
                        avatar_url: user.photoURL
                    }
                };
                onLogin(formattedUser);
            } else {
                onLogout();
            }
        });
    } else {
        console.warn("⚠️ Firebase belum dikonfigurasi.");
    }
} catch (error) {
    console.error("❌ Error inisialisasi Firebase:", error);
}

// Register (Email/Password via Firebase)
document.getElementById('btn-submit-register').addEventListener('click', async () => {
    if (!firebaseApp) { alert("Firebase belum dikonfigurasi."); return; }
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const err = document.getElementById('auth-error');
    err.textContent = "";
    if (!email || !password) { err.textContent = "Email dan password harus diisi."; return; }
    if (password.length < 6) { err.textContent = "Password minimal 6 karakter."; return; }
    
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        alert("Pendaftaran berhasil!");
        document.getElementById('auth-modal').classList.remove('active');
    } catch (error) {
        err.textContent = error.message;
    }
});

// Login (Email/Password via Firebase)
document.getElementById('btn-submit-login').addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const err = document.getElementById('auth-error');
    err.textContent = "";
    if (!email || !password) { err.textContent = "Email dan password harus diisi."; return; }
    
    // Hardcoded bypass for the user's account request
    if (email === 'mykhrll' && password === 'Khoirul710.') {
        const mockUser = { id: 'mock-123', email: 'mykhrll', user_metadata: { full_name: 'mykhrll' } };
        document.getElementById('auth-modal').classList.remove('active');
        onLogin(mockUser);
        return;
    }

    if (!firebaseApp) { alert("Firebase belum dikonfigurasi."); return; }
    
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        document.getElementById('auth-modal').classList.remove('active');
    } catch (error) {
        err.textContent = error.message;
    }
});

// Google Login (via Firebase)
document.getElementById('btn-google-auth').addEventListener('click', async () => {
    if (!firebaseApp) { alert("Firebase belum dikonfigurasi."); return; }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    try {
        await firebase.auth().signInWithPopup(provider);
        document.getElementById('auth-modal').classList.remove('active');
    } catch (error) {
        alert("Error login Google: " + error.message);
    }
});

// Anonymous Login (via Firebase)
document.getElementById('btn-anon-auth')?.addEventListener('click', async () => {
    if (!firebaseApp) { alert("Firebase belum dikonfigurasi."); return; }
    try {
        await firebase.auth().signInAnonymously();
        document.getElementById('auth-modal').classList.remove('active');
    } catch (error) {
        alert("Error login Tamu: " + error.message);
    }
});



// On Login — set up UI (guarded against duplicate listeners)
let profileListenersAttached = false;

function onLogin(user) {
    const meta = user.user_metadata || {};
    const avatarUrl = meta.avatar_url || meta.picture || null;
    
    let fallbackName = "Pengguna";
    if (user.email) fallbackName = user.email.split('@')[0];
    else if (user.phoneNumber) fallbackName = user.phoneNumber;
    else if (user.isAnonymous) fallbackName = "Tamu";
    
    const fullName = meta.full_name || meta.name || fallbackName;
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
            if (firebaseApp) {
                await firebase.auth().signOut();
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
    if (typeof window.monitoringChannelFirebase === 'function') {
        window.monitoringChannelFirebase(); // Unsubscribe Firestore
        window.monitoringChannelFirebase = null;
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

    // Reset Laporan Biodiversitas & Peran Ekologis
    if (typeof renderBiodiversityReport === 'function') {
        renderBiodiversityReport([], 0, 0); // Will trigger empty state
    }
    if (typeof renderEcoRoles === 'function') {
        renderEcoRoles([]);
    }
}

// ===== DATABASE HELPERS =====

// Get current user ID (Firebase)
function getCurrentUserId() {
    if (!firebaseApp) return null;
    const user = firebase.auth().currentUser;
    return user ? user.uid : null;
}

// Save an observation (from Identifikasi feature)
async function saveObservation(obsData) {
    if (!db) { console.warn("Firebase db not initialized"); return null; }
    
    // Gunakan Firebase User sebagai sumber identitas
    const user = firebase.auth().currentUser;
    if (!user) { console.warn("Not logged in to Firebase"); return null; }
    
    let uName = user.displayName || user.email.split('@')[0] || 'Pengguna';

    const row = {
        user_id: user.uid,
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
        image_url: obsData.image_url || null,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection('observations').add(row);
        console.log("✅ Observation saved to Firestore");
        return { id: docRef.id, ...row };
    } catch (error) {
        console.error("Error saving observation:", error);
        return null;
    }
}

// Upload image to Supabase Storage
async function uploadMonitoringImageToSupabase(file) {
    if (!supabaseClient) return null;
    
    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `lacak_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `monitoring/${fileName}`;

    try {
        const { data, error } = await supabaseClient.storage
            .from('images') // Pastikan bucket 'images' ada di Supabase
            .upload(filePath, file);

        if (error) {
            console.error("Supabase Storage Error:", error);
            return null;
        }

        const { data: publicData } = supabaseClient.storage
            .from('images')
            .getPublicUrl(filePath);

        return publicData.publicUrl;
    } catch (err) {
        console.error("Supabase Upload Error:", err);
        return null;
    }
}

// Save a monitoring/lacak entry -> Pindah ke Firebase Firestore
async function saveLacakEntry(entry) {
    if (!firebaseApp || !db) return null;
    const user = firebase.auth().currentUser;
    if (!user) return null;

    const row = {
        user_id: user.uid,
        plant_name: entry.nama,
        observation_date: entry.tanggal,
        height: entry.tinggi || 0,
        height_unit: entry.satuan || 'cm',
        leaf_count: entry.daun || 0,
        growth_phase: entry.fase,
        health_condition: entry.kondisi,
        notes: entry.catatan || '',
        image_url: entry.image_url || null,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection('monitoring').add(row);
        console.log("✅ Monitoring entry saved to Firestore with ID:", docRef.id);
        return { id: docRef.id, ...row };
    } catch (error) {
        console.error("Error saving monitoring entry to Firestore:", error);
        return null;
    }
}

// Load all user data (observations + monitoring)
async function loadUserData(userId) {
    if (!supabaseClient || !userId) return;

    try {
        // 1. Ambil semua observasi milik user dari Firestore & update dashboard
        if (firebaseApp && db && !window.userObsChannelFirebase) {
            window.userObsChannelFirebase = db.collection('observations')
                .where('user_id', '==', userId)
                .onSnapshot((snapshot) => {
                    const obsData = [];
                    snapshot.forEach(doc => obsData.push({ id: doc.id, ...doc.data() }));
                    
                    // Urutkan terbaru di atas
                    obsData.sort((a, b) => {
                        const dA = a.created_at ? a.created_at.toMillis() : 0;
                        const dB = b.created_at ? b.created_at.toMillis() : 0;
                        return dB - dA;
                    });

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

                    // Kalkulasi Poin Dasar (10 poin per observasi, 5 poin per spesies unik)
                    let totalPoin = (obsCount * 10) + (uniqueSpecies * 5);
                    
                    // Ambil Poin dari Kuis (Firestore)
                    db.collection('quiz_scores')
                        .where('user_id', '==', userId)
                        .get()
                        .then((quizSnap) => {
                            let quizPoints = 0;
                            quizSnap.forEach(doc => {
                                const d = doc.data();
                                if (d.earned_points) quizPoints += d.earned_points;
                            });
                            
                            totalPoin += quizPoints;
                            
                            const elPoin = document.getElementById('k-points');
                            if (elPoin) elPoin.textContent = totalPoin;

                            // Hitung Badge setelah totalPoin final
                            const badges = {
                                'badge-pemula': obsCount >= 1,
                                'badge-fotografer': obsCount >= 10,
                                'badge-pengidentifikasi': identifikasiDibantu >= 5,
                                'badge-botanis': uniqueSpecies >= 25,
                                'badge-penjelajah': locations.size >= 5,
                                'badge-ekologi': totalPoin >= 1000,
                                'badge-research': false,
                                'badge-citizen': false 
                            };

                            Object.keys(badges).forEach(id => {
                                const el = document.getElementById(id);
                                if (el) {
                                    if (badges[id]) el.classList.add('badge-earned');
                                    else el.classList.remove('badge-earned');
                                }
                            });
                        })
                        .catch(err => {
                            console.error("Error fetching quiz points:", err);
                            // Fallback if error
                            const elPoin = document.getElementById('k-points');
                            if (elPoin) elPoin.textContent = totalPoin;
                        });

                    // Trigger Laporan Biodiversitas & Peran Ekologis di app.js
                    if (typeof renderBiodiversityReport === 'function') {
                        renderBiodiversityReport(obsData, uniqueSpecies, families.size);
                    }
                    if (typeof renderEcoRoles === 'function') {
                        renderEcoRoles(obsData);
                    }
                });
        }

        // 2 & 3. Ambil data monitoring (Lacak) dari Firestore dengan Realtime Listener
        if (firebaseApp && db && !window.monitoringChannelFirebase) {
            window.monitoringChannelFirebase = db.collection('monitoring')
                .where('user_id', '==', userId)
                .onSnapshot((snapshot) => {
                    const monitoringData = [];
                    snapshot.forEach(doc => {
                        monitoringData.push({ id: doc.id, ...doc.data() });
                    });
                    
                    monitoringData.sort((a, b) => new Date(a.observation_date) - new Date(b.observation_date));
                    
                    if (typeof updateLacakFromDB === 'function') {
                        updateLacakFromDB(monitoringData);
                    }
                    console.log('Realtime Firebase monitoring data updated.');
                }, (error) => {
                    console.error("Error fetching monitoring data:", error);
                });
        }

        console.log("✅ User data loaded.");
        
        // Load data for "Bantu Identifikasi" cards (other users' observations)
        loadHelpIdentifyData(userId);

    } catch (err) {
        console.error("Error loading user data:", err);
    }
}

// ===== Bantu Identifikasi (Realtime via Firebase) =====
async function loadHelpIdentifyData(currentUserId) {
    if (!db) return;

    try {
        if (!window.helpIdentifyChannelFirebase) {
            window.helpIdentifyChannelFirebase = db.collection('observations')
                .orderBy('created_at', 'desc')
                .limit(20)
                .onSnapshot((snap) => {
                    const data = [];
                    snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
                    if (typeof renderHelpIdentifyCards === 'function') {
                        renderHelpIdentifyCards(data, currentUserId);
                    }
                });
        }
    } catch (err) {
        console.error("Error loading help identify data:", err);
    }
}

// Save quiz score
async function saveQuizScore(score, total, earnedPoints = 0, modId = 'general') {
    if (!db) return;
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        await db.collection('quiz_scores').add({
            user_id: user.uid,
            module_id: modId,
            score: score,
            total_questions: total,
            earned_points: earnedPoints,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("✅ Quiz score and points saved to Firestore.");
    } catch (err) {
        console.error("Error saving quiz score to Firestore:", err);
    }
}

// Fetch all observations for Explore view
async function getAllObservations() {
    if (!db) return [];
    try {
        const snap = await db.collection('observations')
            .orderBy('created_at', 'desc')
            .limit(50)
            .get();
        const data = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        return data;
    } catch (err) {
        console.error("Error fetching all observations:", err);
        return [];
    }
}

// Delete observation
async function deleteObservation(id) {
    if (!db) return false;
    try {
        // 1. Ambil dokumen observasi untuk mendapatkan URL gambar (jika ada)
        const doc = await db.collection('observations').doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.image_url && supabaseClient) {
                try {
                    // Ekstrak nama file/path dari URL publik Supabase
                    // Biasanya polanya: https://[project-ref].supabase.co/storage/v1/object/public/images/monitoring/lacak_xxx.jpg
                    const urlParts = data.image_url.split('/public/images/');
                    if (urlParts.length > 1) {
                        const filePath = urlParts[1];
                        // Hapus file dari Supabase Storage
                        await supabaseClient.storage.from('images').remove([filePath]);
                        console.log("✅ Berhasil menghapus gambar dari Supabase Storage:", filePath);
                    }
                } catch (e) {
                    console.error("Gagal menghapus gambar di Supabase Storage:", e);
                }
            }
        }

        // 2. Hapus dokumen di Firestore
        await db.collection('observations').doc(id).delete();
        console.log("✅ Observasi berhasil dihapus dari Firestore.");
        return true;
    } catch (err) {
        console.error("Error deleting observation:", err);
        return false;
    }
}


// Expose to window for app.js
window.saveObservation = saveObservation;
window.uploadMonitoringImageToSupabase = uploadMonitoringImageToSupabase;
window.saveLacakEntry = saveLacakEntry;
window.saveQuizScore = saveQuizScore;
window.loadUserData = loadUserData;
window.getAllObservations = getAllObservations;
window.deleteObservation = deleteObservation;
