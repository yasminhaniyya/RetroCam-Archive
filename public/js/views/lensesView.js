/**
 * RetroCam Archive - Lenses List View (Halaman 3)
 * Halaman utama kedua dengan list interaktif (Ketentuan 4)
 */

const LensesView = {
  state: {
    lenses: [],
    loading: true,
    error: null,
    search: '',
    mount: 'all',
    sort: 'year-desc'
  },

  async render() {
    return `
      <section class="page-container page-lenses animate-fade-in">
        <!-- Hero Header -->
        <header class="section-hero">
          <div class="hero-badge badge-amber"><span class="badge-dot"></span> Optik Manual Analog</div>
          <h1 class="hero-title">Katalog Lensa Manual & Vintage</h1>
          <p class="hero-subtitle">
            Koleksi lensa legendaris dengan karakter optik khas: swirl bokeh Helios, keemasan radioaktif Takumar, ketajaman mikroskopis Zeiss, dan lingkaran bokeh 15-blade Jupiter.
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
              id="lens-search-input" 
              class="input-search" 
              placeholder="Cari lensa (misal: Helios, 50mm, f/1.4, M42)..." 
              value="${this.state.search}"
            />
            ${this.state.search ? `<button id="btn-clear-lens-search" class="btn-clear">&times;</button>` : ''}
          </div>

          <!-- Mount Chips -->
          <div class="filter-row">
            <span class="filter-label">Dudukan Mount:</span>
            <div class="chips-scroll" id="mount-chips">
              ${['all', 'M42', 'Canon FD', 'Nikon F', 'Olympus OM', 'Minolta'].map(m => `
                <button class="chip ${this.state.mount.toLowerCase() === m.toLowerCase() ? 'active' : ''}" data-mount="${m}">
                  ${m === 'all' ? 'Semua Mount' : m}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Sort Row -->
          <div class="filter-meta-row">
            <div class="select-group">
              <label for="lens-sort-select">Urutkan Berdasarkan:</label>
              <select id="lens-sort-select" class="custom-select">
                <option value="year-desc" ${this.state.sort === 'year-desc' ? 'selected' : ''}>Tahun Rilis Terbaru</option>
                <option value="year-asc" ${this.state.sort === 'year-asc' ? 'selected' : ''}>Tahun Rilis Terlama</option>
                <option value="rating-desc" ${this.state.sort === 'rating-desc' ? 'selected' : ''}>Rating Komunitas Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Result Status Counter -->
        <div class="list-meta-header">
          <div class="results-count" id="lens-results-count">
            Memuat arsip lensa...
          </div>
          <div class="api-source-badge">
            <span class="dot-live"></span> Web Service Modul 1
          </div>
        </div>

        <!-- Lenses Cards Grid -->
        <div id="lens-cards-grid" class="cards-grid">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Mengambil data lensa dari REST API...</p>
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
    const searchInput = document.getElementById('lens-search-input');
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

    const clearBtn = document.getElementById('btn-clear-lens-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.state.search = '';
        const input = document.getElementById('lens-search-input');
        if (input) input.value = '';
        this.loadData();
      });
    }

    const mountChips = document.querySelectorAll('#mount-chips .chip');
    mountChips.forEach(chip => {
      chip.addEventListener('click', () => {
        mountChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.state.mount = chip.getAttribute('data-mount');
        this.loadData();
      });
    });

    const sortSelect = document.getElementById('lens-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.sort = e.target.value;
        this.loadData();
      });
    }
  },

  async loadData() {
    const grid = document.getElementById('lens-cards-grid');
    const counter = document.getElementById('lens-results-count');
    if (!grid) return;

    grid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat koleksi lensa manual...</p>
      </div>
    `;

    try {
      const lenses = await ApiService.getLenses({
        search: this.state.search,
        mount: this.state.mount,
        sort: this.state.sort
      });

      this.state.lenses = lenses;

      if (counter) {
        counter.innerHTML = `Menampilkan <strong>${lenses.length}</strong> lensa vintage`;
      }

      if (!lenses || lenses.length === 0) {
        grid.innerHTML = `
          <div class="empty-state card-glass">
            <div class="empty-icon">🔍</div>
            <h3>Lensa Tidak Ditemukan</h3>
            <p>Tidak ada lensa yang cocok dengan kata kunci pencarian Anda.</p>
            <button class="btn btn-primary" id="btn-reset-lens-filter">Reset Filter</button>
          </div>
        `;
        const resetBtn = document.getElementById('btn-reset-lens-filter');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.state.search = '';
            this.state.mount = 'all';
            const input = document.getElementById('lens-search-input');
            if (input) input.value = '';
            this.loadData();
          });
        }
        return;
      }

      grid.innerHTML = lenses.map(lens => {
        const isFav = StorageService.isLensFavorite(lens.id);
        return `
          <article class="lens-card card-interactive" data-id="${lens.id}">
            <div class="card-media-wrapper">
              <img 
                src="${lens.imageUrl}" 
                alt="${lens.name}" 
                class="card-img" 
                loading="lazy"
                onerror="this.src='/icons/icon-512.png'"
              />
              <span class="card-badge-tag badge-tag-lens">${lens.tag || 'Vintage Glass'}</span>
              <button 
                class="btn-fav-toggle ${isFav ? 'is-favorited' : ''}" 
                data-fav-id="${lens.id}" 
                title="${isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="${isFav ? '#c85a32' : 'none'}" stroke="${isFav ? '#c85a32' : '#374151'}" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div class="card-body">
              <div class="card-meta-top">
                <span class="camera-brand">${lens.brand}</span>
                <span class="camera-year">Tahun ${lens.releaseYear}</span>
              </div>
              
              <h2 class="card-title">${lens.name}</h2>
              <p class="card-summary">${lens.summary}</p>

              <div class="spec-pill-group">
                <span class="spec-pill mount-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                  </svg>
                  ${lens.mount}
                </span>
                <span class="spec-pill aperture-pill">${lens.maxAperture}</span>
                <span class="spec-pill blades-pill">${lens.apertureBlades} Blades</span>
              </div>

              <div class="card-footer">
                <div class="price-estimate">
                  <span class="price-label">Pasaran Kolektor:</span>
                  <span class="price-value">${lens.estimatedPriceIdr}</span>
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
      grid.querySelectorAll('.lens-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.btn-fav-toggle')) {
            return;
          }
          const id = card.getAttribute('data-id');
          window.location.hash = `#lens/${id}`;
        });
      });

      // Attach Favorite Toggle Buttons
      grid.querySelectorAll('.btn-fav-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-fav-id');
          const lens = this.state.lenses.find(l => l.id === id);
          if (lens) {
            const isAdded = StorageService.toggleFavoriteLens(lens);
            btn.classList.toggle('is-favorited', isAdded);
            const svg = btn.querySelector('svg');
            if (svg) {
              svg.setAttribute('fill', isAdded ? '#c85a32' : 'none');
              svg.setAttribute('stroke', isAdded ? '#c85a32' : '#374151');
            }
            if (window.App && window.App.showToast) {
              window.App.showToast(isAdded ? `🔍 Ditambahkan ke Favorit: ${lens.name}` : `Dihapus dari Favorit: ${lens.name}`);
            }
          }
        });
      });

    } catch (err) {
      grid.innerHTML = `
        <div class="error-state card-glass">
          <p>Gagal memuat data lensa: ${err.message}</p>
          <button class="btn btn-primary" onclick="LensesView.loadData()">Coba Lagi</button>
        </div>
      `;
    }
  }
};

window.LensesView = LensesView;
