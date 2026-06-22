// identify.js

const imageInput = document.getElementById('image-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const resultsArea = document.getElementById('results-area');
const loadingSpinner = document.getElementById('loading-spinner');
const resultContent = document.getElementById('result-content');
const btnAnalyze = document.getElementById('btn-analyze');

let base64Image = null;

// Handle file selection
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // Check file size (max 4MB for base64 on Groq)
        if (file.size > 4 * 1024 * 1024) {
            alert("Ukuran file terlalu besar. Maksimal 4MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            base64Image = e.target.result;
            imagePreview.src = base64Image;
            
            // Show preview, hide placeholder
            uploadPlaceholder.classList.add('hidden');
            imagePreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Handle Analyze Button
btnAnalyze.addEventListener('click', async () => {
    if (!base64Image) {
        alert("Silakan pilih foto terlebih dahulu.");
        return;
    }

    // Show loading
    resultsArea.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    resultContent.classList.add('hidden');

    // Scroll to results
    resultsArea.scrollIntoView({ behavior: 'smooth' });

    try {
        await analyzeImageWithGroq(base64Image);
    } catch (error) {
        console.error("Analysis Error:", error);
        loadingSpinner.classList.add('hidden');
        resultContent.classList.remove('hidden');
        resultContent.innerHTML = `
            <div style="padding: 30px; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: #cc3333; margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 8px;">Terjadi Kesalahan</h3>
                <p style="color: #666; font-size: 0.9rem; line-height: 1.5;">${error.message}</p>
                <button class="btn-green" style="margin-top: 20px;" onclick="document.getElementById('btn-analyze').click()">
                    <i class="fas fa-redo"></i> Coba Lagi
                </button>
            </div>
        `;
    }
});

async function analyzeImageWithGroq(base64Data) {
    const groqApiKey = CONFIG.GROQ_API_KEY;
    if (!groqApiKey || groqApiKey.includes("GANTI")) {
        throw new Error("API Key Groq belum dikonfigurasi. Silakan isi API key di file config.js");
    }

    // Prompt for plant identification with Indonesian context — enhanced v2
    const promptText = `Anda adalah seorang ahli botani dan taksonomi yang sangat berpengalaman, khususnya dalam flora di Indonesia dan Asia Tenggara.

Saya memberikan Anda sebuah gambar tumbuhan. Tolong identifikasi tanaman tersebut dengan akurat.

Berikan jawaban Anda HANYA dalam format JSON yang valid (tanpa markdown backticks) dengan struktur PERSIS seperti ini:
{
    "name_id": "Nama Umum Tanaman (Bahasa Indonesia)",
    "scientific_name": "Nama Ilmiah Tanaman (Genus species)",
    "confidence": "Tinggi/Sedang/Rendah",
    "classification": {
        "kingdom": "Plantae",
        "phylum": "...",
        "class": "...",
        "order": "...",
        "family": "...",
        "genus": "...",
        "species": "..."
    },
    "distribution_indonesia": "Jelaskan persebaran tanaman ini di Indonesia secara detail. Sebutkan pulau-pulau atau provinsi mana saja tanaman ini banyak ditemukan. Minimal 3-4 kalimat.",
    "distribution_world": "Jelaskan persebaran tanaman ini di dunia. Sebutkan benua, negara, atau wilayah biogeografi mana saja. Minimal 2-3 kalimat.",
    "habitat": "Jelaskan karakteristik habitat alami tanaman ini secara detail: tipe ekosistem, ketinggian, kelembapan, jenis tanah, pencahayaan, dan kondisi lingkungan yang dibutuhkan. Minimal 3-4 kalimat.",
    "fun_fact": "Berikan satu paragraf (minimal 4-5 kalimat) mengenai pengetahuan unik, manfaat, atau fun fact mengenai tumbuhan tersebut khususnya dalam konteks Indonesia. Bisa meliputi penggunaan tradisional, keunikan biologis, status konservasi, atau peran ekologisnya.",
    "ecological_role": "Jelaskan peran ekologis tumbuhan ini: fungsinya dalam ekosistem, interaksi dengan organisme lain (polinator, herbivora, simbiosis), dan kontribusinya terhadap lingkungan. Minimal 2-3 kalimat.",
    "related_species": [
        {
            "name": "Nama spesies terkait 1",
            "scientific_name": "Nama ilmiah"
        },
        {
            "name": "Nama spesies terkait 2",
            "scientific_name": "Nama ilmiah"
        }
    ],
    "references": [
        {
            "citation": "Kutip minimal 3 artikel jurnal ilmiah open access nyata (wajib terbitan 10 tahun terakhir) yang membahas tumbuhan ini berformat APA Style.",
            "search_query": "Judul spesifik dari artikel tersebut untuk bahan pencarian"
        },
        {
            "citation": "Referensi ke-2 berformat APA Style (10 tahun terakhir)",
            "search_query": "Judul artikel ke-2"
        },
        {
            "citation": "Referensi ke-3 berformat APA Style (10 tahun terakhir)",
            "search_query": "Judul artikel ke-3"
        }
    ]
}

- Pastikan output HANYA berupa JSON murni tanpa teks lain.
- OUTPUT HARUS 100% VALID JSON. JANGAN gunakan komentar (//) di dalam JSON. JANGAN gunakan kutip ganda (") di dalam nilai string, ganti dengan kutip tunggal (') jika perlu.
- Berikan MINIMAL 3 referensi jurnal ilmiah NYATA (publikasi 10 tahun terakhir). Alih-alih memberikan DOI yang sering error, berikan "search_query" yang berisi judul spesifik artikel tersebut agar kami dapat mengarahkannya ke pencarian Google Scholar.
- Setiap referensi harus memiliki field "citation" dalam format APA Style (tanpa menyertakan url/doi di dalamnya) dan "search_query" (judul paper).
- Jika Anda tidak 100% yakin, berikan tebakan terbaik dan set confidence ke "Sedang" atau "Rendah".`;

    // Extract base64 data without header
    const base64Clean = base64Data.split(',')[1];
    const mimeType = base64Data.split(';')[0].split(':')[1] || 'image/jpeg';

    const requestBody = {
        model: CONFIG.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: promptText },
                    { 
                        type: "image_url", 
                        image_url: { 
                            url: `data:${mimeType};base64,${base64Clean}` 
                        } 
                    }
                ]
            }
        ],
        temperature: 0.1,
        max_tokens: 3000
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP Error ${response.status}`;
        throw new Error(`Gagal menghubungi server AI Groq: ${errMsg}`);
    }

    const data = await response.json();
    let aiResponseText = data.choices[0].message.content;

    // Clean up potential markdown formatting
    aiResponseText = aiResponseText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    
    // Clean up trailing commas before closing braces/brackets (common LLM JSON error)
    aiResponseText = aiResponseText.replace(/,\s*([}\]])/g, "$1");

    // Try to extract JSON if there's extra text
    const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        aiResponseText = jsonMatch[0];
    }

    try {
        const parsedData = JSON.parse(aiResponseText);

        // Fetch 3 Real Open Access Journals using OpenAlex based on species name
        try {
            let searchQuery = "Tumbuhan";
            if (parsedData.classification) {
                searchQuery = parsedData.classification.species || parsedData.classification.genus || "Plant";
            }
            
            // Mengambil 3 artikel dari 10 tahun terakhir yang Open Access
            const oaRes = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(searchQuery)}&filter=is_oa:true,publication_year:>2013&per-page=3`);
            if (oaRes.ok) {
                const oaData = await oaRes.json();
                if (oaData.results && oaData.results.length > 0) {
                    parsedData.references = oaData.results.map(work => {
                        // Build APA citation manually
                        let authors = "Penulis Tidak Diketahui";
                        if (work.authorships && work.authorships.length > 0) {
                            const authorNames = work.authorships.slice(0, 3).map(a => a.author.display_name);
                            authors = authorNames.join(", ") + (work.authorships.length > 3 ? " et al." : "");
                        }
                        const year = work.publication_year || "n.d.";
                        const title = work.title || "Tanpa Judul";
                        const journal = work.primary_location?.source?.display_name || "Jurnal Ilmiah";
                        
                        let citation = `${authors} (${year}). ${title}. <i>${journal}</i>.`;
                        
                        return {
                            citation: citation,
                            real_doi: work.doi || work.primary_location?.landing_page_url || work.id,
                            search_query: title
                        };
                    });
                }
            }
        } catch (oaErr) {
            console.warn("OpenAlex fetch failed", oaErr);
        }

        displayResults(parsedData);

        // Save to Supabase if logged in
        if (typeof saveObservation === 'function') {
            // Create a small thumbnail for DB storage
            let thumbnail = null;
            try {
                const canvas = document.createElement('canvas');
                const img = document.getElementById('image-preview');
                const maxW = 200;
                const ratio = maxW / img.naturalWidth;
                canvas.width = maxW;
                canvas.height = img.naturalHeight * ratio;
                const ctx2 = canvas.getContext('2d');
                ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
                thumbnail = canvas.toDataURL('image/jpeg', 0.5);
            } catch (thumbErr) {
                console.warn('Thumbnail creation failed:', thumbErr);
            }
            parsedData.image_thumbnail = thumbnail;
            saveObservation(parsedData).then(saved => {
                if (saved && typeof showToast === 'function') {
                    showToast('Observasi berhasil disimpan ke database!');
                }
            });
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw response:", aiResponseText);
        throw new Error("AI memberikan respons yang tidak bisa dipahami. Silakan coba lagi dengan foto yang lebih jelas.");
    }
}

function displayResults(data) {
    loadingSpinner.classList.add('hidden');
    resultContent.classList.remove('hidden');

    // Build taxonomy grid
    const classification = data.classification || {};
    let taxonomyHtml = '';
    const taxonLabels = {
        kingdom: 'Kingdom',
        phylum: 'Filum',
        class: 'Kelas',
        order: 'Ordo',
        family: 'Famili',
        genus: 'Genus',
        species: 'Spesies'
    };
    
    for (const [key, label] of Object.entries(taxonLabels)) {
        if (classification[key]) {
            taxonomyHtml += `<div class="taxonomy-item"><strong>${label}:</strong> ${classification[key]}</div>`;
        }
    }

    // Build related species
    let relatedHtml = '';
    if (data.related_species && data.related_species.length > 0) {
        relatedHtml = `
            <div class="result-section">
                <h4><i class="fas fa-seedling"></i> Spesies Terkait</h4>
                <div class="taxonomy-grid">
                    ${data.related_species.map(sp => `
                        <div class="taxonomy-item">
                            <strong>${sp.name}</strong><br>
                            <em style="font-size: 0.82rem; color: #666;">${sp.scientific_name}</em>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Build references (APA Style)
    let refsHtml = '';
    if (data.references && data.references.length > 0) {
        refsHtml = `<ul class="reference-list">`;
        data.references.forEach(ref => {
            if (ref.citation) {
                // Remove trailing dots from citation to avoid double dots
                let cleanCitation = ref.citation.trim();
                
                // Use Crossref real DOI if successfully fetched
                if (ref.real_doi) {
                    refsHtml += `<li>${cleanCitation} <br><a href="${ref.real_doi}" target="_blank" rel="noopener" style="color:var(--inat-green);"><i class="fas fa-book" style="font-size:0.75rem;"></i> Buka Artikel Asli (DOI)</a></li>`;
                }
                // Fallback to Google Scholar if Crossref fails but we have a search_query
                else if (ref.search_query) {
                    const scholarLink = `https://scholar.google.com/scholar?q=${encodeURIComponent(ref.search_query)}`;
                    refsHtml += `<li>${cleanCitation} <br><a href="${scholarLink}" target="_blank" rel="noopener"><i class="fas fa-external-link-alt" style="font-size:0.75rem;"></i> Cari di Google Scholar</a></li>`;
                } else if (ref.doi_link) {
                    refsHtml += `<li>${cleanCitation} <br><a href="${ref.doi_link}" target="_blank" rel="noopener">${ref.doi_link}</a></li>`;
                } else {
                    refsHtml += `<li>${cleanCitation}</li>`;
                }
            } else {
                // Fallback for old format
                const authors = ref.authors ? `${ref.authors}. ` : '';
                const link = ref.doi_link || `https://scholar.google.com/scholar?q=${encodeURIComponent(ref.title)}`;
                refsHtml += `<li>${authors}<a href="${link}" target="_blank" rel="noopener">${ref.title}</a></li>`;
            }
        });
        refsHtml += `</ul>`;
    } else {
        refsHtml = `<p style="color: #999; font-size: 0.9rem;">Tidak ada referensi spesifik yang ditemukan.</p>`;
    }

    // Confidence badge
    const confidenceColors = {
        'Tinggi': '#74ac00',
        'Sedang': '#e6a800',
        'Rendah': '#cc3333'
    };
    const confColor = confidenceColors[data.confidence] || '#999';
    const confBadge = data.confidence ? 
        `<span style="display:inline-block; padding:3px 10px; border-radius:20px; background:${confColor}; color:white; font-size:0.75rem; font-weight:600; margin-left:10px;">Keyakinan: ${data.confidence}</span>` : '';

    resultContent.innerHTML = `
        <div class="result-card">
            <div class="result-header">
                <h3>${data.name_id || 'Tidak diketahui'} ${confBadge}</h3>
                <span class="sciname">${data.scientific_name || ''}</span>
            </div>
            <div class="result-body">
                
                <div class="result-section">
                    <h4><i class="fas fa-sitemap"></i> Klasifikasi Taksonomi</h4>
                    <div class="taxonomy-grid">
                        ${taxonomyHtml}
                    </div>
                </div>

                <div class="result-section">
                    <h4><i class="fas fa-map-marked-alt"></i> Persebaran di Indonesia</h4>
                    <p style="text-align: justify;">${data.distribution_indonesia || 'Data persebaran tidak tersedia.'}</p>
                </div>

                <div class="result-section">
                    <h4><i class="fas fa-globe-americas"></i> Persebaran di Dunia</h4>
                    <p style="text-align: justify;">${data.distribution_world || 'Data persebaran global tidak tersedia.'}</p>
                </div>

                <div class="result-section">
                    <h4><i class="fas fa-mountain"></i> Karakteristik Habitat</h4>
                    <p style="text-align: justify;">${data.habitat || 'Informasi habitat tidak tersedia.'}</p>
                </div>

                <div class="result-section">
                    <h4><i class="fas fa-lightbulb"></i> Fun Fact / Pengetahuan Unik</h4>
                    <p style="text-align: justify;">${data.fun_fact || 'Tidak ada informasi tambahan.'}</p>
                </div>

                <div class="result-section">
                    <h4><i class="fas fa-leaf"></i> Peran Ekologis</h4>
                    <p style="text-align: justify;">${data.ecological_role || 'Informasi peran ekologis tidak tersedia.'}</p>
                </div>

                ${relatedHtml}

                <div class="result-section">
                    <h4><i class="fas fa-book-open"></i> Referensi Jurnal (Open Access)</h4>
                    ${refsHtml}
                </div>

            </div>
        </div>
    `;
}
