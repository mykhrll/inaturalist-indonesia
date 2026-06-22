// app.js - v4 (with Supabase integration)

let isLoggedIn = false;
let previousView = 'view-home';

// ===== SPA Navigation =====
function navigateTo(viewId, isBack = false) {
    const current = document.querySelector('.view.active');
    if (current && !isBack) previousView = current.id;
    
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Initialize chart when navigating to Lacak
    if (viewId === 'view-lacak') {
        setTimeout(initGrowthChart, 150);
    }
}

function goBack() {
    const target = previousView || (isLoggedIn ? 'view-dashboard' : 'view-home');
    previousView = isLoggedIn ? 'view-dashboard' : 'view-home';
    navigateTo(target, true);
}

// ===== Dashboard Tab Switching =====
function switchDashTab(btnEl, tabName) {
    const tabs = document.querySelectorAll('.dash-tab');
    tabs.forEach(t => t.classList.remove('active'));
    btnEl.classList.add('active');
    
    const dashWelcome = document.querySelector('.dash-welcome-card');
    const dashEmpty = document.querySelector('.dashboard-empty');
    
    if (tabName === 'Semua Kabar') {
        if(dashWelcome) dashWelcome.style.display = 'block';
        if(dashEmpty) {
            dashEmpty.style.display = 'flex';
            dashEmpty.querySelector('p').textContent = 'Belum ada kabar terbaru. Mulai unggah pengamatan atau ikuti naturalis lain!';
        }
    } else if (tabName === 'Konten Anda') {
        if(dashWelcome) dashWelcome.style.display = 'none';
        if(dashEmpty) {
            dashEmpty.style.display = 'flex';
            dashEmpty.querySelector('p').textContent = 'Anda belum mengunggah konten apa pun. Mulai sekarang untuk melihatnya di sini!';
        }
    } else if (tabName === 'Mengikuti') {
        if(dashWelcome) dashWelcome.style.display = 'none';
        if(dashEmpty) {
            dashEmpty.style.display = 'flex';
            dashEmpty.querySelector('p').textContent = 'Anda belum mengikuti siapa pun. Cari dan ikuti peneliti lain untuk melihat pembaruan mereka.';
        }
    }
}

// ===== Generic / Placeholder Page Content Injection =====
function openGenericPage(title) {
    const titleEl = document.getElementById('generic-title');
    const contentEl = document.getElementById('generic-content');
    
    if(titleEl) titleEl.textContent = title;
    
    let html = '';
    
    if (title === 'Donasi') {
        html = `
            <div style="text-align:center; max-width:600px; margin:0 auto;">
                <i class="fas fa-hand-holding-heart" style="font-size: 4rem; color: var(--inat-green); margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.8rem; margin-bottom: 15px;">Dukung Alam Bebas</h3>
                <p style="color: var(--inat-text-medium); line-height: 1.6; margin-bottom: 24px;">iNaturalist adalah organisasi nirlaba. Donasi Anda membantu kami mempertahankan platform ini gratis dan bebas iklan untuk jutaan pecinta alam di seluruh dunia.</p>
                <div style="display:flex; gap:10px; justify-content:center; margin-bottom: 30px;">
                    <button class="btn-outline">Rp 50.000</button>
                    <button class="btn-outline">Rp 100.000</button>
                    <button class="btn-green">Donasi Kustom</button>
                </div>
            </div>
        `;
    } else if (title === 'Toko') {
        html = `
            <div style="text-align:center; max-width:800px; margin:0 auto;">
                <i class="fas fa-store" style="font-size: 3rem; color: #5b4a3f; margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.8rem; margin-bottom: 15px;">Toko Merchandise Resmi</h3>
                <p style="color: var(--inat-text-medium); margin-bottom: 30px;">Dapatkan pakaian dan aksesori berlogo iNaturalist. Semua hasil penjualan disumbangkan untuk operasional server.</p>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
                    <div class="obs-card"><div class="obs-card-img" style="background-image:url('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80')"></div><div class="obs-card-bottom"><span class="obs-card-name">Kaos iNaturalist Classic</span><span class="obs-card-time">Rp 150.000</span></div></div>
                    <div class="obs-card"><div class="obs-card-img" style="background-image:url('https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80')"></div><div class="obs-card-bottom"><span class="obs-card-name">Kaos Edisi Botani</span><span class="obs-card-time">Rp 165.000</span></div></div>
                    <div class="obs-card"><div class="obs-card-img" style="background-image:url('https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=400&q=80')"></div><div class="obs-card-bottom"><span class="obs-card-name">Topi Rimba Explorer</span><span class="obs-card-time">Rp 95.000</span></div></div>
                </div>
            </div>
        `;
    } else if (title === 'Orang' || title === 'Proyek' || title === 'Jurnal' || title === 'Info Taksa' || title === 'Forum') {
        let icon = 'fa-users';
        if(title === 'Proyek') icon = 'fa-briefcase';
        if(title === 'Jurnal') icon = 'fa-book-open';
        if(title === 'Info Taksa') icon = 'fa-sitemap';
        if(title === 'Forum') icon = 'fa-comments';
        
        html = `
            <div style="max-width:800px; margin:0 auto;">
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #ddd;">
                    <i class="fas ${icon}" style="font-size: 2.5rem; color: var(--inat-green);"></i>
                    <div>
                        <h3 style="font-size: 1.5rem; margin:0;">Jelajahi ${title}</h3>
                        <p style="color: var(--inat-text-medium); margin:5px 0 0;">Temukan data, komunitas, dan informasi terkait ${title.toLowerCase()} di seluruh jaringan.</p>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px; margin-bottom: 20px;">
                    <input type="text" placeholder="Cari ${title}..." style="flex:1; padding:10px; border:1px solid #ccc; border-radius:4px;">
                    <button class="btn-green"><i class="fas fa-search"></i> Cari</button>
                </div>
                
                <div style="text-align:center; padding:40px; background:#f9f9f9; border-radius:8px; color:#666;">
                    <i class="fas fa-spinner fa-spin" style="font-size:2rem; margin-bottom:10px;"></i>
                    <p>Memuat direktori ${title.toLowerCase()}...</p>
                </div>
            </div>
        `;
    } else if (title === 'Semua Notifikasi' || title === 'Semua Pesan') {
        let icon = title.includes('Notifikasi') ? 'fa-bell' : 'fa-envelope';
        html = `
            <div style="max-width:600px; margin:0 auto;">
                <h3 style="font-size: 1.5rem; margin-bottom: 20px;"><i class="fas ${icon}"></i> Kotak Masuk: ${title}</h3>
                <div style="background:#fff; border:1px solid #eee; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                    <div style="padding:20px; border-bottom:1px solid #eee; display:flex; align-items:center; gap:15px;">
                        <div style="width:40px; height:40px; background:var(--inat-green); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center;"><i class="fas fa-leaf"></i></div>
                        <div>
                            <strong style="display:block;">Sistem iNaturalist</strong>
                            <span style="font-size:0.85rem; color:#888;">2 hari yang lalu</span>
                        </div>
                    </div>
                    <div style="padding:20px;">
                        <p style="margin:0; line-height:1.5;">Selamat datang di platform iNaturalist versi baru! Mulailah menjelajahi keanekaragaman hayati atau unggah pengamatan pertama Anda hari ini.</p>
                    </div>
                </div>
            </div>
        `;
    } else if (title === 'Profil') {
        let userName = 'Pengguna';
        let userInitial = 'P';
        let stats = { obs: 0, species: 0, idents: 0 };
        
        // Coba ambil data dari elemen header atau local storage
        const profileEl = document.getElementById('profile-name');
        if (profileEl && profileEl.textContent && profileEl.textContent !== 'Pengguna') {
            userName = profileEl.textContent;
            userInitial = userName.charAt(0).toUpperCase();
        } else if (localStorage.getItem('inat_mock_user')) {
            const u = JSON.parse(localStorage.getItem('inat_mock_user'));
            userName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Pengguna';
            userInitial = userName.charAt(0).toUpperCase();
        }

        // Coba hitung pengamatan dari mockDB jika ada
        if (typeof mockDB !== 'undefined' && mockDB.observations) {
            stats.obs = mockDB.observations.length;
            stats.species = new Set(mockDB.observations.map(o => o.speciesName)).size;
        }

        html = `
            <div style="max-width:800px; margin:0 auto; background:var(--inat-bg-white); border-radius:8px; border:1px solid var(--inat-border); overflow:hidden;">
                <div style="background:var(--inat-green); height:150px;"></div>
                <div style="padding:0 30px 30px 30px; position:relative;">
                    <div style="width:100px; height:100px; background:#fff; border-radius:50%; border:4px solid #fff; position:absolute; top:-50px; left:30px; display:flex; align-items:center; justify-content:center; font-size:2.5rem; font-weight:bold; color:var(--inat-green); box-shadow:0 2px 10px rgba(0,0,0,0.1);">${userInitial}</div>
                    <div style="padding-top:60px;">
                        <div style="font-size:1.8rem; font-weight:bold; margin-bottom:5px; color:var(--inat-text-dark);">${userName}</div>
                        <p style="color:var(--inat-text-medium); margin:0 0 15px 0;"><i class="fas fa-map-marker-alt"></i> Indonesia &bull; Bergabung 2026</p>
                        <div style="display:flex; gap:20px; border-top:1px solid var(--inat-border); padding-top:20px;">
                            <div style="text-align:center;"><div style="font-size:1.5rem; font-weight:bold; color:var(--inat-green);">${stats.obs}</div><div style="font-size:0.8rem; color:var(--inat-text-medium); text-transform:uppercase;">Pengamatan</div></div>
                            <div style="text-align:center;"><div style="font-size:1.5rem; font-weight:bold; color:var(--inat-green);">${stats.species}</div><div style="font-size:0.8rem; color:var(--inat-text-medium); text-transform:uppercase;">Spesies</div></div>
                            <div style="text-align:center;"><div style="font-size:1.5rem; font-weight:bold; color:var(--inat-green);">${stats.idents}</div><div style="font-size:0.8rem; color:var(--inat-text-medium); text-transform:uppercase;">Identifikasi</div></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (title === 'Kalender') {
        html = `
            <div style="text-align:center; max-width:800px; margin:0 auto;">
                <i class="fas fa-calendar-alt" style="font-size: 3rem; color: var(--inat-green); margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.8rem; margin-bottom: 15px;">Kalender Pengamatan Anda</h3>
                <p style="color: var(--inat-text-medium); margin-bottom: 30px;">Lacak riwayat pengamatan Anda dari waktu ke waktu. Temukan kapan dan di mana Anda paling aktif di alam bebas.</p>
                <div style="background:var(--inat-bg-white); border:1px solid var(--inat-border); border-radius:8px; padding:30px; min-height:300px; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                    <i class="fas fa-calendar-times" style="font-size:2rem; color:#ccc; margin-bottom:15px;"></i>
                    <p style="color:#777;">Anda belum merekam pengamatan apa pun tahun ini.</p>
                    <button class="btn-green" style="margin-top:15px;" onclick="navigateTo('view-identifikasi')">Buat Pengamatan Baru</button>
                </div>
            </div>
        `;
    } else if (title === 'ID' || title === 'Identifikasi' || title === 'Kontribusi' || title === 'Konten Anda' || title === 'Mengikuti') {
        html = `
            <div style="text-align:center; max-width:800px; margin:0 auto;">
                <i class="fas fa-leaf" style="font-size: 3rem; color: var(--inat-green); margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.8rem; margin-bottom: 15px;">${title}</h3>
                <p style="color: var(--inat-text-medium); margin-bottom: 30px;">Kelola aktivitas <strong>${title}</strong> Anda di iNaturalist. Lihat semua kemajuan dan interaksi komunitas Anda di sini.</p>
                <div style="background:var(--inat-bg-white); border:1px solid var(--inat-border); border-radius:8px; padding:40px 20px; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                    <img src="https://www.inaturalist.org/assets/bird-3211bda3ed82e967a5bf77cda608c0ba0fc4b1cf2da882bc2bb368e738ebfce0.svg" style="width:100px; opacity:0.5; margin-bottom:20px;" alt="Empty State">
                    <h4 style="color:#555; margin-bottom:10px;">Belum Ada Data</h4>
                    <p style="color:#888; max-width:400px; line-height:1.6;">Anda belum memiliki data untuk ditampilkan di halaman ini. Mulailah berinteraksi dengan pengguna lain dan buat pengamatan baru.</p>
                    <button class="btn-outline" style="margin-top:20px;" onclick="navigateTo('view-home')">Jelajahi iNaturalist</button>
                </div>
            </div>
        `;
    } else if (title === 'Pengaturan Akun' || title === 'Pengaturan') {
        let userName = 'Pengguna';
        let userEmail = '';
        
        const profileEl = document.getElementById('profile-name');
        if (profileEl && profileEl.textContent && profileEl.textContent !== 'Pengguna') userName = profileEl.textContent;
        
        if (localStorage.getItem('inat_mock_user')) {
            const u = JSON.parse(localStorage.getItem('inat_mock_user'));
            userName = u.user_metadata?.full_name || u.email?.split('@')[0] || userName;
            userEmail = u.email || '';
        } else if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            // Get from Supabase local storage if available synchronously
            const authKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
            if(authKey) {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(authKey));
                    if(sessionData && sessionData.user) {
                        userName = sessionData.user.user_metadata?.full_name || sessionData.user.email?.split('@')[0] || userName;
                        userEmail = sessionData.user.email || '';
                    }
                } catch(e) {}
            }
        }
        
        html = `
            <div style="max-width:600px; margin:0 auto; background:var(--inat-bg-white); border-radius:8px; border:1px solid var(--inat-border); padding:30px;">
                <h3 style="font-size: 1.5rem; margin-bottom: 25px; border-bottom:1px solid var(--inat-border); padding-bottom:10px;"><i class="fas fa-cog"></i> Pengaturan Akun</h3>
                
                <div style="margin-bottom: 20px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px; color:var(--inat-text-dark);">Nama Tampilan</label>
                    <input type="text" value="${userName}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px; color:var(--inat-text-dark);">Email</label>
                    <input type="email" value="${userEmail}" placeholder="contoh@email.com" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px; color:var(--inat-text-dark);">Notifikasi Email</label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                        <input type="checkbox" checked> Kirim pembaruan saat ada yang mengidentifikasi pengamatan saya
                    </label>
                </div>
                
                <button class="btn-green" style="width:100%; padding:12px; font-size:1rem; margin-top:10px;" onclick="alert('Pengaturan berhasil disimpan!')">Simpan Perubahan</button>
            </div>
        `;
    } else {
        // Fallback for others (Panduan, Tempat, Statistik Situs, Bantuan, Memulai, Video Tutorial)
        html = `
            <div style="text-align:center; max-width:600px; margin:0 auto;">
                <i class="fas fa-book-reader" style="font-size: 4rem; color: var(--inat-green); margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px;">Pusat Panduan: ${title}</h3>
                <p style="color: var(--inat-text-medium); line-height: 1.6; margin-bottom: 24px;">Halaman ini berisi dokumentasi, panduan pengguna, dan informasi referensi terkait <strong>${title}</strong>.</p>
                <div style="background:var(--inat-bg-gray); padding:20px; border-radius:8px; text-align:left;">
                    <ul style="margin:0; padding-left:20px; line-height:1.8; color:var(--inat-text-dark);">
                        <li>Pendahuluan dasar penggunaan</li>
                        <li>Video langkah-demi-langkah</li>
                        <li>Daftar pertanyaan yang sering diajukan (FAQ)</li>
                        <li>Kontak dukungan komunitas</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    if(contentEl) contentEl.innerHTML = html;
    
    navigateTo('view-generic');
}

// ===== Observation Detail Modal =====
function showObsDetail(name, sciName, location, obsId = null) {
    const content = document.getElementById('obs-detail-content');
    content.innerHTML = `
        <h3>${name}</h3>
        <p class="detail-sci">${sciName}</p>
        <p class="detail-loc"><i class="fas fa-map-marker-alt"></i> ${location}</p>
        <p style="font-size:.88rem; color:#666; margin-bottom:14px;">Pengamatan ini menunjukkan spesies ${name} (<em>${sciName}</em>) yang diamati di wilayah ${location}.</p>
        <div class="detail-actions">
            <button class="btn-green btn-sm" onclick="closeObsDetail(); navigateTo('view-identifikasi');">
                <i class="fas fa-leaf"></i> Identifikasi Serupa
            </button>
            ${obsId ? `<button class="btn-outline btn-sm" style="color:var(--inat-error); border-color:var(--inat-error);" onclick="handleDeleteObservation('${obsId}')"><i class="fas fa-trash"></i> Hapus</button>` : ''}
            <button class="btn-outline btn-sm" onclick="closeObsDetail();">Tutup</button>
        </div>
    `;
    document.getElementById('obs-detail-modal').classList.add('active');
}

async function handleDeleteObservation(id) {
    if(confirm("Apakah Anda yakin ingin menghapus observasi ini?")) {
        closeObsDetail();
        const success = await (typeof deleteObservation === 'function' ? deleteObservation(id) : Promise.resolve(false));
        if (success) {
            if (typeof showToast === 'function') showToast("Observasi berhasil dihapus.");
            loadExploreDataFromDB(); // Reload data
            if (typeof loadUserData === 'function') {
                const currentUserStr = localStorage.getItem('inat_user');
                if (currentUserStr) loadUserData(JSON.parse(currentUserStr).id);
            }
        } else {
            alert("Gagal menghapus observasi.");
        }
    }
}

function closeObsDetail() {
    document.getElementById('obs-detail-modal').classList.remove('active');
}

// ===== Explore View Switcher =====
function switchExploreView(view) {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
    
    document.getElementById('explore-map-view').classList.add('hidden');
    document.getElementById('explore-grid-view').classList.add('hidden');
    document.getElementById('explore-list-view').classList.add('hidden');
    
    const target = document.getElementById(`explore-${view}-view`);
    if (target) target.classList.remove('hidden');

    if (view === 'map' && exploreMap) {
        setTimeout(() => exploreMap.invalidateSize(), 100);
    }
}

// ===== Leaflet Map Setup =====
let exploreMap = null;
let markersLayer = null;

function initExploreMap() {
    if (exploreMap) return;
    const mapEl = document.getElementById('real-map');
    if (!mapEl) return;
    
    exploreMap = L.map('real-map').setView([-2.5489, 118.0149], 5); // Center on Indonesia
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(exploreMap);
    
    markersLayer = L.layerGroup().addTo(exploreMap);
}

// Helper: Estimate coordinates from text location (adds slight randomness within land bounds)
function getCoordinatesForLocation(locStr) {
    locStr = (locStr || "").toLowerCase();
    
    // Center points and radius (in degrees) to ensure points stay primarily on land
    const regions = [
        { name: 'papua', center: [-4.26, 138.08], radius: 1.5 },
        { name: 'maluku', center: [-2.0, 128.0], radius: 0.5 },
        { name: 'sulawesi', center: [-2.21, 120.40], radius: 1.0 },
        { name: 'celebes', center: [-2.21, 120.40], radius: 1.0 },
        { name: 'kalimantan', center: [0.0, 114.0], radius: 1.5 },
        { name: 'borneo', center: [0.0, 114.0], radius: 1.5 },
        { name: 'nusa tenggara', center: [-8.65, 121.07], radius: 0.2 },
        { name: 'bali', center: [-8.34, 115.09], radius: 0.05 },
        { name: 'jawa', center: [-7.61, 110.71], radius: 0.3 },
        { name: 'java', center: [-7.61, 110.71], radius: 0.3 },
        { name: 'sumatera', center: [-0.58, 101.34], radius: 1.0 },
        { name: 'sumatra', center: [-0.58, 101.34], radius: 1.0 },
        { name: 'australia', center: [-25.27, 133.77], radius: 3.0 },
        { name: 'amerika', center: [37.09, -95.71], radius: 5.0 },
        { name: 'eropa', center: [48.0, 14.0], radius: 3.0 },
        { name: 'afrika', center: [0.0, 25.0], radius: 5.0 },
        { name: 'jepang', center: [36.20, 138.25], radius: 1.0 },
        { name: 'japan', center: [36.20, 138.25], radius: 1.0 },
        { name: 'cina', center: [35.86, 104.19], radius: 3.0 },
        { name: 'tiongkok', center: [35.86, 104.19], radius: 3.0 },
        { name: 'asia', center: [34.0, 100.6], radius: 3.0 },
        { name: 'madagaskar', center: [-18.76, 46.86], radius: 1.0 }
    ];

    let bestMatch = null;
    let earliestIndex = Infinity;

    for (const r of regions) {
        const idx = locStr.indexOf(r.name);
        if (idx !== -1 && idx < earliestIndex) {
            earliestIndex = idx;
            bestMatch = r;
        }
    }

    // Default to a central point in Indonesia if unknown
    let target = bestMatch || { center: [-2.0, 118.0], radius: 2.0 };

    // Generate random coordinate within radius
    const lat = target.center[0] + (Math.random() * target.radius * 2 - target.radius);
    const lng = target.center[1] + (Math.random() * target.radius * 2 - target.radius);
    
    return [lat, lng];
}

// Load Explore Data from Supabase
async function loadExploreDataFromDB() {
    if (typeof getAllObservations !== 'function') return;
    
    const obsGrid = document.getElementById('obs-grid');
    const obsList = document.getElementById('obs-list-body');
    const searchSpecies = document.getElementById('explore-species')?.value.toLowerCase() || '';
    const searchLocation = document.getElementById('explore-location')?.value.toLowerCase() || '';
    
    if (!obsGrid || !obsList) return;
    
    let data = await getAllObservations();
    
    // Apply filters if any
    if (searchSpecies || searchLocation) {
        data = data.filter(obs => {
            const name = (obs.species_name || '').toLowerCase();
            const sci = (obs.scientific_name || '').toLowerCase();
            const loc = (obs.distribution_indonesia || '').toLowerCase();
            
            const matchSpecies = searchSpecies ? (name.includes(searchSpecies) || sci.includes(searchSpecies)) : true;
            const matchLocation = searchLocation ? loc.includes(searchLocation) : true;
            
            return matchSpecies && matchLocation;
        });
    }
    
    initExploreMap();
    if (markersLayer) markersLayer.clearLayers();

    if (!data || data.length === 0) {
        obsGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column:1/-1;">Belum ada observasi yang dibagikan.</div>';
        obsList.innerHTML = '<tr><td colspan="5" style="text-align:center;">Belum ada observasi yang dibagikan.</td></tr>';
        return;
    }
    
    obsGrid.innerHTML = '';
    obsList.innerHTML = '';
    
    data.forEach(obs => {
        const name = obs.species_name || 'Spesies Tak Dikenal';
        const sciName = obs.scientific_name || 'Spesies tidak diketahui';
        const location = obs.distribution_indonesia || 'Indonesia';
        const habitat = obs.habitat || '-';
        
        // Buat format waktu (misal: "2 jam lalu")
        const dateObj = new Date(obs.created_at);
        const diffMs = new Date() - dateObj;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        let timeStr = diffDays > 0 ? `${diffDays} hari lalu` : `${diffHours} jam lalu`;
        if (diffHours === 0) timeStr = 'Baru saja';
        
        // Thumbnail avatar dari huruf pertama
        const avatarChar = name.charAt(0).toUpperCase();
        
        // Placeholder gambar jika tidak ada
        const imgUrl = obs.image_base64 && obs.image_base64.startsWith('http') 
            ? obs.image_base64 
            : (obs.image_base64 || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/600px-No_Image_Available.jpg');

        // Tambahkan ke Grid
        const card = document.createElement('div');
        card.className = 'obs-card';
        card.onclick = () => showObsDetail(name, sciName, location, obs.id);
        card.innerHTML = `
            <div class="obs-card-img" style="background-image: url('${imgUrl}')"></div>
            <div class="obs-card-bottom">
                <div class="obs-card-avatar">${avatarChar}</div>
                <span class="obs-card-name">${name}</span>
                <span class="obs-card-time">${timeStr}</span>
            </div>
        `;
        obsGrid.appendChild(card);
        
        // Tambahkan ke List
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${name}</td>
            <td><em>${sciName}</em></td>
            <td>${location}</td>
            <td>${habitat}</td>
            <td>${timeStr}</td>
        `;
        obsList.appendChild(tr);

        // Tambahkan ke Peta Leaflet
        if (exploreMap && markersLayer) {
            const coords = getCoordinatesForLocation(location);
            L.marker(coords).addTo(markersLayer)
                .bindPopup(`
                    <div style="text-align:center;">
                        <img src="${imgUrl}" style="width:100px; height:70px; object-fit:cover; border-radius:4px; margin-bottom:5px;">
                        <br><strong>${name}</strong><br><em>${sciName}</em>
                    </div>
                `);
        }
    });
}

// ===== Auth Modal Logic =====
const authModal = document.getElementById('auth-modal');
const closeModalBtn = document.getElementById('close-modal');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

// Open login modal
document.getElementById('btn-open-login').addEventListener('click', (e) => {
    e.preventDefault();
    authModal.classList.add('active');
});

// Close modal
closeModalBtn.addEventListener('click', () => authModal.classList.remove('active'));

// Close any modal on overlay click
window.addEventListener('click', (e) => {
    if (e.target === authModal) authModal.classList.remove('active');
    const obsModal = document.getElementById('obs-detail-modal');
    if (obsModal && e.target === obsModal) closeObsDetail();
    const modDetail = document.getElementById('module-detail');
    if (modDetail && e.target === modDetail) modDetail.classList.add('hidden');
});

// Auth tab switching
tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    formLogin.classList.add('active'); formRegister.classList.remove('active');
});
tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    formRegister.classList.add('active'); formLogin.classList.remove('active');
});

// Hero join button
document.getElementById('btn-join-hero').addEventListener('click', () => {
    if (isLoggedIn) {
        navigateTo('view-dashboard');
    } else {
        authModal.classList.add('active');
        tabRegister.click();
    }
});

// ===== Dropdown Logic for Navbar =====
function toggleDropdown(id) {
    // Close others first
    const dropdowns = ['msg-dropdown', 'notif-dropdown', 'profile-dropdown'];
    dropdowns.forEach(dId => {
        if (dId !== id) {
            const el = document.getElementById(dId);
            if (el) {
                el.classList.remove('active');
                el.classList.remove('show');
            }
        }
    });

    const target = document.getElementById(id);
    if (target) {
        target.classList.toggle('active');
        target.classList.toggle('show');
    }
}

// Close dropdowns on click elsewhere
document.addEventListener('click', (e) => {
    const isTrigger = e.target.closest('.nav-icon-wrapper') || e.target.closest('.profile-trigger');
    if (!isTrigger) {
        ['msg-dropdown', 'notif-dropdown', 'profile-dropdown'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('active');
                el.classList.remove('show');
            }
        });
    }
});

// ===== Switch Navbar on Auth State =====
function switchToLoggedInUI() {
    isLoggedIn = true;
    document.getElementById('navbar-loggedout').classList.add('hidden');
    document.getElementById('navbar-loggedin').classList.remove('hidden');
    if (document.getElementById('view-home').classList.contains('active')) {
        navigateTo('view-dashboard');
    }
}

function switchToLoggedOutUI() {
    isLoggedIn = false;
    document.getElementById('navbar-loggedout').classList.remove('hidden');
    document.getElementById('navbar-loggedin').classList.add('hidden');
    navigateTo('view-home');
}

// =====================================================
// ===== LACAK (TRACK) - Growth Monitoring =====
// =====================================================
let lacakData = [];

let growthChart = null;

// Called from auth.js when DB data loads
function updateLacakFromDB(dbEntries) {
    if (!dbEntries || dbEntries.length === 0) {
        lacakData = [];
        renderTimeline();
        if (growthChart) {
            growthChart.destroy();
            growthChart = null;
        }
        return;
    }
    
    lacakData = dbEntries.map(e => ({
        nama: e.plant_name,
        tanggal: e.observation_date,
        tinggi: e.height_cm,
        daun: e.leaf_count,
        fase: e.growth_phase,
        kondisi: e.health_condition,
        catatan: e.notes
    }));
    
    renderTimeline();
    
    if (document.getElementById('view-lacak').classList.contains('active')) {
        initGrowthChart();
    }
}

function initGrowthChart() {
    const ctx = document.getElementById('growthChart');
    if (!ctx) return;

    if (growthChart) growthChart.destroy();

    const labels = lacakData.map(d => {
        const date = new Date(d.tanggal);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    });
    const heights = lacakData.map(d => d.tinggi);
    const leaves = lacakData.map(d => d.daun);

    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tinggi (cm)',
                    data: heights,
                    borderColor: '#74ac00',
                    backgroundColor: 'rgba(116,172,0,0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#74ac00'
                },
                {
                    label: 'Jumlah Daun',
                    data: leaves,
                    borderColor: '#2b78e4',
                    backgroundColor: 'rgba(43,120,228,0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#2b78e4'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Grafik Pertumbuhan Tumbuhan', font: { size: 14 } }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Nilai' } },
                x: { title: { display: true, text: 'Tanggal Pemantauan' } }
            }
        }
    });
}

function renderTimeline() {
    const timeline = document.getElementById('lacak-timeline-list');
    if (!timeline) return;

    if (lacakData.length === 0) {
        timeline.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Belum ada riwayat pemantauan. Silakan mulai merekam perkembangan tumbuhan Anda.</p>';
        return;
    }

    const faseEmoji = { Perkecambahan: '🌱', Vegetatif: '🌿', Berbunga: '🌸', Berbuah: '🍎', Dormansi: '🍂' };
    const kondisiEmoji = { Sehat: '✅', 'Stres Ringan': '⚠️', 'Terserang Hama': '🐛', Layu: '🥀' };

    // Sort by date descending
    const sorted = [...lacakData].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    timeline.innerHTML = sorted.map(entry => {
        const dateStr = new Date(entry.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        return `
            <div class="timeline-entry">
                <div class="timeline-dot fase-${entry.fase}"></div>
                <div class="timeline-content">
                    <div class="timeline-header"><strong>${entry.nama}</strong><span class="timeline-date">${dateStr}</span></div>
                    <div class="timeline-details">
                        <span>📏 Tinggi: ${entry.tinggi} cm</span><span>🍃 Daun: ${entry.daun}</span><span>${faseEmoji[entry.fase] || ''} Fase: ${entry.fase}</span><span>${kondisiEmoji[entry.kondisi] || ''} Kondisi: ${entry.kondisi}</span>
                    </div>
                    ${entry.catatan ? `<p class="timeline-note">${entry.catatan}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function addLacakEntry() {
    const nama = document.getElementById('lacak-nama').value.trim();
    const tanggal = document.getElementById('lacak-tanggal').value;
    const tinggi = parseInt(document.getElementById('lacak-tinggi').value) || 0;
    const daun = parseInt(document.getElementById('lacak-daun').value) || 0;
    const fase = document.getElementById('lacak-fase').value;
    const kondisi = document.getElementById('lacak-kondisi').value;
    const catatan = document.getElementById('lacak-catatan').value.trim();

    if (!nama || !tanggal) {
        alert('Harap isi nama tumbuhan dan tanggal pemantauan.');
        return;
    }

    const btn = document.querySelector('.lacak-add .btn-green');
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    btn.disabled = true;

    try {
        const entry = { nama, tanggal, tinggi, daun, fase, kondisi, catatan };

        // Save to Supabase (Realtime will handle the UI update)
        if (typeof saveLacakEntry === 'function' && typeof supabaseClient !== 'undefined' && supabaseClient) {
            await saveLacakEntry(entry);
        } else {
            // Fallback for mock/local without Supabase
            lacakData.push(entry);
            renderTimeline();
            initGrowthChart();
        }

        // Clear form
        document.getElementById('lacak-nama').value = '';
        document.getElementById('lacak-tanggal').value = '';
        document.getElementById('lacak-tinggi').value = '';
        document.getElementById('lacak-daun').value = '';
        document.getElementById('lacak-catatan').value = '';

        // Show success toast
        showToast('Catatan pemantauan berhasil disimpan!');
    } catch (e) {
        console.error("Gagal menyimpan catatan:", e);
        alert("Gagal menyimpan catatan pemantauan.");
    } finally {
        btn.innerHTML = oldText;
        btn.disabled = false;
    }
}

// ===== Toast notification =====
function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =====================================================
// ===== BELAJAR (LEARN) - Modules & Quiz =====
// =====================================================

const moduleContents = {
    mod1: {
        title: '🌱 Fotosintesis & Produktivitas Primer',
        content: `
            <h3>Fotosintesis & Produktivitas Primer</h3>
            <p>Fotosintesis adalah proses biokimia fundamental di mana tumbuhan mengubah energi cahaya matahari menjadi energi kimia dalam bentuk glukosa. Proses ini terjadi di kloroplas, organel sel yang mengandung pigmen klorofil.</p>
            <h4>Reaksi Fotosintesis</h4>
            <p><code>6CO₂ + 6H₂O + cahaya → C₆H₁₂O₆ + 6O₂</code></p>
            <h4>Peran Ekologis</h4>
            <ul>
                <li><strong>Produsen primer:</strong> Tumbuhan menghasilkan sekitar 110 miliar ton karbon per tahun melalui fotosintesis terestrial</li>
                <li><strong>Penyedia oksigen:</strong> Fotosintesis menghasilkan oksigen yang dibutuhkan hampir semua organisme aerob</li>
                <li><strong>Basis rantai makanan:</strong> Energi yang disimpan tumbuhan mengalir ke herbivora, karnivora, dan dekomposer</li>
                <li><strong>Siklus karbon:</strong> Tumbuhan menyerap CO₂ atmosfer, berperan penting dalam regulasi iklim global</li>
            </ul>
            <h4>Produktivitas Primer di Indonesia</h4>
            <p>Hutan hujan tropis Indonesia termasuk ekosistem dengan produktivitas primer tertinggi di dunia, menghasilkan biomassa sekitar 1.000-3.500 g/m²/tahun. Hal ini disebabkan oleh intensitas cahaya yang tinggi, curah hujan melimpah, dan suhu yang optimal sepanjang tahun.</p>
        `
    },
    mod2: {
        title: '🌿 Adaptasi Tumbuhan Tropis',
        content: `
            <h3>Adaptasi Tumbuhan Tropis Indonesia</h3>
            <p>Tumbuhan tropis Indonesia telah mengembangkan berbagai strategi adaptasi untuk bertahan hidup di lingkungan yang khas: kelembapan tinggi, kompetisi cahaya di bawah kanopi, dan ketersediaan nutrisi tanah yang bervariasi.</p>
            <h4>Jenis-Jenis Adaptasi</h4>
            <ul>
                <li><strong>Daun lebar (megafili):</strong> Memaksimalkan penangkapan cahaya di lantai hutan yang gelap. Contoh: Tumbuhan famili Araceae</li>
                <li><strong>Drip tips:</strong> Ujung daun yang meruncing membantu mengalirkan air hujan dengan cepat untuk mencegah pertumbuhan jamur dan lumut</li>
                <li><strong>Akar gantung & akar tunjang:</strong> Akar buttress pada pohon-pohon besar memberikan stabilitas di tanah tropis yang dangkal</li>
                <li><strong>Epifitisme:</strong> Anggrek, paku-pakuan, dan lumut tumbuh di atas pohon lain untuk mendapatkan akses cahaya tanpa bersifat parasit</li>
                <li><strong>Simbiosis mikoriza:</strong> Lebih dari 80% tumbuhan tropis memiliki simbiosis dengan jamur mikoriza untuk meningkatkan penyerapan nutrisi</li>
                <li><strong>Cauliflory:</strong> Buah dan bunga muncul langsung dari batang utama, memudahkan penyerbukan oleh kelelawar dan serangga</li>
            </ul>
            <h4>Contoh Adaptasi Unik Flora Indonesia</h4>
            <p>Rafflesia arnoldii — bunga parasit terbesar di dunia yang telah kehilangan seluruh organ vegetatifnya dan hidup sepenuhnya bergantung pada inangnya (Tetrastigma). Ini merupakan adaptasi ekstrem menuju parasitisme obligat.</p>
        `
    },
    mod3: {
        title: '🌺 Penyerbukan & Keanekaragaman',
        content: `
            <h3>Penyerbukan & Keanekaragaman Genetik</h3>
            <p>Penyerbukan merupakan proses krusial dalam reproduksi tumbuhan berbunga (Angiospermae) yang melibatkan transfer serbuk sari dari anther ke stigma.</p>
            <h4>Tipe-Tipe Penyerbukan</h4>
            <ul>
                <li><strong>Entomofili:</strong> Penyerbukan oleh serangga (lebah, kupu-kupu, kumbang) — paling umum di daerah tropis</li>
                <li><strong>Ornitofili:</strong> Penyerbukan oleh burung (contoh: burung madu pada bunga Heliconia)</li>
                <li><strong>Kiropteri:</strong> Penyerbukan oleh kelelawar (contoh: bunga durian mekar di malam hari)</li>
                <li><strong>Anemofili:</strong> Penyerbukan oleh angin (contoh: rumput-rumputan, pinus)</li>
            </ul>
            <h4>Pentingnya Bagi Keanekaragaman</h4>
            <p>Penyerbukan silang menghasilkan variasi genetik yang tinggi dalam populasi tumbuhan, meningkatkan kemampuan adaptasi terhadap perubahan lingkungan dan penyakit. Hilangnya polinator dapat mengancam keanekaragaman hayati secara keseluruhan.</p>
        `
    },
    mod4: {
        title: '🌳 Suksesi & Restorasi Ekosistem',
        content: `
            <h3>Suksesi Ekologi & Restorasi Hutan</h3>
            <p>Suksesi ekologi adalah proses perubahan komunitas tumbuhan secara bertahap dalam suatu area dari waktu ke waktu, dari komunitas pionir menuju komunitas klimaks.</p>
            <h4>Tahapan Suksesi</h4>
            <ul>
                <li><strong>Suksesi primer:</strong> Terjadi di lahan yang belum pernah ditumbuhi vegetasi (contoh: lahan pasca erupsi gunung berapi)</li>
                <li><strong>Suksesi sekunder:</strong> Terjadi di lahan yang pernah memiliki vegetasi namun mengalami gangguan (contoh: lahan bekas kebakaran)</li>
                <li><strong>Tumbuhan perintis:</strong> Spesies pertama yang mengkolonisasi (contoh: Macaranga, Imperata cylindrica)</li>
                <li><strong>Komunitas klimaks:</strong> Tahap akhir yang relatif stabil dan didominasi pohon-pohon besar</li>
            </ul>
            <h4>Aplikasi dalam Restorasi</h4>
            <p>Pemahaman suksesi ekologi penting dalam upaya restorasi hutan tropis Indonesia. Penanaman tumbuhan perintis yang tepat dapat mempercepat proses pemulihan ekosistem yang terdegradasi.</p>
        `
    },
    mod5: {
        title: '🍃 Jasa Ekosistem Tumbuhan',
        content: `
            <h3>Jasa Ekosistem yang Disediakan Tumbuhan</h3>
            <p>Tumbuhan menyediakan berbagai jasa ekosistem yang sangat penting bagi kehidupan manusia dan keseimbangan bumi.</p>
            <h4>Kategori Jasa Ekosistem</h4>
            <ul>
                <li><strong>Jasa Penyediaan:</strong> Pangan, kayu, obat-obatan, serat, dan bahan bakar</li>
                <li><strong>Jasa Pengaturan:</strong> Regulasi iklim (sekuestrasi karbon), pengendalian banjir, pencegahan erosi, pemurnian air dan udara</li>
                <li><strong>Jasa Pendukung:</strong> Siklus nutrisi, pembentukan tanah, produksi oksigen, habitat bagi organisme lain</li>
                <li><strong>Jasa Budaya:</strong> Rekreasi, estetika, spiritual, pendidikan, dan inspirasi</li>
            </ul>
            <h4>Data Penting</h4>
            <p>Hutan Indonesia menyimpan sekitar 25,18 miliar ton karbon, menjadikannya salah satu penyimpan karbon terbesar di dunia. Mangrove Indonesia (terbesar di dunia) melindungi garis pantai dari abrasi dan badai.</p>
        `
    },
    mod6: {
        title: '🔬 Etnobotani Indonesia',
        content: `
            <h3>Etnobotani: Hubungan Manusia dan Tumbuhan di Indonesia</h3>
            <p>Etnobotani mempelajari interaksi antara masyarakat tradisional dengan tumbuhan dalam konteks budaya, pengobatan, dan kehidupan sehari-hari.</p>
            <h4>Kategori Pemanfaatan</h4>
            <ul>
                <li><strong>Tumbuhan obat:</strong> Kunyit (Curcuma longa), jahe (Zingiber officinale), temulawak (Curcuma xanthorrhiza) — digunakan dalam jamu tradisional</li>
                <li><strong>Tumbuhan pangan:</strong> Sagu (Metroxylon sagu) di Papua, aren (Arenga pinnata) di Sulawesi, dan berbagai umbi-umbian lokal</li>
                <li><strong>Tumbuhan ritual:</strong> Pinang (Areca catechu) dan sirih (Piper betle) dalam tradisi perkawinan dan upacara adat</li>
                <li><strong>Tumbuhan kerajinan:</strong> Rotan (Calamus spp.) untuk anyaman, bambu (Bambusa spp.) untuk konstruksi</li>
            </ul>
            <h4>Konservasi Pengetahuan</h4>
            <p>Indonesia memiliki sekitar 1.300 suku bangsa dengan pengetahuan etnobotani yang kaya namun rentan hilang. Dokumentasi pengetahuan tradisional ini penting untuk pelestarian keanekaragaman hayati dan pengembangan obat baru.</p>
        `
    }
};

function toggleModule(modId) {
    const detail = document.getElementById('module-detail');
    const content = document.getElementById('module-content');
    const mod = moduleContents[modId];

    if (mod) {
        content.innerHTML = mod.content;
        detail.classList.remove('hidden');
    }
}

// ===== Quiz System =====
const quizQuestions = [
    {
        question: 'Apa peran utama tumbuhan sebagai produsen dalam ekosistem?',
        options: [
            { text: 'Mengubah energi cahaya menjadi energi kimia melalui fotosintesis', correct: true },
            { text: 'Menguraikan bahan organik menjadi anorganik', correct: false },
            { text: 'Memangsa organisme yang lebih kecil', correct: false },
            { text: 'Menyerap nutrisi dari organisme inang', correct: false }
        ],
        explanation: 'Tumbuhan adalah produsen primer yang mengubah energi cahaya matahari menjadi glukosa melalui fotosintesis, menjadi dasar rantai makanan.'
    },
    {
        question: 'Apa fungsi "drip tips" (ujung daun meruncing) pada tumbuhan tropis?',
        options: [
            { text: 'Menarik polinator', correct: false },
            { text: 'Mengalirkan air hujan untuk mencegah pertumbuhan jamur', correct: true },
            { text: 'Menyimpan cadangan air', correct: false },
            { text: 'Meningkatkan fotosintesis', correct: false }
        ],
        explanation: 'Drip tips membantu mengalirkan air hujan dari permukaan daun dengan cepat, mencegah kolonisasi jamur, alga, dan lumut yang dapat menghalangi fotosintesis.'
    },
    {
        question: 'Rafflesia arnoldii merupakan contoh tumbuhan dengan adaptasi berupa...',
        options: [
            { text: 'Epifitisme obligat', correct: false },
            { text: 'Parasitisme obligat (holoparasit)', correct: true },
            { text: 'Autotrofi dengan daun besar', correct: false },
            { text: 'Simbiosis mikoriza', correct: false }
        ],
        explanation: 'Rafflesia arnoldii adalah holoparasit yang telah kehilangan seluruh organ vegetatifnya dan hidup sepenuhnya bergantung pada tumbuhan inang Tetrastigma.'
    },
    {
        question: 'Apa yang dimaksud dengan suksesi sekunder?',
        options: [
            { text: 'Kolonisasi pertama pada lahan vulkanik baru', correct: false },
            { text: 'Proses tumbuhan menjadi parasit', correct: false },
            { text: 'Pemulihan vegetasi pada lahan yang pernah memiliki komunitas tumbuhan', correct: true },
            { text: 'Migrasi spesies ke habitat baru', correct: false }
        ],
        explanation: 'Suksesi sekunder terjadi pada lahan yang sebelumnya sudah memiliki komunitas tumbuhan namun mengalami gangguan (kebakaran, penebangan), sehingga proses pemulihan dimulai kembali.'
    },
    {
        question: 'Mangrove Indonesia berperan penting dalam jasa ekosistem berupa...',
        options: [
            { text: 'Menghasilkan buah untuk konsumsi manusia', correct: false },
            { text: 'Menyediakan kayu bakar berkualitas tinggi', correct: false },
            { text: 'Melindungi garis pantai dan menyimpan karbon biru', correct: true },
            { text: 'Menghasilkan oksigen terbanyak di dunia', correct: false }
        ],
        explanation: 'Mangrove Indonesia (terluas di dunia) berperan krusial dalam melindungi garis pantai dari abrasi dan badai, serta menyimpan karbon "biru" hingga 5 kali lebih banyak dari hutan daratan.'
    }
];

let currentQuiz = 0;
let quizScore = 0;

function renderQuiz() {
    if (currentQuiz >= quizQuestions.length) {
        showQuizScore();
        return;
    }

    const q = quizQuestions[currentQuiz];
    document.getElementById('quiz-question').textContent = q.question;
    document.getElementById('quiz-progress-text').textContent = `Pertanyaan ${currentQuiz + 1} dari ${quizQuestions.length}`;
    document.getElementById('quiz-progress-fill').style.width = `${((currentQuiz + 1) / quizQuestions.length) * 100}%`;

    const optionsEl = document.getElementById('quiz-options');
    optionsEl.innerHTML = '';
    q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt.text;
        btn.onclick = function() { checkQuiz(this, opt.correct); };
        optionsEl.appendChild(btn);
    });

    document.getElementById('quiz-feedback').classList.add('hidden');
    document.getElementById('quiz-next').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('quiz-score').classList.add('hidden');
}

function checkQuiz(btn, isCorrect) {
    const allBtns = document.querySelectorAll('#quiz-options .quiz-option');
    allBtns.forEach(b => {
        b.disabled = true;
        b.style.pointerEvents = 'none';
    });

    const feedback = document.getElementById('quiz-feedback');
    const q = quizQuestions[currentQuiz];

    if (isCorrect) {
        btn.classList.add('correct');
        quizScore++;
        feedback.className = 'quiz-feedback correct';
        feedback.innerHTML = `<strong>✅ Benar!</strong> ${q.explanation}`;
    } else {
        btn.classList.add('wrong');
        allBtns.forEach((b, idx) => {
            if (q.options[idx] && q.options[idx].correct) b.classList.add('correct');
        });
        feedback.className = 'quiz-feedback wrong';
        feedback.innerHTML = `<strong>❌ Kurang tepat.</strong> ${q.explanation}`;
    }

    feedback.classList.remove('hidden');
    document.getElementById('quiz-next').classList.remove('hidden');
}

function nextQuiz() {
    currentQuiz++;
    renderQuiz();
}

function showQuizScore() {
    document.getElementById('quiz-container').classList.add('hidden');
    const scoreEl = document.getElementById('quiz-score');
    const pct = Math.round((quizScore / quizQuestions.length) * 100);
    let message = '';
    if (pct >= 80) message = 'Luar biasa! Anda memiliki pemahaman yang sangat baik tentang ekologi tumbuhan. 🎉';
    else if (pct >= 60) message = 'Bagus! Anda sudah memahami dasar-dasar ekologi tumbuhan. 👍';
    else message = 'Terus belajar! Baca kembali modul untuk meningkatkan pemahaman Anda. 📖';

    scoreEl.innerHTML = `
        <h3>🎓 Hasil Kuis Anda</h3>
        <div class="score-num">${quizScore}/${quizQuestions.length}</div>
        <p>${message}</p>
        <button class="btn-green" onclick="currentQuiz=0; quizScore=0; renderQuiz();" style="margin-top:14px;">
            <i class="fas fa-redo"></i> Ulangi Kuis
        </button>
    `;
    scoreEl.classList.remove('hidden');

    // Save quiz score to Supabase
    if (typeof saveQuizScore === 'function') {
        saveQuizScore(quizScore, quizQuestions.length);
    }
}

// ===== Global Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    // Attempt to load explore data from DB initially
    setTimeout(() => {
        if (typeof loadExploreDataFromDB === 'function') {
            loadExploreDataFromDB();
        }
    }, 1000);

    // Event listeners for Explore Search
    const btnExploreSearch = document.getElementById('btn-explore-search');
    if (btnExploreSearch) {
        btnExploreSearch.addEventListener('click', loadExploreDataFromDB);
    }
    
    // Press Enter to search
    const exploreInputs = ['explore-species', 'explore-location'];
    exploreInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') loadExploreDataFromDB();
            });
        }
    });
});

// Initialize quiz on page load
document.addEventListener('DOMContentLoaded', () => {
    renderQuiz();
});

// ===== Render Bantu Identifikasi Cards =====
function renderHelpIdentifyCards(observations, currentUserId) {
    const container = document.getElementById('help-identify-container');
    if (!container) return;

    // Filter out user's own observations and take up to 3 latest
    const otherObs = observations.filter(obs => obs.user_id !== currentUserId).slice(0, 3);

    if (otherObs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 20px; color: #666;">
                <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 24px; margin-bottom: 10px;"></i><br>
                Saat ini belum ada observasi dari pengguna lain yang membutuhkan bantuan identifikasi.
            </div>
        `;
        return;
    }

    const html = otherObs.map(obs => {
        const bgImg = obs.image_base64 ? obs.image_base64 : 'https://images.unsplash.com/photo-1418065460487-3e41a6c8e1e4?w=300&q=80';
        const loc = obs.distribution_indonesia || 'Indonesia';
        const uName = obs.user_name || 'Pengguna';
        return `
            <div class="help-card">
                <div class="help-card-img" style="background-image: url('${bgImg}')"></div>
                <div class="help-card-info">
                    <span class="help-user">oleh ${uName}</span>
                    <span class="help-loc"><i class="fas fa-map-marker-alt"></i> ${loc}</span>
                    <button class="btn-green btn-sm" onclick="navigateTo('view-identifikasi')">Identifikasi</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// ===== Laporan Biodiversitas Otomatis =====
function renderBiodiversityReport(observations, uniqueSpecies, uniqueFamilies) {
    const container = document.getElementById('biodiv-report-container');
    const dateLabel = document.getElementById('biodiv-report-date');
    if (!container) return;

    // Set Report Date (e.g. "Juni 2026")
    if (dateLabel) {
        const now = new Date();
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        dateLabel.textContent = `Periode: ${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    if (!observations || observations.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 30px; color: #666;">
                <i class="fas fa-leaf" style="font-size: 30px; color: #ccc; margin-bottom: 10px;"></i><br>
                Belum ada data observasi. Mulailah menjelajah dan catat temuan Anda!
            </div>
        `;
        return;
    }

    // 1. Hitung Distribusi per Famili
    const familyCounts = {};
    observations.forEach(obs => {
        let fam = 'Tidak Diketahui';
        if (obs.classification && obs.classification.family) {
            fam = obs.classification.family;
        }
        familyCounts[fam] = (familyCounts[fam] || 0) + 1;
    });

    // Urutkan famili berdasarkan jumlah terbanyak, ambil top 4
    const sortedFamilies = Object.entries(familyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const maxCount = sortedFamilies.length > 0 ? sortedFamilies[0][1] : 1;

    let barsHtml = '';
    sortedFamilies.forEach(([fam, count]) => {
        const percentage = Math.round((count / maxCount) * 100);
        barsHtml += `
            <div class="report-bar">
                <span class="bar-label">${fam}</span>
                <div class="bar-fill" style="width:${Math.max(percentage, 10)}%">${count} spesies</div>
            </div>
        `;
    });

    if (barsHtml === '') {
        barsHtml = '<div style="color:#888; font-size:0.9rem;">Data klasifikasi famili belum tersedia.</div>';
    }

    // 2. Hitung Sebaran Lokasi
    const locations = new Set(
        observations
            .map(o => o.distribution_indonesia)
            .filter(Boolean)
            .flatMap(loc => loc.split(',').map(s => s.trim()))
    );
    const locString = locations.size > 0 ? Array.from(locations).slice(0, 3).join(', ') + (locations.size > 3 ? ', dll' : '') : 'Belum tercatat';

    // 3. Render HTML
    container.innerHTML = `
        <div class="report-section">
            <h5>Distribusi Observasi per Famili</h5>
            ${barsHtml}
        </div>
        <div class="report-section">
            <h5>Ringkasan</h5>
            <ul class="report-summary">
                <li>📸 <strong>${observations.length}</strong> total observasi yang valid</li>
                <li>🌿 <strong>${uniqueSpecies}</strong> spesies unik teridentifikasi</li>
                <li>🗂️ <strong>${uniqueFamilies}</strong> famili tumbuhan berbeda</li>
                <li>📍 Lokasi: <strong>${locString}</strong></li>
                <li>✅ <strong>${observations.filter(o => o.confidence === 'Tinggi' || o.confidence === 'Sangat Yakin').length}</strong> observasi tingkat keyakinan tinggi</li>
                <li>🌟 Terus tingkatkan eksplorasi Anda!</li>
            </ul>
        </div>
    `;
}
