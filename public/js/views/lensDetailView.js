/**
 * RetroCam Archive - Lens Detail View (Halaman 4)
 * Ditampilkan ketika item pada list lensa diklik (Ketentuan 4)
 */

const LensDetailView = {
  lensId: null,
  lens: null,

  async render(params = {}) {
    this.lensId = params.id;
    return `
      <section class="page-container page-detail animate-fade-in" id="lens-detail-root">
        <!-- Floating Back Button & Top Navigation -->
        <div class="detail-nav-bar">
          <button class="btn-back" id="btn-back-to-lenses">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Kembali ke Katalog Lensa</span>
          </button>
          <div class="breadcrumb-nav">
            <a href="#lenses">Lensa</a> / <span class="active" id="detail-lens-breadcrumb-title">Memuat...</span>
          </div>
        </div>

        <div id="lens-detail-content">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Mengambil data optik lensa dari Web Service...</p>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const backBtn = document.getElementById('btn-back-to-lenses');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.hash = '#lenses';
      });
    }

    if (!this.lensId) {
      this.renderError('ID lensa tidak valid.');
      return;
    }

    await this.loadLensDetail();
  },

  async loadLensDetail() {
    const container = document.getElementById('lens-detail-content');
    const breadcrumb = document.getElementById('detail-lens-breadcrumb-title');

    try {
      const lens = await ApiService.getLensById(this.lensId);
      if (!lens) {
        this.renderError(`Lensa dengan ID "${this.lensId}" tidak ditemukan di database Web Service.`);
        return;
      }

      this.lens = lens;
      if (breadcrumb) breadcrumb.textContent = lens.name;

      const isFav = StorageService.isLensFavorite(lens.id);

      container.innerHTML = `
        <!-- Detail Hero Banner -->
        <div class="detail-hero-card card-glass">
          <div class="detail-hero-layout">
            <div class="detail-image-box">
              <img 
                src="${lens.imageUrl}" 
                alt="${lens.name}" 
                class="detail-hero-img" 
                onerror="this.src='/icons/icon-512.png'"
              />
              <div class="detail-img-overlay-badges">
                <span class="badge-accent">${lens.tag || lens.mount}</span>
                <span class="badge-year">Tahun ${lens.releaseYear}</span>
              </div>
            </div>

            <div class="detail-hero-info">
              <div class="detail-meta-brand">${lens.brand} &bull; ${lens.category || 'Kamera Lensa'}</div>
              <h1 class="detail-title">${lens.name}</h1>
              <p class="detail-summary">${lens.summary}</p>

              <div class="detail-quick-specs">
                <div class="quick-spec-item">
                  <span class="qs-label">Dudukan Mount</span>
                  <span class="qs-value">${lens.mount}</span>
                </div>
                <div class="quick-spec-item">
                  <span class="qs-label">Bukaan Maksimal</span>
                  <span class="qs-value">${lens.maxAperture}</span>
                </div>
                <div class="quick-spec-item">
                  <span class="qs-label">Bilah Aperture</span>
                  <span class="qs-value">${lens.apertureBlades} Blades</span>
                </div>
                <div class="quick-spec-item">
                  <span class="qs-label">Rating Optik</span>
                  <span class="qs-value highlight-gold">★ ${lens.rating} / 5.0</span>
                </div>
              </div>

              <div class="detail-action-row">
                <button 
                  id="btn-lens-detail-fav-toggle" 
                  class="btn ${isFav ? 'btn-fav-active' : 'btn-fav'}"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span id="lens-fav-btn-text">${isFav ? 'Tersimpan di Koleksi Saya' : 'Simpan ke Koleksi Saya'}</span>
                </button>

                <div class="market-price-pill">
                  <span class="market-price-label">Harga Pasar:</span>
                  <strong class="market-price-amt">${lens.estimatedPriceIdr}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bokeh & Optical Character Section -->
        <div class="info-card tone-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Karakter Bokeh & Render Optik</h3>
              <p class="subtitle-small">Karakteristik visual dan render optik khas</p>
            </div>
          </div>
          <div class="tone-card-body">
            <p>${lens.bokehCharacter}</p>
          </div>
        </div>

        <!-- Full Technical Specifications Table -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Spesifikasi Fisik & Optik</h3>
              <p class="subtitle-small">Data teknis mekanik dan elemen lensa</p>
            </div>
          </div>

          <div class="specs-table-grid">
            <div class="spec-cell">
              <span class="spec-k">Panjang Fokal</span>
              <span class="spec-v">${lens.focalLength}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Bukaan Diafragma</span>
              <span class="spec-v">${lens.maxAperture} - ${lens.minAperture}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Jumlah Bilah (Blades)</span>
              <span class="spec-v">${lens.apertureBlades} Blades</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Formula Optik</span>
              <span class="spec-v">${lens.opticalDesign}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Dudukan (Mount)</span>
              <span class="spec-v">${lens.mount}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Diameter Filter Ulir</span>
              <span class="spec-v">${lens.filterSize}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Jarak Fokus Minimal</span>
              <span class="spec-v">${lens.minFocusDistance}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Bobot Fisik</span>
              <span class="spec-v">${lens.weight}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Tahun Rilis</span>
              <span class="spec-v">${lens.releaseYear}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Merek / Produsen</span>
              <span class="spec-v">${lens.brand}</span>
            </div>
          </div>
        </div>

        <!-- Mount Compatibility Info -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Dukungan Mount & Kompatibilitas Bodi</h3>
              <p class="subtitle-small">Kesesuaian sistem kamera dan ekosistem lensa</p>
            </div>
          </div>
          <div class="narrative-body">
            <p><strong>Dudukan Lensa:</strong> ${lens.mount}</p>
            <p class="mt-2 text-muted">
              ${lens.mount.includes('Sony') ? 'Dapat dipasang langsung pada seluruh kamera Sony Alpha Mirrorless (Full-Frame FE maupun APS-C E-mount). Mendukung penuh autofokus Hybrid Phase Detection, Eye AF real-time, dan stabilisasi sensor IBIS.' :
                lens.mount.includes('Canon') ? 'Dirancang langsung untuk ekosistem Canon EOS R system (full-frame & APS-C RF). Kompatibel penuh dengan Dual Pixel CMOS AF II dan integrasi kontrol cincin lens ring.' :
                lens.mount.includes('Nikon') ? 'Dirancang optimal untuk kamera mirrorless Nikon Z series berdiameter bayonet 55mm. Mendukung penuh AF pendeteksi subjek cerdas dan sinkronisasi VR optik.' :
                lens.mount.includes('Fujifilm') ? 'Dirancang presisi untuk kamera mirrorless Fujifilm X-mount sensor APS-C X-Trans. Mendukung simulasi film Fujifilm, aperture ring fisik, dan AF berkecepatan tinggi.' :
                lens.mount.includes('Micro Four Thirds') ? 'Kompatibel penuh dengan seluruh sistem kamera Micro Four Thirds (OM SYSTEM, Olympus, dan Panasonic Lumix G series).' :
                'Dirancang untuk ekosistem L-Mount Alliance (kompatibel penuh dengan Panasonic Lumix S series, Leica SL, dan Sigma fp).'}
            </p>
          </div>
        </div>

        <!-- Narrative Overview -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Ulasan & Keunggulan Lensa</h3>
              <p class="subtitle-small">Catatan kuratorial katalog Yodobashi Camera</p>
            </div>
          </div>
          <div class="narrative-body">
            <p>${lens.description}</p>
          </div>
        </div>

        <!-- Pros & Cons Comparison -->
        <div class="pros-cons-grid">
          <div class="pros-card card-glass">
            <h4 class="pros-title">Kelebihan</h4>
            <ul class="pros-list">
              ${lens.pros.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>

          <div class="cons-card card-glass">
            <h4 class="cons-title">Catatan Penggunaan</h4>
            <ul class="cons-list">
              ${lens.cons.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Bottom Action CTA -->
        <div class="detail-footer-cta">
          <a href="#lenses" class="btn btn-secondary">&larr; Lihat Lensa Lainnya</a>
          <a href="#guides" class="btn btn-outline">Baca Panduan & Tips Fotografi &rarr;</a>
        </div>
      `;

      // Bind Detail Favorite Button
      const favBtn = document.getElementById('btn-lens-detail-fav-toggle');
      if (favBtn) {
        favBtn.addEventListener('click', () => {
          const added = StorageService.toggleFavoriteLens(lens);
          favBtn.classList.toggle('btn-fav-active', added);
          favBtn.classList.toggle('btn-fav', !added);
          const textSpan = document.getElementById('lens-fav-btn-text');
          const svg = favBtn.querySelector('svg');
          if (textSpan) {
            textSpan.textContent = added ? 'Tersimpan di Koleksi Saya' : 'Simpan ke Koleksi Saya';
          }
          if (svg) {
            svg.setAttribute('fill', added ? 'currentColor' : 'none');
          }
          if (window.App && window.App.showToast) {
            window.App.showToast(added ? `🔍 ${lens.name} ditambahkan ke koleksi!` : `Dihapus dari koleksi.`);
          }
        });
      }

    } catch (err) {
      this.renderError(err.message);
    }
  },

  renderError(msg) {
    const container = document.getElementById('lens-detail-content');
    if (container) {
      container.innerHTML = `
        <div class="error-state card-glass">
          <div class="empty-icon">⚠️</div>
          <h3>Terjadi Kesalahan</h3>
          <p>${msg}</p>
          <a href="#lenses" class="btn btn-primary">Kembali ke Daftar Lensa</a>
        </div>
      `;
    }
  }
};

window.LensDetailView = LensDetailView;
