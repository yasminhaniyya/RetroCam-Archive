/**
 * RetroCam Archive - Camera Detail View (Halaman 2)
 * Ditampilkan ketika item pada list kamera diklik (Ketentuan 4)
 */

const CameraDetailView = {
  cameraId: null,
  camera: null,

  async render(params = {}) {
    this.cameraId = params.id;
    return `
      <section class="page-container page-detail animate-fade-in" id="camera-detail-root">
        <!-- Floating Back Button & Top Navigation -->
        <div class="detail-nav-bar">
          <button class="btn-back" id="btn-back-to-cameras">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Kembali ke Katalog</span>
          </button>
          <div class="breadcrumb-nav">
            <a href="#cameras">Kamera</a> / <span class="active" id="detail-breadcrumb-title">Memuat...</span>
          </div>
        </div>

        <div id="camera-detail-content">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat spesifikasi teknis kamera dari Web Service...</p>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const backBtn = document.getElementById('btn-back-to-cameras');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.hash = '#cameras';
      });
    }

    if (!this.cameraId) {
      this.renderError('ID kamera tidak valid.');
      return;
    }

    await this.loadCameraDetail();
  },

  async loadCameraDetail() {
    const container = document.getElementById('camera-detail-content');
    const breadcrumb = document.getElementById('detail-breadcrumb-title');

    try {
      const camera = await ApiService.getCameraById(this.cameraId);
      if (!camera) {
        this.renderError(`Kamera dengan ID "${this.cameraId}" tidak ditemukan di database Web Service.`);
        return;
      }

      this.camera = camera;
      if (breadcrumb) breadcrumb.textContent = camera.name;

      const isFav = StorageService.isCameraFavorite(camera.id);

      container.innerHTML = `
        <!-- Detail Hero Banner -->
        <div class="detail-hero-card card-glass">
          <div class="detail-hero-layout">
            <div class="detail-image-box">
              <img 
                src="${camera.imageUrl}" 
                alt="${camera.name}" 
                class="detail-hero-img" 
                onerror="this.src='/icons/icon-512.png'"
              />
              <div class="detail-img-overlay-badges">
                <span class="badge-accent">${camera.category || 'Kamera Digital'}</span>
                <span class="badge-year">Tahun ${camera.releaseYear}</span>
              </div>
            </div>

            <div class="detail-hero-info">
              <div class="detail-meta-brand">${camera.brand} &bull; Digital Series</div>
              <h1 class="detail-title">${camera.name}</h1>
              <p class="detail-summary">${camera.summary}</p>

              <div class="detail-quick-specs">
                <div class="quick-spec-item">
                  <span class="qs-label">Tipe Sensor</span>
                  <span class="qs-value">${camera.sensorType}</span>
                </div>
                <div class="quick-spec-item">
                  <span class="qs-label">Resolusi</span>
                  <span class="qs-value">${camera.megapixels} MP</span>
                </div>
                <div class="quick-spec-item">
                  <span class="qs-label">Lensa Bawaan</span>
                  <span class="qs-value">${camera.zoom || 'Optik Zoom'}</span>
                </div>
                <div class="quick-spec-item">
                  <span class="qs-label">Rating Komunitas</span>
                  <span class="qs-value highlight-gold">★ ${camera.rating} / 5.0</span>
                </div>
              </div>

              <div class="detail-action-row">
                <button 
                  id="btn-detail-fav-toggle" 
                  class="btn ${isFav ? 'btn-fav-active' : 'btn-fav'}"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span id="fav-btn-text">${isFav ? 'Tersimpan di Koleksi Saya' : 'Simpan ke Koleksi Saya'}</span>
                </button>

                ${StorageService.isAdmin() ? `
                  <button id="btn-admin-edit-camera-detail" class="btn btn-secondary" style="border-color: #0284c7; color: #0284c7; font-weight: 600;">
                    ✏️ Edit Data Kamera
                  </button>
                ` : ''}

                <div class="market-price-pill">
                  <span class="market-price-label">Harga Pasar:</span>
                  <strong class="market-price-amt">${camera.estimatedPriceIdr}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Color Profile / Film Look Section -->
        <div class="info-card tone-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Karakteristik Tonal & Warna</h3>
              <p class="subtitle-small">Karakter visual dan saturasi warna sensor ${camera.sensorType}</p>
            </div>
          </div>
          <div class="tone-card-body">
            <p>${camera.colorProfile}</p>
          </div>
        </div>

        <!-- Full Technical Specifications Table -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Spesifikasi Teknis</h3>
              <p class="subtitle-small">Data spesifikasi perangkat keras resmi</p>
            </div>
          </div>

          <div class="specs-table-grid">
            <div class="spec-cell">
              <span class="spec-k">Sensor & Ukuran</span>
              <span class="spec-v">${camera.sensorType} (${camera.sensorSize})</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Resolusi Efektif</span>
              <span class="spec-v">${camera.megapixels} Megapiksel (${camera.maxResolution})</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Optik Lensa</span>
              <span class="spec-v">${camera.lens}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Rentang ISO</span>
              <span class="spec-v">${camera.isoRange}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Kecepatan Shutter</span>
              <span class="spec-v">${camera.shutterSpeed}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Layar Tampilan</span>
              <span class="spec-v">${camera.screen}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Media Simpan</span>
              <span class="spec-v">${camera.storageType}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Tipe Baterai</span>
              <span class="spec-v">${camera.battery}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Bobot Fisik</span>
              <span class="spec-v">${camera.weight}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-k">Tahun Rilis Pasar</span>
              <span class="spec-v">${camera.releaseYear}</span>
            </div>
          </div>
        </div>

        <!-- Description Narrative -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Deskripsi & Sejarah Produk</h3>
              <p class="subtitle-small">Catatan kuratorial arsip kamera</p>
            </div>
          </div>
          <div class="narrative-body">
            <p>${camera.description}</p>
          </div>
        </div>

        <!-- Pros & Cons Comparison -->
        <div class="pros-cons-grid">
          <div class="pros-card card-glass">
            <h4 class="pros-title">Kelebihan</h4>
            <ul class="pros-list">
              ${camera.pros.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>

          <div class="cons-card card-glass">
            <h4 class="cons-title">Catatan Penggunaan</h4>
            <ul class="cons-list">
              ${camera.cons.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Bottom Action CTA -->
        <div class="detail-footer-cta">
          <a href="#cameras" class="btn btn-secondary">&larr; Lihat Kamera Lainnya</a>
          <a href="#guides" class="btn btn-outline">Baca Panduan Perawatan Sensor &rarr;</a>
        </div>
      `;

      // Bind Detail Favorite Button
      const favBtn = document.getElementById('btn-detail-fav-toggle');
      if (favBtn) {
        favBtn.addEventListener('click', () => {
          const added = StorageService.toggleFavoriteCamera(camera);
          favBtn.classList.toggle('btn-fav-active', added);
          favBtn.classList.toggle('btn-fav', !added);
          const textSpan = document.getElementById('fav-btn-text');
          const svg = favBtn.querySelector('svg');
          if (textSpan) {
            textSpan.textContent = added ? 'Tersimpan di Koleksi Saya' : 'Simpan ke Koleksi Saya';
          }
          if (svg) {
            svg.setAttribute('fill', added ? 'currentColor' : 'none');
          }
          if (window.App && window.App.showToast) {
            window.App.showToast(added ? `📷 ${camera.name} ditambahkan ke koleksi!` : `Dihapus dari koleksi.`);
          }
        });
      }

      // Admin Edit Button in Detail View
      const editDetailBtn = document.getElementById('btn-admin-edit-camera-detail');
      if (editDetailBtn) {
        editDetailBtn.onclick = () => {
          if (window.openEditCameraModal) {
            window.openEditCameraModal(camera);
          }
        };
      }

    } catch (err) {
      this.renderError(err.message);
    }
  },

  renderError(msg) {
    const container = document.getElementById('camera-detail-content');
    if (container) {
      container.innerHTML = `
        <div class="error-state card-glass">
          <div class="empty-icon">⚠️</div>
          <h3>Terjadi Kesalahan</h3>
          <p>${msg}</p>
          <a href="#cameras" class="btn btn-primary">Kembali ke Daftar Kamera</a>
        </div>
      `;
    }
  }
};

window.CameraDetailView = CameraDetailView;
