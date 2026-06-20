// app.js - v4 (with Supabase integration)

let isLoggedIn = false;
let previousView = 'view-home';

// ===== SPA Navigation =====
function navigateTo(viewId) {
    const current = document.querySelector('.view.active');
    if (current) previousView = current.id;
    
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
    navigateTo(previousView || (isLoggedIn ? 'view-dashboard' : 'view-home'));
}

// ===== Generic / Placeholder Page =====
function openGenericPage(title) {
    const titleEl = document.getElementById('generic-title');
    if(titleEl) titleEl.textContent = title;
    navigateTo('view-generic');
}

// ===== Observation Detail Modal =====
function showObsDetail(name, sciName, location) {
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
            <button class="btn-outline btn-sm" onclick="closeObsDetail();">Tutup</button>
        </div>
    `;
    document.getElementById('obs-detail-modal').classList.add('active');
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
}

// Load Explore Data from Supabase
async function loadExploreDataFromDB() {
    if (typeof getAllObservations !== 'function') return;
    
    const obsGrid = document.getElementById('obs-grid');
    const obsList = document.getElementById('obs-list-body');
    
    if (!obsGrid || !obsList) return;
    
    const data = await getAllObservations();
    
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
        
        // Placeholder gambar jika tidak ada (meski sudah diseed)
        const imgUrl = obs.image_base64 && obs.image_base64.startsWith('http') 
            ? obs.image_base64 
            : (obs.image_base64 || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/600px-No_Image_Available.jpg');

        // Tambahkan ke Grid
        const card = document.createElement('div');
        card.className = 'obs-card';
        card.onclick = () => showObsDetail(name, sciName, location);
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

// Close profile dropdown on click elsewhere
document.addEventListener('click', (e) => {
    const trigger = document.getElementById('profile-trigger');
    const dropdown = document.getElementById('profile-dropdown');
    if (trigger && dropdown && !trigger.contains(e.target)) {
        dropdown.classList.remove('active');
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
let lacakData = [
    { nama: 'Anggrek Bulan', tanggal: '2026-05-15', tinggi: 20, daun: 7, fase: 'Perkecambahan', kondisi: 'Sehat', catatan: 'Tanaman baru dipindahkan ke pot yang lebih besar.' },
    { nama: 'Anggrek Bulan', tanggal: '2026-06-01', tinggi: 30, daun: 10, fase: 'Vegetatif', kondisi: 'Sehat', catatan: 'Pertumbuhan daun baru, media tanam diganti.' },
    { nama: 'Anggrek Bulan', tanggal: '2026-06-15', tinggi: 35, daun: 12, fase: 'Berbunga', kondisi: 'Sehat', catatan: 'Muncul 3 tangkai bunga baru, kuncup mulai membuka.' }
];

let growthChart = null;

// Called from auth.js when DB data loads
function updateLacakFromDB(dbEntries) {
    if (!dbEntries || dbEntries.length === 0) return;
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

    const entry = { nama, tanggal, tinggi, daun, fase, kondisi, catatan };
    lacakData.push(entry);

    // Save to Supabase
    if (typeof saveLacakEntry === 'function') {
        saveLacakEntry(entry);
    }

    // Re-render timeline and chart
    renderTimeline();
    initGrowthChart();

    // Clear form
    document.getElementById('lacak-nama').value = '';
    document.getElementById('lacak-tanggal').value = '';
    document.getElementById('lacak-tinggi').value = '';
    document.getElementById('lacak-daun').value = '';
    document.getElementById('lacak-catatan').value = '';

    // Show success toast
    showToast('Catatan pemantauan berhasil disimpan!');
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
    // (If not logged in, auth.js will still allow fetching if RLS permits public read, 
    // or auth.js' onLogin will call it after seeding)
    setTimeout(() => {
        if (typeof loadExploreDataFromDB === 'function') {
            loadExploreDataFromDB();
        }
    }, 1000);
});

// Initialize quiz on page load
document.addEventListener('DOMContentLoaded', () => {
    renderQuiz();
});
