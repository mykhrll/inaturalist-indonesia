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
        } else if (typeof firebaseApp !== 'undefined' && firebaseApp) {
            const user = firebase.auth().currentUser;
            if (user) {
                userName = user.displayName || user.email?.split('@')[0] || userName;
                userEmail = user.email || '';
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

// ===== Interactive Region Cards =====
function setExploreLocation(loc) {
    const inputLoc = document.getElementById('explore-location');
    const btnSearch = document.getElementById('btn-explore-search');
    
    if (inputLoc && btnSearch) {
        inputLoc.value = loc;
        btnSearch.click();
        
        // Scroll down to results if on mobile or small screen
        document.getElementById('explore-views').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function toggleExtraRegions() {
    const extraCards = document.querySelectorAll('.extra-region');
    const btnMore = document.getElementById('btn-more-regions');
    let isHidden = false;
    
    extraCards.forEach(card => {
        if (card.classList.contains('hidden-region')) {
            card.classList.remove('hidden-region');
            isHidden = true;
        } else {
            card.classList.add('hidden-region');
        }
    });
    
    if (btnMore) {
        if (isHidden) {
            btnMore.innerHTML = '<i class="fas fa-chevron-up"></i> Tampilkan Lebih Sedikit';
        } else {
            btnMore.innerHTML = '<i class="fas fa-chevron-down"></i> Selengkapnya';
        }
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
// Helper: Estimate coordinates from text location (adds slight randomness within land bounds)
function getCoordinatesForLocation(locStr) {
    locStr = (locStr || "").toLowerCase();
    
    // Titik-titik daratan spesifik (Lat, Lng) untuk memastikan marker tidak jatuh ke laut
    const regionPoints = {
        'papua': [ [-3.6, 137.6], [-4.0, 138.0], [-2.5, 140.0], [-1.0, 133.5] ],
        'maluku': [ [-3.3, 128.5], [0.8, 127.8], [-3.7, 128.1] ],
        'sulawesi': [ [-2.0, 120.0], [0.5, 122.5], [-4.0, 120.0], [-5.0, 122.0] ],
        'celebes': [ [-2.0, 120.0], [0.5, 122.5], [-4.0, 120.0], [-5.0, 122.0] ],
        'kalimantan': [ [0.5, 114.0], [-2.0, 113.0], [2.0, 115.0], [-1.0, 110.5] ],
        'borneo': [ [0.5, 114.0], [-2.0, 113.0], [2.0, 115.0], [-1.0, 110.5] ],
        'nusa tenggara': [ [-8.5, 120.0], [-9.5, 124.0], [-8.6, 117.5] ],
        'bali': [ [-8.3, 115.1], [-8.4, 115.2], [-8.2, 115.0] ],
        'jawa': [ [-7.5, 110.0], [-7.0, 107.5], [-8.0, 112.5], [-6.5, 106.5] ],
        'java': [ [-7.5, 110.0], [-7.0, 107.5], [-8.0, 112.5], [-6.5, 106.5] ],
        'sumatera': [ [0.0, 102.0], [2.5, 99.0], [-3.0, 104.0], [4.5, 96.5] ],
        'sumatra': [ [0.0, 102.0], [2.5, 99.0], [-3.0, 104.0], [4.5, 96.5] ],
        'australia': [ [-25.0, 133.0], [-30.0, 145.0], [-20.0, 125.0] ],
        'amerika': [ [37.0, -95.0], [40.0, -100.0], [35.0, -90.0] ],
        'eropa': [ [48.0, 14.0], [50.0, 10.0], [45.0, 5.0] ],
        'afrika': [ [0.0, 25.0], [10.0, 20.0], [-10.0, 25.0] ],
        'jepang': [ [36.0, 138.0], [35.0, 136.0], [39.0, 140.0] ],
        'japan': [ [36.0, 138.0], [35.0, 136.0], [39.0, 140.0] ],
        'cina': [ [35.0, 104.0], [30.0, 110.0], [40.0, 116.0] ],
        'tiongkok': [ [35.0, 104.0], [30.0, 110.0], [40.0, 116.0] ],
        'asia': [ [34.0, 100.0], [15.0, 100.0], [20.0, 80.0] ],
        'madagaskar': [ [-18.7, 46.8], [-20.0, 47.0], [-15.0, 49.0] ]
    };

    let selectedPoints = null;
    let earliestIndex = Infinity;

    // Cari area yang paling cocok berdasarkan deskripsi
    for (const [regionName, points] of Object.entries(regionPoints)) {
        const idx = locStr.indexOf(regionName);
        if (idx !== -1 && idx < earliestIndex) {
            earliestIndex = idx;
            selectedPoints = points;
        }
    }

    // Default ke area Indonesia jika tidak ditemukan kecocokan
    if (!selectedPoints) {
        selectedPoints = [
            [-2.0, 114.0], [-7.5, 110.0], [0.0, 102.0], [-3.0, 138.0], [-2.0, 120.0]
        ];
    }

    // Pilih titik acak dari list landPoints yang sudah pasti di darat
    const basePoint = selectedPoints[Math.floor(Math.random() * selectedPoints.length)];

    // Berikan sedikit random jitter (~2-5km) agar titik tidak tertumpuk 100% jika lokasinya sama
    const jitterRadius = 0.05; 
    const lat = basePoint[0] + (Math.random() * jitterRadius * 2 - jitterRadius);
    const lng = basePoint[1] + (Math.random() * jitterRadius * 2 - jitterRadius);
    
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
        let dateObj = new Date();
        if (obs.created_at) {
            if (typeof obs.created_at.toDate === 'function') {
                dateObj = obs.created_at.toDate();
            } else {
                dateObj = new Date(obs.created_at);
            }
        }
        
        const diffMs = new Date() - dateObj;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let timeStr = 'Baru saja';
        if (diffDays > 0) timeStr = `${diffDays} hari lalu`;
        else if (diffHours > 0) timeStr = `${diffHours} jam lalu`;
        else if (diffMins > 0) timeStr = `${diffMins} menit lalu`;
        
        // Thumbnail avatar dari huruf pertama
        const avatarChar = name.charAt(0).toUpperCase();
        
        // Placeholder gambar jika tidak ada
        const imgSrc = obs.image_url || obs.image_base64;
        const imgUrl = imgSrc && imgSrc.startsWith('http') 
            ? imgSrc 
            : (imgSrc || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/600px-No_Image_Available.jpg');

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

// Open login modal
document.getElementById('btn-open-login').addEventListener('click', (e) => {
    e.preventDefault();
    if (authModal) authModal.classList.add('active');
});

// Close modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => authModal.classList.remove('active'));
}

// Close any modal on overlay click
window.addEventListener('click', (e) => {
    if (e.target === authModal) authModal.classList.remove('active');
    const obsModal = document.getElementById('obs-detail-modal');
    if (obsModal && e.target === obsModal) closeObsDetail();
    const modDetail = document.getElementById('module-detail');
    if (modDetail && e.target === modDetail) modDetail.classList.add('hidden');
});

// Hero join button
const btnJoinHero = document.getElementById('btn-join-hero');
if (btnJoinHero) {
    btnJoinHero.addEventListener('click', () => {
        if (isLoggedIn) {
            navigateTo('view-dashboard');
        } else {
            if (authModal) authModal.classList.add('active');
        }
    });
}

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
var lacakData = [];

var growthChart = null;

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
        tinggi: e.height || e.height_cm || 0,
        satuan: e.height_unit || 'cm',
        daun: e.leaf_count,
        fase: e.growth_phase,
        kondisi: e.health_condition,
        catatan: e.notes,
        image_url: e.image_url || null
    }));
    
    renderTimeline();
    
    if (document.getElementById('view-lacak').classList.contains('active')) {
        initGrowthChart();
    }
}

function initGrowthChart() {
    try {
        if (typeof Chart === 'undefined') {
            console.warn("Chart.js tidak ditemukan atau belum termuat.");
            return;
        }

        const ctx = document.getElementById('growthChart');
        if (!ctx) return;

        if (growthChart) growthChart.destroy();

    const labels = lacakData.map(d => {
        try {
            if (d.tanggal) {
                const date = new Date(d.tanggal);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                }
            }
        } catch (e) {}
        return 'Unknown';
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
    } catch (e) {
        console.warn("Gagal merender grafik pertumbuhan:", e);
    }
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

    // Sort by date descending safely
    const sorted = [...lacakData].sort((a, b) => {
        const dA = new Date(a.tanggal || 0).getTime();
        const dB = new Date(b.tanggal || 0).getTime();
        return (isNaN(dB) ? 0 : dB) - (isNaN(dA) ? 0 : dA);
    });
    
    timeline.innerHTML = sorted.map(entry => {
        let dateStr = 'Tanggal tidak diketahui';
        try {
            if (entry.tanggal) {
                const d = new Date(entry.tanggal);
                if (!isNaN(d.getTime())) {
                    dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            }
        } catch (e) {}
        
        return `
            <div class="timeline-entry">
                <div class="timeline-dot fase-${entry.fase}"></div>
                <div class="timeline-content">
                    <div class="timeline-header"><strong>${entry.nama}</strong><span class="timeline-date">${dateStr}</span></div>
                    <div class="timeline-details">
                        <span>📏 Tinggi: ${entry.tinggi} ${entry.satuan || 'cm'}</span><span>🍃 Daun: ${entry.daun}</span><span>${faseEmoji[entry.fase] || ''} Fase: ${entry.fase}</span><span>${kondisiEmoji[entry.kondisi] || ''} Kondisi: ${entry.kondisi}</span>
                    </div>
                    ${entry.image_url ? `<div style="margin-top: 10px;"><img src="${entry.image_url}" style="max-width: 100%; border-radius: 8px;"></div>` : ''}
                    ${entry.catatan ? `<p class="timeline-note">${entry.catatan}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function addLacakEntry() {
    const nama = document.getElementById('lacak-nama').value.trim();
    const tanggal = document.getElementById('lacak-tanggal').value;
    const tinggi = parseFloat(document.getElementById('lacak-tinggi').value) || 0;
    const satuan = document.getElementById('lacak-tinggi-satuan').value || 'cm';
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
        let imageUrl = null;
        const fotoInput = document.getElementById('lacak-foto');
        if (fotoInput && fotoInput.files && fotoInput.files[0]) {
            const file = fotoInput.files[0];
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengunggah Foto...';
            if (typeof uploadMonitoringImageToSupabase === 'function') {
                imageUrl = await uploadMonitoringImageToSupabase(file);
            }
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        }

        const entry = { nama, tanggal, tinggi, satuan, daun, fase, kondisi, catatan, image_url: imageUrl };

        // Save to Firebase Firestore (Realtime akan update UI, tapi kita update lokal juga agar instan)
        if (typeof saveLacakEntry === 'function' && typeof firebaseApp !== 'undefined' && firebaseApp) {
            const saved = await saveLacakEntry(entry);
            if (!saved) throw new Error("Gagal menyimpan ke database (Firestore).");
            
            // Perbarui lokal agar instan tanpa menunggu listener
            lacakData.push(entry);
            renderTimeline();
            initGrowthChart();
        } else {
            // Fallback for mock/local without Firebase
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
        const fotoInputEl = document.getElementById('lacak-foto');
        if (fotoInputEl) fotoInputEl.value = '';

        // Show success toast
        showToast('Catatan pemantauan berhasil disimpan!');
    } catch (e) {
        console.error("Gagal menyimpan catatan:", e);
        alert(e.message || "Gagal menyimpan catatan pemantauan.");
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
    },
    mod7: {
        title: '📐 Analisis Vegetasi',
        content: `
            <h3>Rumus-rumus Analisis Vegetasi</h3>
            <p>Analisis vegetasi adalah cara mempelajari susunan (komposisi jenis) dan bentuk (struktur) vegetasi atau masyarakat tumbuh-tumbuhan. Beberapa parameter penting yang diukur meliputi Kerapatan (Density), Frekuensi, dan Dominansi.</p>
            <h4>1. Kepadatan / Kerapatan (Density - D)</h4>
            <p>Jumlah individu suatu jenis dalam luasan tertentu.</p>
            <ul>
                <li><strong>Kerapatan Mutlak (K)</strong> = Jumlah individu jenis i / Luas seluruh petak ukur</li>
                <li><strong>Kerapatan Relatif (KR)</strong> = (Kerapatan jenis i / Total kerapatan seluruh jenis) × 100%</li>
            </ul>
            <h4>2. Frekuensi (Frequency - F)</h4>
            <p>Peluang ditemukannya suatu jenis dalam petak ukur yang diamati.</p>
            <ul>
                <li><strong>Frekuensi Mutlak (F)</strong> = Jumlah petak ukur ditemukannya jenis i / Total jumlah petak ukur</li>
                <li><strong>Frekuensi Relatif (FR)</strong> = (Frekuensi jenis i / Total frekuensi seluruh jenis) × 100%</li>
            </ul>
            <h4>3. Dominansi (Dominance - C)</h4>
            <p>Penguasaan suatu jenis terhadap komunitas, biasanya diukur dari luas penutupan tajuk atau Luas Bidang Dasar (LBD).</p>
            <ul>
                <li><strong>Dominansi Mutlak (D)</strong> = Total LBD jenis i / Luas seluruh petak ukur</li>
                <li><strong>Dominansi Relatif (DR)</strong> = (Dominansi jenis i / Total dominansi seluruh jenis) × 100%</li>
            </ul>
            <h4>4. Indeks Nilai Penting (INP)</h4>
            <p>Menunjukkan peran atau pengaruh suatu jenis dalam komunitas. Untuk tingkat pohon, INP didapat dari penjumlahan ketiga nilai relatif di atas.</p>
            <p><code>INP = Kerapatan Relatif + Frekuensi Relatif + Dominansi Relatif</code></p>
            <p>Nilai maksimum INP untuk tingkat pohon adalah 300%, sedangkan untuk semai dan pancang (yang tidak memperhitungkan dominansi) adalah 200%.</p>
        `
    },
    mod8: {
        title: '📊 Indeks Keanekaragaman Hayati',
        content: `
            <h3>Indeks Keanekaragaman Hayati (Shannon-Wiener)</h3>
            <p>Indeks keanekaragaman (H') digunakan untuk menyatakan kekayaan jenis dan kemerataan jumlah individu antar jenis dalam suatu komunitas.</p>
            <h4>Rumus Indeks Shannon-Wiener:</h4>
            <p><code>H' = - ∑ (Pi × ln Pi)</code></p>
            <p>Dimana:<br>
            <strong>Pi</strong> = Proporsi jumlah individu jenis ke-i (ni) terhadap total seluruh individu (N)<br>
            <strong>ln</strong> = Logaritma natural</p>
            <h4>Kriteria Penilaian:</h4>
            <ul>
                <li><strong>H' &lt; 1,0</strong> : Keanekaragaman rendah, komunitas tidak stabil, sering terjadi tekanan ekologis.</li>
                <li><strong>1,0 ≤ H' ≤ 3,0</strong> : Keanekaragaman sedang, komunitas cukup stabil.</li>
                <li><strong>H' &gt; 3,0</strong> : Keanekaragaman tinggi, komunitas sangat stabil dan sehat.</li>
            </ul>
            <h4>Contoh Perhitungan:</h4>
            <p>Dalam suatu plot terdapat 3 jenis tumbuhan:<br>
            - Spesies A = 50 individu<br>
            - Spesies B = 30 individu<br>
            - Spesies C = 20 individu<br>
            Total Individu (N) = 100
            </p>
            <p>Langkah perhitungan:<br>
            Pi (A) = 50/100 = 0.5 → 0.5 × ln(0.5) = 0.5 × -0.693 = -0.346<br>
            Pi (B) = 30/100 = 0.3 → 0.3 × ln(0.3) = 0.3 × -1.204 = -0.361<br>
            Pi (C) = 20/100 = 0.2 → 0.2 × ln(0.2) = 0.2 × -1.609 = -0.321<br>
            </p>
            <p><strong>H'</strong> = - (-0.346 + -0.361 + -0.321) = <strong>1.028</strong> (Keanekaragaman Sedang)</p>
        `
    }
};

// ===== MODULE QUIZ BANKS =====
const moduleQuizzes = {
    mod1: [
        { q: 'Apa peran utama tumbuhan sebagai produsen dalam ekosistem?', o: ['Mengubah energi cahaya menjadi energi kimia melalui fotosintesis', 'Menguraikan bahan organik menjadi anorganik', 'Memangsa organisme yang lebih kecil', 'Menyerap nutrisi dari organisme inang'], c: 0, e: 'Tumbuhan mengubah energi matahari menjadi glukosa, sebagai dasar rantai makanan.' },
        { q: 'Gas apa yang diserap oleh tumbuhan selama proses fotosintesis?', o: ['Oksigen', 'Karbon Dioksida', 'Nitrogen', 'Metana'], c: 1, e: 'Tumbuhan menyerap Karbon Dioksida (CO2) dan melepaskan Oksigen (O2).' },
        { q: 'Di bagian sel manakah fotosintesis terjadi?', o: ['Mitokondria', 'Nukleus', 'Kloroplas', 'Ribosom'], c: 2, e: 'Fotosintesis terjadi di kloroplas yang mengandung klorofil.' },
        { q: 'Apa yang dimaksud dengan produktivitas primer terestrial?', o: ['Produksi oksigen oleh alga di laut', 'Laju pembentukan biomassa oleh tumbuhan di darat', 'Kecepatan dekomposisi bahan organik', 'Jumlah air yang diserap akar'], c: 1, e: 'Produktivitas primer terestrial adalah laju produksi biomassa oleh tumbuhan darat.' },
        { q: 'Hutan hujan tropis Indonesia memiliki produktivitas primer yang...', o: ['Sangat rendah', 'Sedang', 'Sangat tinggi', 'Tidak dapat diukur'], c: 2, e: 'Karena curah hujan dan sinar matahari yang melimpah, produktivitas primernya sangat tinggi.' },
        { q: 'Selain glukosa, apa produk sampingan utama dari reaksi fotosintesis?', o: ['Oksigen', 'Karbon Monoksida', 'Uap Air', 'Nitrogen Dioksida'], c: 0, e: 'Oksigen adalah produk sampingan dari fotosintesis yang sangat penting bagi makhluk hidup lain.' },
        { q: 'Apa yang akan terjadi jika tumbuhan di bumi menghilang?', o: ['Kadar oksigen akan meningkat tajam', 'Hewan herbivora akan berkembang pesat', 'Rantai makanan akan runtuh dan kehidupan punah', 'Suhu bumi akan turun drastis'], c: 2, e: 'Tumbuhan adalah fondasi rantai makanan dan penghasil oksigen utama.' }
    ],
    mod2: [
        { q: 'Apa fungsi "drip tips" (ujung daun meruncing) pada tumbuhan tropis?', o: ['Menarik polinator', 'Mengalirkan air hujan untuk mencegah pertumbuhan jamur', 'Menyimpan cadangan air', 'Meningkatkan laju transpirasi'], c: 1, e: 'Mencegah air menggenang yang bisa memicu jamur atau alga di daun.' },
        { q: 'Rafflesia arnoldii memiliki adaptasi berupa...', o: ['Epifit pada cabang tinggi', 'Holoparasit tanpa daun dan akar', 'Akar gantung panjang', 'Daun super tebal'], c: 1, e: 'Rafflesia adalah holoparasit obligat yang hidup di dalam jaringan inangnya.' },
        { q: 'Tumbuhan epifit hidup dengan cara...', o: ['Menyerap nutrisi dari inangnya', 'Menempel pada tumbuhan lain tanpa merugikan inangnya', 'Tumbuh di tanah berpasir', 'Merambat dan mencekik pohon lain'], c: 1, e: 'Epifit menumpang tempat tinggal untuk mendapat sinar matahari tanpa menjadi parasit.' },
        { q: 'Akar papan (buttress root) pada pohon-pohon hutan hujan berfungsi untuk...', o: ['Menyimpan makanan', 'Menangkap serangga', 'Memberikan stabilitas dan penopang pada tanah yang dangkal', 'Mencegah evaporasi'], c: 2, e: 'Tanah hutan hujan seringkali dangkal, sehingga akar papan membantu menopang pohon raksasa.' },
        { q: 'Simbiosis mikoriza membantu tumbuhan dalam hal...', o: ['Mempercepat proses fotosintesis', 'Meningkatkan penyerapan nutrisi dan air dari tanah', 'Menarik serangga penyerbuk', 'Mengurangi penguapan daun'], c: 1, e: 'Mikoriza memperluas area penyerapan akar untuk mengambil fosfor dan nutrisi lain.' },
        { q: 'Fenomena bunga atau buah yang muncul langsung di batang utama (cauliflory) bertujuan untuk...', o: ['Mengurangi beban pada dahan', 'Memudahkan penyerbukan oleh hewan bawah tajuk', 'Melindungi buah dari burung', 'Mencegah pencurian nektar'], c: 1, e: 'Cauliflory memudahkan akses polinator yang terbang rendah seperti ngengat atau kelelawar.' },
        { q: 'Mengapa banyak tumbuhan lantai hutan memiliki daun lebar (megafil)?', o: ['Untuk menangkap lebih banyak curah hujan', 'Untuk memaksimalkan tangkapan cahaya matahari yang minim', 'Untuk mencegah herbivora', 'Untuk menakuti predator'], c: 1, e: 'Daun lebar memperbesar luas area untuk menangkap sedikit cahaya yang tembus ke lantai hutan.' }
    ],
    mod3: [
        { q: 'Istilah untuk penyerbukan yang dibantu oleh serangga adalah...', o: ['Ornitofili', 'Kiropteri', 'Entomofili', 'Anemofili'], c: 2, e: 'Entomofili adalah penyerbukan oleh serangga (entomo = serangga).' },
        { q: 'Penyerbukan silang antar individu tumbuhan penting karena...', o: ['Menghasilkan keturunan yang identik', 'Meningkatkan variasi dan keanekaragaman genetik', 'Mengurangi jumlah bunga', 'Mempercepat kematian pohon induk'], c: 1, e: 'Variasi genetik membuat populasi lebih tahan terhadap penyakit dan perubahan lingkungan.' },
        { q: 'Bunga durian mekar di malam hari dan memiliki bau menyengat. Siapakah polinator utamanya?', o: ['Burung Kolibri', 'Kupu-kupu', 'Kelelawar', 'Semut'], c: 2, e: 'Bunga malam yang besar dan berbau musky biasanya diserbuki oleh kelelawar (Kiropteri).' },
        { q: 'Penyerbukan anemofili (oleh angin) biasanya memiliki ciri-ciri bunga...', o: ['Berwarna sangat mencolok', 'Memiliki nektar melimpah', 'Serbuk sari ringan dan tidak bermahkota terang', 'Berbau sangat wangi'], c: 2, e: 'Bunga yang diserbuki angin tidak perlu menarik hewan, sehingga mahkotanya sederhana.' },
        { q: 'Hewan apakah yang bukan merupakan polinator (penyerbuk)?', o: ['Kumbang', 'Laba-laba pemangsa', 'Lebah', 'Burung madu'], c: 1, e: 'Laba-laba pemangsa umumnya justru memburu polinator dan tidak berperan dalam penyerbukan.' },
        { q: 'Mengapa penurunan populasi lebah sangat mengkhawatirkan?', o: ['Karena harga madu akan naik', 'Karena banyak tanaman pangan bergantung pada penyerbukan lebah', 'Karena bunga akan layu lebih cepat', 'Karena akan terjadi peningkatan populasi lalat'], c: 1, e: 'Sebagian besar tanaman pertanian membutuhkan lebah untuk menghasilkan buah dan biji.' },
        { q: 'Ciri bunga yang diserbuki oleh burung (ornitofili) biasanya...', o: ['Berwarna merah/terang dan tabung panjang', 'Berbau bangkai busuk', 'Mekar hanya di malam hari', 'Tidak memiliki nektar'], c: 0, e: 'Burung menyukai warna cerah (merah/oranye) dan memiliki paruh panjang untuk mencapai nektar.' }
    ],
    mod4: [
        { q: 'Apa yang dimaksud dengan suksesi sekunder?', o: ['Kolonisasi pertama pada lahan vulkanik baru', 'Pemulihan vegetasi pada lahan yang pernah memiliki komunitas namun terganggu', 'Tumbuhan yang tumbuh di atas air', 'Migrasi spesies ke habitat baru'], c: 1, e: 'Suksesi sekunder terjadi pada lahan bekas gangguan (kebakaran, tebangan) yang tanahnya masih ada.' },
        { q: 'Contoh khas tumbuhan pionir (perintis) di lahan terbuka adalah...', o: ['Pohon Jati', 'Alang-alang (Imperata cylindrica)', 'Anggrek Bulan', 'Pohon Beringin besar'], c: 1, e: 'Alang-alang atau rumput liar mudah tumbuh di tanah terbuka yang miskin hara dan banyak sinar matahari.' },
        { q: 'Komunitas akhir yang relatif stabil dalam proses suksesi disebut...', o: ['Komunitas Pionir', 'Komunitas Sementara', 'Komunitas Klimaks', 'Komunitas Ekuilibrium'], c: 2, e: 'Komunitas klimaks didominasi oleh spesies berumur panjang yang stabil.' },
        { q: 'Proses suksesi pada lahan bekas aliran lava letusan gunung berapi disebut...', o: ['Suksesi sekunder', 'Suksesi primer', 'Suksesi hidrark', 'Deforestasi'], c: 1, e: 'Suksesi primer dimulai dari substrat baru yang sama sekali tidak memiliki tanah atau vegetasi sebelumnya.' },
        { q: 'Dalam restorasi lahan terdegradasi, mengapa menanam pohon perintis sangat penting?', o: ['Karena pohonnya mahal', 'Mereka cepat memperbaiki kondisi tanah dan mikroklimat untuk spesies klimaks', 'Mereka tidak membutuhkan air sama sekali', 'Mereka mencegah hujan turun'], c: 1, e: 'Tumbuhan perintis mengembalikan kesuburan tanah dan memberi naungan agar bibit pohon asli bisa tumbuh.' },
        { q: 'Gangguan apa yang biasanya memulai suksesi sekunder di alam?', o: ['Erupsi magma vulkanik yang menutupi daratan', 'Gletser yang mencair', 'Kebakaran hutan atau pohon tumbang', 'Terbentuknya pulau pasir baru'], c: 2, e: 'Kebakaran tidak merusak struktur tanah sepenuhnya, sehingga suksesi yang terjadi adalah sekunder.' },
        { q: 'Sifat tumbuhan klimaks biasanya...', o: ['Tumbuh sangat cepat', 'Butuh sinar matahari penuh', 'Toleran naungan dan tumbuh lambat', 'Memiliki umur yang sangat pendek'], c: 2, e: 'Pohon klimaks mampu berkecambah dan tumbuh di bawah bayang-bayang kanopi (toleran naungan).' }
    ],
    mod5: [
        { q: 'Hutan mangrove berperan krusial dalam jasa ekosistem pengaturan berupa...', o: ['Menghasilkan rotan', 'Melindungi pantai dari abrasi, badai, dan intrusi air laut', 'Menyediakan lokasi tambang pasir', 'Meningkatkan suhu udara'], c: 1, e: 'Akar mangrove memecah gelombang laut dan menahan sedimen, melindungi pesisir.' },
        { q: 'Penyimpanan dan penyerapan karbon oleh hutan hujan tropis termasuk dalam kategori jasa...', o: ['Jasa Penyediaan', 'Jasa Budaya', 'Jasa Pengaturan (Regulasi iklim)', 'Jasa Rekreasi'], c: 2, e: 'Regulasi karbon dan iklim adalah bagian dari jasa ekosistem pengaturan/regulasi.' },
        { q: 'Apa yang terjadi jika daerah tangkapan air kehilangan vegetasi hujannya?', o: ['Debit sungai menjadi sangat stabil', 'Risiko erosi dan banjir bandang meningkat tajam', 'Kualitas air tanah akan meningkat', 'Curah hujan akan bertambah deras'], c: 1, e: 'Akar pohon berfungsi menahan tanah dan meresapkan air. Tanpa pohon, air hujan langsung mengalir menjadi banjir.' },
        { q: 'Hutan memberikan "Jasa Budaya" dalam bentuk...', o: ['Menyediakan kayu bakar', 'Regulasi iklim', 'Nilai estetika, ekowisata, dan spiritual', 'Pembentukan tanah'], c: 2, e: 'Jasa budaya mencakup manfaat non-material seperti pariwisata, inspirasi, dan nilai adat.' },
        { q: 'Siklus nutrisi dan pembentukan tanah dikelompokkan ke dalam jasa...', o: ['Jasa Pendukung (Supporting services)', 'Jasa Penyediaan', 'Jasa Pengaturan', 'Jasa Transportasi'], c: 0, e: 'Jasa pendukung adalah fondasi dasar bagi semua jasa ekosistem lainnya (tanah, fotosintesis, siklus air).' },
        { q: 'Tumbuhan menyerap polutan dari tanah melalui akar, proses ini dikenal sebagai...', o: ['Biomagnifikasi', 'Fitoremediasi', 'Transpirasi', 'Suksesi'], c: 1, e: 'Fitoremediasi adalah penggunaan tumbuhan untuk membersihkan tanah atau air yang tercemar polutan.' },
        { q: 'Mangrove menyimpan karbon "biru" (blue carbon) yang jumlahnya...', o: ['Lebih sedikit dari hutan terestrial', 'Sama dengan padang rumput', 'Jauh lebih besar dibanding hutan hujan darat', 'Hanya bertahan beberapa bulan'], c: 2, e: 'Sedimen mangrove yang miskin oksigen menyimpan karbon jauh lebih efisien tanpa terurai.' }
    ],
    mod6: [
        { q: 'Ilmu yang mempelajari hubungan masyarakat tradisional dengan tumbuhan disebut...', o: ['Zoologi', 'Etnobotani', 'Taksonomi', 'Klimatologi'], c: 1, e: 'Etno (budaya/masyarakat) dan Botani (ilmu tumbuhan).' },
        { q: 'Tanaman Zingiber officinale (Jahe) secara etnobotani paling umum digunakan sebagai...', o: ['Bahan bangunan', 'Bumbu masak dan jamu tradisional penghangat', 'Pakaian adat', 'Alat musik tradisional'], c: 1, e: 'Jahe sangat populer di Indonesia sebagai bumbu kuliner dan obat herbal.' },
        { q: 'Bagi masyarakat Papua dan Maluku, empulur dari pohon ini diekstrak menjadi sumber karbohidrat utama (sagu). Pohon apakah itu?', o: ['Pohon Aren', 'Pohon Lontar', 'Pohon Rumbia (Metroxylon sagu)', 'Pohon Nipah'], c: 2, e: 'Pohon Metroxylon sagu menyimpan pati dalam jumlah besar di batangnya.' },
        { q: 'Tumbuhan rotan dimanfaatkan oleh masyarakat adat untuk...', o: ['Bahan pengawet makanan', 'Bahan anyaman dan furnitur', 'Pewarna alami kain tenun', 'Bahan dasar perahu layar'], c: 1, e: 'Batang rotan sangat kuat dan lentur, ideal untuk anyaman dan perabotan.' },
        { q: 'Pohon aren (Arenga pinnata) adalah contoh tumbuhan serbaguna karena...', o: ['Hanya daunnya yang berguna', 'Akarnya bisa dijadikan racun', 'Niranya jadi gula merah, ijuknya untuk atap, dan buahnya jadi kolang-kaling', 'Buahnya menjadi rempah termahal'], c: 2, e: 'Hampir seluruh bagian pohon aren dimanfaatkan oleh masyarakat.' },
        { q: 'Kapur barus yang bernilai tinggi sejak zaman purba diekstrak dari pohon...', o: ['Cendana', 'Dryobalanops aromatica', 'Pohon Jati', 'Pohon Meranti'], c: 1, e: 'Dryobalanops aromatica adalah pohon endemik Sumatera yang menghasilkan kristal kapur barus aromatik.' },
        { q: 'Hilangnya pengetahuan etnobotani tradisional seringkali disebabkan oleh...', o: ['Mutasi genetik tanaman', 'Berkurangnya curah hujan', 'Modernisasi dan kurangnya pewarisan budaya ke generasi muda', 'Meningkatnya jumlah ilmuwan'], c: 2, e: 'Pengetahuan lokal terancam punah karena generasi muda tidak lagi mempelajarinya dari tetua adat.' }
    ],
    mod7: [
        { q: 'Apa yang dimaksud dengan Kerapatan Mutlak (Density)?', o: ['Peluang ditemukannya suatu jenis tumbuhan', 'Persentase penutupan tajuk pohon', 'Jumlah individu suatu jenis dibagi luas petak ukur', 'Jumlah jenis dalam satu hektar'], c: 2, e: 'Kerapatan adalah rasio jumlah individu terhadap luas area penelitian.' },
        { q: 'Parameter Frekuensi (F) dalam analisis vegetasi menggambarkan...', o: ['Peluang penyebaran jenis pada petak-petak ukur yang dibuat', 'Ukuran batang pohon', 'Berapa lapis kanopi hutan', 'Rata-rata tinggi pohon'], c: 0, e: 'Frekuensi menunjukkan seberapa sering spesies tersebut ditemukan dalam plot-plot pengamatan.' },
        { q: 'Untuk menghitung Dominansi suatu pohon, variabel yang paling umum diukur adalah...', o: ['Jumlah daun di ranting', 'Warna bunga', 'Luas Bidang Dasar (LBD) atau Basal Area', 'Jumlah biji yang dihasilkan'], c: 2, e: 'LBD (dihitung dari diameter setinggi dada) digunakan untuk mewakili luas penguasaan lahan.' },
        { q: 'Indeks Nilai Penting (INP) untuk tingkat Pohon didapatkan dari penjumlahan...', o: ['Kerapatan Relatif + Frekuensi Relatif', 'Kerapatan + Dominansi', 'Kerapatan Relatif + Frekuensi Relatif + Dominansi Relatif', 'Frekuensi Relatif + Dominansi Mutlak'], c: 2, e: 'INP pohon menjumlahkan ketiga parameter relatif (K, F, D) dengan nilai maksimal 300%.' },
        { q: 'Untuk tingkatan semai (seedling) dan pancang (sapling), INP dihitung dengan cara menjumlahkan...', o: ['Kerapatan Relatif + Frekuensi Relatif', 'Kerapatan Relatif saja', 'Frekuensi Relatif + Dominansi Relatif', 'Hanya Dominansi Relatif'], c: 0, e: 'Karena ukuran batangnya masih sangat kecil, dominansi tidak dihitung untuk semai dan pancang. Nilai maksimal INP adalah 200%.' },
        { q: 'Rumus Kerapatan Relatif (KR) adalah...', o: ['(Total Individu / Total Area) x 100', '(Kerapatan jenis X / Kerapatan total seluruh jenis) x 100%', '(Jumlah Plot / Total Plot) x 100%', '(Diameter A / Diameter B)'], c: 1, e: 'KR membandingkan kerapatan suatu jenis dengan total kerapatan komunitas.' },
        { q: 'Metode pembuatan plot berbentuk persegi untuk analisis vegetasi dikenal dengan nama...', o: ['Metode Transek Garis', 'Metode Point Quarter', 'Metode Kuadrat (Petak Tunggal/Ganda)', 'Metode Tangkap Lepas'], c: 2, e: 'Metode kuadrat menggunakan petak ukur persegi dengan ukuran tertentu (contoh: 20x20m untuk pohon).' }
    ],
    mod8: [
        { q: 'Indeks Keanekaragaman Shannon-Wiener (H\') menggabungkan dua komponen utama, yaitu...', o: ['Kepadatan dan Frekuensi', 'Kekayaan jenis (Richness) dan Kemerataan (Evenness)', 'Suhu dan Curah Hujan', 'Ketinggian dan Erosi'], c: 1, e: 'Indeks Shannon-Wiener mempertimbangkan jumlah spesies sekaligus sebaran jumlah individu antar spesies.' },
        { q: 'Berdasarkan kriteria Shannon-Wiener, komunitas dengan H\' = 0,8 menunjukkan...', o: ['Keanekaragaman sangat tinggi dan stabil', 'Keanekaragaman sedang', 'Keanekaragaman rendah dan rentan terhadap tekanan', 'Ekosistem yang sempurna'], c: 2, e: 'Nilai H\' di bawah 1,0 mengindikasikan tingkat keanekaragaman yang rendah dan kestabilan komunitas yang buruk.' },
        { q: 'Dalam rumus H\' = - ∑ (Pi × ln Pi), simbol "Pi" merepresentasikan...', o: ['Nilai konstan 3.14', 'Proporsi jumlah individu suatu jenis terhadap total seluruh individu', 'Jumlah curah hujan per tahun', 'Populasi awal'], c: 1, e: 'Pi dihitung dengan membagi jumlah individu spesies (n) dengan total individu (N).' },
        { q: 'Apa arti dari logaritma natural (ln) dalam ekologi?', o: ['Menghitung panjang akar', 'Basis algoritma matematis (berbasis e=2.718) yang lazim digunakan dalam rumus Shannon-Wiener', 'Menentukan tinggi pohon', 'Menghitung waktu paruh karbon'], c: 1, e: 'Shannon-Wiener umumnya menggunakan logaritma natural (ln) atau logaritma basis 2.' },
        { q: 'Jika H\' berada di antara rentang 1,0 hingga 3,0, maka komunitas tersebut dikategorikan memiliki keanekaragaman...', o: ['Rendah', 'Sangat Tinggi', 'Sedang', 'Tidak Valid'], c: 2, e: 'Rentang 1,0 hingga 3,0 secara umum disepakati sebagai kategori keanekaragaman sedang.' },
        { q: 'Sebuah komunitas memiliki 5 jenis serangga, tetapi 99% individunya didominasi oleh jenis A saja. Apa yang terjadi pada Indeks Shannon-Wiener (H\')?', o: ['H\' akan sangat tinggi', 'H\' akan menjadi nilai negatif', 'H\' akan cenderung rendah karena kemerataan (evenness) sangat buruk', 'H\' tidak akan terpengaruh'], c: 2, e: 'Dominansi ekstrem oleh satu jenis membuat kemerataan menjadi rendah, yang pada gilirannya menekan nilai H\'.' },
        { q: 'Komunitas klimaks seperti hutan hujan tropis asli umumnya memiliki nilai H\'...', o: ['Kurang dari 1,0', 'Antara 0 dan 0,5', 'Seringkali di atas 3,0', 'Selalu bernilai 0'], c: 2, e: 'Hutan hujan tropis memiliki kekayaan jenis tinggi dan tersebar merata, sehingga H\' sering kali > 3,0.' }
    ]
};

// State kuis per modul
let currentModuleQuiz = null; // { modId, questions, currentIdx, score, answers }

function toggleModule(modId) {
    const detail = document.getElementById('module-detail');
    const content = document.getElementById('module-content');
    const mod = moduleContents[modId];

    if (!mod) return;

    // 1. Render konten modul
    let html = `
        <div class="module-article">
            ${mod.content}
        </div>
        <hr class="module-divider">
        <div class="module-quiz-section" id="mq-section">
            <h3 style="margin-bottom: 10px; color: var(--inat-dark);"><i class="fas fa-clipboard-check"></i> Kuis Modul: Evaluasi Pemahaman</h3>
            <p style="color: #666; font-size: 0.95rem; margin-bottom: 20px;">Jawablah 5 pertanyaan acak berikut untuk mendapatkan poin kontribusi.</p>
            <div id="mq-container"></div>
        </div>
    `;
    content.innerHTML = html;
    detail.classList.remove('hidden');
    
    // Auto scroll to top of modal
    document.querySelector('.module-detail-inner').scrollTop = 0;

    // 2. Siapkan Kuis (Pilih 5 acak dari bank soal)
    const bank = moduleQuizzes[modId];
    if (bank && bank.length >= 5) {
        // Shuffle & pick 5
        const shuffled = [...bank].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        
        currentModuleQuiz = {
            modId: modId,
            questions: selected,
            currentIdx: 0,
            score: 0,
            answers: []
        };
        renderModuleQuiz();
    } else {
        document.getElementById('mq-container').innerHTML = '<p style="color: #888;"><i>Kuis untuk modul ini belum tersedia.</i></p>';
    }
}

function renderModuleQuiz() {
    const mq = currentModuleQuiz;
    const container = document.getElementById('mq-container');
    
    if (mq.currentIdx >= mq.questions.length) {
        finishModuleQuiz();
        return;
    }

    const q = mq.questions[mq.currentIdx];
    
    // Generate HTML for question
    let optionsHtml = '';
    q.o.forEach((opt, idx) => {
        optionsHtml += `<button class="quiz-option" onclick="checkModuleQuiz(this, ${idx})">${opt}</button>`;
    });

    container.innerHTML = `
        <div class="quiz-progress" style="margin-bottom: 15px;">
            <span id="quiz-progress-text">Soal ${mq.currentIdx + 1} dari ${mq.questions.length}</span>
            <div class="quiz-progress-bar">
                <div class="quiz-progress-fill" style="width:${((mq.currentIdx + 1) / mq.questions.length) * 100}%"></div>
            </div>
        </div>
        <div class="quiz-question" style="font-size: 1.1rem; margin-bottom: 15px;"><strong>Q:</strong> ${q.q}</div>
        <div class="quiz-options" id="mq-options">
            ${optionsHtml}
        </div>
        <div class="quiz-feedback hidden" id="mq-feedback" style="margin-top: 15px;"></div>
        <button class="btn-green hidden" id="mq-next" onclick="nextModuleQuiz()" style="margin-top: 15px;">
            Selanjutnya <i class="fas fa-arrow-right"></i>
        </button>
    `;
}

function checkModuleQuiz(btnEl, selectedIdx) {
    const mq = currentModuleQuiz;
    const q = mq.questions[mq.currentIdx];
    const isCorrect = (selectedIdx === q.c);

    // Disable all buttons
    const allBtns = document.querySelectorAll('#mq-options .quiz-option');
    allBtns.forEach((b, idx) => {
        b.disabled = true;
        b.style.pointerEvents = 'none';
        if (idx === q.c) b.classList.add('correct');
    });

    const feedback = document.getElementById('mq-feedback');
    
    if (isCorrect) {
        btnEl.classList.add('correct');
        mq.score++;
        feedback.className = 'quiz-feedback correct';
        feedback.innerHTML = `<strong>✅ Tepat sekali!</strong><br>${q.e}`;
    } else {
        btnEl.classList.add('wrong');
        feedback.className = 'quiz-feedback wrong';
        feedback.innerHTML = `<strong>❌ Kurang tepat.</strong><br>${q.e}`;
    }

    feedback.classList.remove('hidden');
    document.getElementById('mq-next').classList.remove('hidden');
}

function nextModuleQuiz() {
    currentModuleQuiz.currentIdx++;
    renderModuleQuiz();
}

function finishModuleQuiz() {
    const container = document.getElementById('mq-container');
    const mq = currentModuleQuiz;
    const pct = Math.round((mq.score / mq.questions.length) * 100);
    const earnedPoints = mq.score * 2; // 2 points per correct answer
    
    let msg = '';
    if (pct >= 80) msg = 'Luar biasa! Pemahaman Anda sangat tajam. 🎉';
    else if (pct >= 60) msg = 'Bagus! Anda sudah cukup memahami modul ini. 👍';
    else msg = 'Jangan menyerah! Baca ulang teori dan coba lagi. 📖';

    container.innerHTML = `
        <div class="quiz-score active" style="display:block; background:#f4fdf4; border:1px solid #c3e6cb; padding:20px; border-radius:8px; text-align:center;">
            <h3 style="color:var(--inat-green); margin-bottom:10px;">🎓 Hasil Kuis</h3>
            <div class="score-num" style="font-size:3rem; font-weight:bold; color:var(--inat-dark); margin-bottom:10px;">${mq.score}/${mq.questions.length}</div>
            <p style="margin-bottom:15px; font-size:1.05rem;">${msg}</p>
            <div style="background:#e9f7ef; display:inline-block; padding:8px 15px; border-radius:20px; font-weight:bold; color:#1e8449;">
                <i class="fas fa-coins"></i> +${earnedPoints} Poin Kontribusi
            </div>
            <br>
            <button class="btn-green" onclick="toggleModule('${mq.modId}')" style="margin-top:20px;">
                <i class="fas fa-redo"></i> Ulangi Kuis
            </button>
        </div>
    `;

    // Save score & add points to DB
    if (typeof saveQuizScore === 'function' && earnedPoints > 0) {
        saveQuizScore(mq.score, mq.questions.length, earnedPoints, mq.modId);
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

// Initialize quiz and empty states on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderBiodiversityReport === 'function') {
        // Init with empty data so it doesn't spin forever. 
        // If user logs in, auth.js will overwrite this with real data.
        renderBiodiversityReport([], 0, 0);
    }
    if (typeof renderHelpIdentifyCards === 'function') {
        renderHelpIdentifyCards([], null);
    }
    if (typeof renderEcoRoles === 'function') {
        renderEcoRoles([]);
    }
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
        const imgSrc = obs.image_url || obs.image_base64;
        const bgImg = imgSrc ? imgSrc : 'https://images.unsplash.com/photo-1418065460487-3e41a6c8e1e4?w=300&q=80';
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
            <div style="text-align: center; width: 100%; padding: 30px; color: #666; background: #f8f9fa; border-radius: 8px;">
                <i class="fas fa-seedling" style="font-size: 34px; color: var(--inat-green); margin-bottom: 12px;"></i>
                <h5 style="color: #333; margin-bottom: 8px;">Belum Ada Data Observasi Pribadi</h5>
                <p style="font-size: 0.9rem; margin-bottom: 15px;">Mulai berkontribusi untuk melihat statistik biodiversitas dari temuan Anda di sini.</p>
                <div style="padding-top: 15px; border-top: 1px dashed #ccc; text-align: left;">
                    <strong style="color: #444; font-size: 0.85rem; display:block; margin-bottom: 8px;">Jelajahi Basis Data Biodiversitas Global:</strong>
                    <a href="https://www.gbif.org/" target="_blank" class="btn-outline-sm" style="display: inline-block; margin-right: 5px; margin-bottom: 5px; text-decoration: none;"><i class="fas fa-globe"></i> GBIF</a>
                    <a href="https://www.inaturalist.org/observations" target="_blank" class="btn-outline-sm" style="display: inline-block; margin-right: 5px; margin-bottom: 5px; text-decoration: none;"><i class="fas fa-leaf"></i> iNaturalist Global</a>
                    <a href="https://kebunraya.id/" target="_blank" class="btn-outline-sm" style="display: inline-block; margin-bottom: 5px; text-decoration: none;"><i class="fas fa-tree"></i> Kebun Raya Indonesia</a>
                </div>
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

// ===== Peran Ekologis =====
const ecoDictionary = {
    'Phalaenopsis amabilis': {
        fungsi: 'Indikator kesehatan hutan; epifit yang bergantung pada kelembapan tinggi',
        adaptasi: 'Akar aerial untuk menyerap kelembapan udara; daun tebal untuk menyimpan air',
        kontribusi: 'Menyediakan habitat mikro bagi serangga; indikator kualitas ekosistem hutan'
    },
    'Rafflesia arnoldii': {
        fungsi: 'Parasit holoparasit pada akar liana Tetrastigma; spesies payung konservasi',
        adaptasi: 'Tidak memiliki daun, batang, atau akar sejati; bergantung penuh pada inang',
        kontribusi: 'Spesies karismatik yang mendorong konservasi hutan hujan'
    },
    'Nepenthes spp.': {
        fungsi: 'Karnivora yang mengendalikan populasi serangga; bioindikator habitat miskin hara',
        adaptasi: 'Daun termodifikasi menjadi kantong penangkap mangsa berlilin dan berisi enzim',
        kontribusi: 'Memfasilitasi siklus nitrogen di tanah yang sangat miskin unsur hara'
    },
    'Tectona grandis': {
        fungsi: 'Pohon dominan kanopi; menyediakan habitat bagi berbagai epifit dan burung',
        adaptasi: 'Menggugurkan daun (meranggas) saat musim kemarau untuk mengurangi transpirasi',
        kontribusi: 'Akar yang kuat mencegah erosi tanah; kayu tahan rayap karena zat tektokuinon'
    },
    'Imperata cylindrica': {
        fungsi: 'Spesies pionir yang cepat menutup lahan terbuka',
        adaptasi: 'Rimpang bawah tanah yang dalam membuatnya tahan terhadap pembakaran/kebakaran',
        kontribusi: 'Mencegah erosi permukaan pada lahan kritis meski menekan pertumbuhan semai pohon'
    },
    'Epiphyllum oxypetalum': {
        fungsi: 'Tanaman hias epifit; penarik polinator nokturnal seperti ngengat dan kelelawar',
        adaptasi: 'Bunga mekar di malam hari dengan aroma harum yang sangat kuat untuk memikat agen penyerbuk dalam kegelapan',
        kontribusi: 'Menyediakan nektar bagi serangga malam; menambah keanekaragaman tanaman epifit'
    },
    'Cycas revoluta': {
        fungsi: 'Tanaman hias purba yang toleran terhadap kekeringan; pengikat nitrogen melalui simbiosis',
        adaptasi: 'Daun kaku seperti jarum untuk mengurangi penguapan; akar koraloid menaungi cyanobacteria',
        kontribusi: 'Meningkatkan kesuburan tanah dengan mengikat nitrogen bebas; menyediakan habitat unik bagi mikrob simbiotik'
    }
};

function renderEcoRoles(observations) {
    const container = document.getElementById('eco-role-container');
    if (!container) return;

    if (!observations || observations.length === 0) {
        container.innerHTML = `<div style="text-align:center; width:100%; padding:20px; color:#888;">Anda belum memiliki observasi spesies untuk menampilkan peran ekologis secara personal. Identifikasi flora di sekitar Anda untuk membuka data ini.</div>`;
        return;
    }

    // Get unique species from observations
    const uniqueObs = [];
    const seen = new Set();
    observations.forEach(obs => {
        if (obs.scientific_name && !seen.has(obs.scientific_name)) {
            seen.add(obs.scientific_name);
            uniqueObs.push(obs);
        }
    });

    // Limit to first 4
    const displayObs = uniqueObs.slice(0, 4);
    
    let html = '';
    displayObs.forEach(obs => {
        // Fallback or exact match
        let ecoData = ecoDictionary[obs.scientific_name];
        
        // Coba cocokan string (misal Nepenthes)
        if (!ecoData) {
            for (let key in ecoDictionary) {
                if (obs.scientific_name.includes(key.replace(' spp.', ''))) {
                    ecoData = ecoDictionary[key];
                    break;
                }
            }
        }

        if (!ecoData) {
            ecoData = {
                fungsi: 'Menyediakan biomassa dan oksigen sebagai produsen primer; berperan dalam siklus nutrisi lokal',
                adaptasi: 'Beradaptasi terhadap kondisi mikroklimat tempat tumbuhnya (seperti tingkat cahaya dan ketersediaan air)',
                kontribusi: 'Menjadi bagian dari rantai makanan; tempat berlindung atau sumber pakan bagi fauna sekitarnya'
            };
        }

        const commonName = obs.species_name || 'Spesies Tumbuhan';
        const scientificName = obs.scientific_name || 'Plantae sp.';

        html += `
            <div class="eco-card">
                <div class="eco-species"><strong>${commonName}</strong> (<em>${scientificName}</em>)</div>
                <div class="eco-roles">
                    <div class="eco-role"><i class="fas fa-bug"></i><strong>Fungsi:</strong> ${ecoData.fungsi}</div>
                    <div class="eco-role"><i class="fas fa-dna"></i><strong>Adaptasi:</strong> ${ecoData.adaptasi}</div>
                    <div class="eco-role"><i class="fas fa-link"></i><strong>Kontribusi:</strong> ${ecoData.kontribusi}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}
