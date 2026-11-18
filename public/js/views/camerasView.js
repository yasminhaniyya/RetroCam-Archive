/**
 * RetroCam Archive - Cameras List View (Halaman 1)
 */

const CamerasView = {
  state: {
    cameras: [],
    loading: true,
    error: null,
    search: '',
    sensor: 'all',
    brand: 'all',
    sort: 'year-desc'
  },

  async render() {
    return `
      <section class="page-container page-cameras animate-fade-in">
        <!-- Hero Header -->
        <header class="section-hero">
          <div class="hero-badge"><span class="badge-dot"></span> Era Sensor CCD 2000-an</div>
          <h1 class="hero-title">Katalog Kamera Digital Klasik</h1>
          <p class="hero-subtitle">
            Eksplorasi kamera saku dan prosumer legendaris dengan karakter warna hangat, highlight filmis, dan nostalgia estetika awal milenium.
          </p>
        </header>

        <!-- Search & Filter Controls -->
        <div class="filter-panel card-glass">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              id="camera-search-input" 
              class="input-search" 
              placeholder="Cari kamera (misal: G2, FinePix, CCD, Canon)..." 
              value="${this.state.search}"
            />
            ${this.state.search ? `<button id="btn-clear-camera-search" class="btn-clear">&times;</button>` : ''}
          </div>

          <!-- Brand Chips -->
          <div class="filter-row">
            <span class="filter-label">Merek:</span>
            <div class="chips-scroll" id="brand-chips">
              ${['all', 'Canon', 'Fujifilm', 'Sony', 'Olympus', 'Nikon', 'Ricoh', 'Leica', 'Pentax', 'Kodak'].map(b => `
                <button class="chip ${this.state.brand.toLowerCase() === b.toLowerCase() ? 'active' : ''}" data-brand="${b}">
                  ${b === 'all' ? 'Semua Merek' : b}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Sensor & Sort Row -->
          <div class="filter-meta-row">
            <div class="select-group">
              <label for="sensor-select">Sensor:</label>
              <select id="sensor-select" class="custom-select">
                <option value="all" ${this.state.sensor === 'all' ? 'selected' : ''}>Semua Tipe Sensor</option>
                <option value="CCD" ${this.state.sensor === 'CCD' ? 'selected' : ''}>Standard CCD</option>
                <option value="Super CCD" ${this.state.sensor === 'Super CCD' ? 'selected' : ''}>Fujifilm Super CCD</option>
              </select>
            </div>

            <div class="select-group">
              <label for="sort-select">Urutkan:</label>
              <select id="sort-select" class="custom-select">
                <option value="year-desc" ${this.state.sort === 'year-desc' ? 'selected' : ''}>Tahun Terbaru</option>
                <option value="year-asc" ${this.state.sort === 'year-asc' ? 'selected' : ''}>Tahun Terlama</option>
                <option value="mp-desc" ${this.state.sort === 'mp-desc' ? 'selected' : ''}>Megapixel Tertinggi</option>
                <option value="rating-desc" ${this.state.sort === 'rating-desc' ? 'selected' : ''}>Rating Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Result Status Counter -->
        <div class="list-meta-header">
          <div class="results-count" id="camera-results-count">
            Memuat arsip kamera...
          </div>
          <div class="api-source-badge">
            <span class="dot-live"></span> Web Service Modul 1
          </div>
        </div>

        <!-- Camera Cards Grid -->
        <div id="camera-cards-grid" class="cards-grid">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Mengambil data dari API REST Web Service...</p>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    this.bindEvents();
    await this.loadData();
  },

  bindEvents() {
    const searchInput = document.getElementById('camera-search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.state.search = e.target.value.trim();
          this.loadData();
        }, 300);
      });
    }

    const clearBtn = document.getElementById('btn-clear-camera-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.state.search = '';
        const input = document.getElementById('camera-search-input');
        if (input) input.value = '';
        this.loadData();
      });
    }

    const brandChips = document.querySelectorAll('#brand-chips .chip');
    brandChips.forEach(chip => {
      chip.addEventListener('click', () => {
        brandChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.state.brand = chip.getAttribute('data-brand');
        this.loadData();
      });
    });

    const sensorSelect = document.getElementById('sensor-select');
    if (sensorSelect) {
      sensorSelect.addEventListener('change', (e) => {
        this.state.sensor = e.target.value;
        this.loadData();
      });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.sort = e.target.value;
        this.loadData();
      });
    }
  },

  async loadData() {
    const grid = document.getElementById('camera-cards-grid');
    const counter = document.getElementById('camera-results-count');
    if (!grid) return;

    grid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat kamera digital...</p>
      </div>
    `;

    try {
      const cameras = await ApiService.getCameras({
        search: this.state.search,
        sensor: this.state.sensor,
        brand: this.state.brand,
        sort: this.state.sort
      });

      this.state.cameras = cameras;

      if (counter) {
        counter.innerHTML = `Menampilkan <strong>${cameras.length}</strong> kamera retro`;
      }

      if (!cameras || cameras.length === 0) {
        grid.innerHTML = `
          <div class="empty-state card-glass">
            <div class="empty-icon">📷</div>
            <h3>Kamera Tidak Ditemukan</h3>
            <p>Tidak ada kamera yang cocok dengan kata kunci atau filter yang dipilih.</p>
            <button class="btn btn-primary" id="btn-reset-camera-filter">Reset Filter</button>
          </div>
        `;
        const resetBtn = document.getElementById('btn-reset-camera-filter');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.state.search = '';
            this.state.brand = 'all';
            this.state.sensor = 'all';
            const input = document.getElementById('camera-search-input');
            if (input) input.value = '';
            this.loadData();
          });
        }
        return;
      }

      grid.innerHTML = cameras.map(cam => {
        const isFav = StorageService.isCameraFavorite(cam.id);
        return `
          <article class="camera-card card-interactive" data-id="${cam.id}">
            <div class="card-media-wrapper">
              <img 
                src="${cam.imageUrl}" 
                alt="${cam.name}" 
                class="card-img" 
                loading="lazy"
                onerror="this.src='/icons/icon-512.png'"
              />
              <span class="card-badge-tag">${cam.tag || 'Vintage'}</span>
              <button 
                class="btn-fav-toggle ${isFav ? 'is-favorited' : ''}" 
                data-fav-id="${cam.id}" 
                title="${isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="${isFav ? '#e07a5f' : 'none'}" stroke="${isFav ? '#e07a5f' : '#ffffff'}" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div class="card-body">
              <div class="card-meta-top">
                <span class="camera-brand">${cam.brand}</span>
                <span class="camera-year">${cam.releaseYear}</span>
              </div>
              
              <h2 class="card-title">${cam.name}</h2>
              <p class="card-summary">${cam.summary}</p>

              <div class="spec-pill-group">
                <span class="spec-pill sensor-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  </svg>
                  ${cam.sensorType}
                </span>
                <span class="spec-pill mp-pill">${cam.megapixels} MP</span>
                <span class="spec-pill rating-pill">★ ${cam.rating}</span>
              </div>

              <div class="card-footer">
                <div class="price-estimate">
                  <span class="price-label">Perkiraan Pasar:</span>
                  <span class="price-value">${cam.estimatedPriceIdr}</span>
                </div>
                <div class="card-arrow-btn" title="Buka Detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('');

      // Attach Card Clicks to Detail Navigation (Ketentuan 4)
      grid.querySelectorAll('.camera-card').forEach(card => {
        card.addEventListener('click', (e) => {
          // If clicked the favorite heart button, don't open detail
          if (e.target.closest('.btn-fav-toggle')) {
            return;
          }
          const id = card.getAttribute('data-id');
          window.location.hash = `#camera/${id}`;
        });
      });

      // Attach Favorite Toggle Buttons
      grid.querySelectorAll('.btn-fav-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-fav-id');
          const cam = this.state.cameras.find(c => c.id === id);
          if (cam) {
            const isAdded = StorageService.toggleFavoriteCamera(cam);
            btn.classList.toggle('is-favorited', isAdded);
            const svg = btn.querySelector('svg');
            if (svg) {
              svg.setAttribute('fill', isAdded ? '#e07a5f' : 'none');
              svg.setAttribute('stroke', isAdded ? '#e07a5f' : '#ffffff');
            }
            if (window.App && window.App.showToast) {
              window.App.showToast(isAdded ? `📷 Ditambahkan ke Favorit: ${cam.name}` : `Dihapus dari Favorit: ${cam.name}`);
            }
          }
        });
      });

    } catch (err) {
      grid.innerHTML = `
        <div class="error-state card-glass">
          <p>Gagal memuat data kamera: ${err.message}</p>
          <button class="btn btn-primary" onclick="CamerasView.loadData()">Coba Lagi</button>
        </div>
      `;
    }
  }
};

window.CamerasView = CamerasView;
