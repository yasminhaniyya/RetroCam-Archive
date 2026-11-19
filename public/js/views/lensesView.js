/**
 * RetroCam Archive - Lenses List View (Halaman 3)
 * Desain Katalog Otentik Lensa Kamera Yodobashi (Gaya Neokyo / Map Camera)
 */

const LensesView = {
  state: {
    lenses: [],
    loading: true,
    error: null,
    search: '',
    categoryTab: 'type', // 'type' | 'mount'
    category: 'all',
    mount: 'all',
    brand: 'all',
    sort: 'year-desc'
  },

  categoryTypes: [
    { id: 'all', name: 'Semua jenis', img: '/images/lenses/lens-zoom-01.jpg' },
    { id: 'Lensa zoom standar', name: 'Zoom standar', img: '/images/lenses/lens-zoom-01.jpg' },
    { id: 'Lensa prime / fix', name: 'Prime / fix', img: '/images/lenses/lens-prime-01.jpg' },
    { id: 'Lensa telephoto', name: 'Telephoto zoom', img: '/images/lenses/lens-tele-01.jpg' }
  ],

  categoryMounts: [
    { id: 'all', name: 'Semua mount', img: '/images/lenses/lens-zoom-01.jpg' },
    { id: 'Sony E', name: 'Sony E-mount', img: '/images/lenses/lens-zoom-01.jpg' },
    { id: 'Canon RF', name: 'Canon RF', img: '/images/lenses/lens-zoom-04.jpg' },
    { id: 'Nikon Z', name: 'Nikon Z', img: '/images/lenses/lens-zoom-06.jpg' },
    { id: 'Fujifilm X', name: 'Fujifilm X', img: '/images/lenses/lens-zoom-10.jpg' },
    { id: 'Micro Four Thirds', name: 'Micro 4/3', img: '/images/lenses/lens-zoom-15.jpg' },
    { id: 'L-mount', name: 'L-mount', img: '/images/lenses/lens-zoom-16.jpg' }
  ],

  async render() {
    return `
      <section class="page-container page-lenses animate-fade-in">

        <!-- Search Bar (Top Clean Marketplace Search) -->
        <div class="catalog-top-search">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              id="lens-search-input" 
              class="input-catalog-search" 
              placeholder="Cari lensa berdasarkan nama, fokal, bukaan, atau mount..." 
              value="${this.state.search}"
            />
            ${this.state.search ? `<button id="btn-clear-lens-search" class="btn-clear">&times;</button>` : ''}
          </div>
        </div>

        <!-- Section Kategori Lensa (Gaya Neokyo) -->
        <div class="neokyo-category-section">
          <h2 class="neokyo-category-title">Kategori Lensa</h2>

          <div class="neokyo-category-tabs">
            <button 
              class="neokyo-tab-btn ${this.state.categoryTab === 'type' ? 'active' : ''}" 
              id="tab-lens-type" 
              data-tab="type"
            >
              Berdasarkan jenis lensa
            </button>
            <button 
              class="neokyo-tab-btn ${this.state.categoryTab === 'mount' ? 'active' : ''}" 
              id="tab-lens-mount" 
              data-tab="mount"
            >
              Berdasarkan dudukan mount
            </button>
          </div>

          <!-- Circular items row -->
          <div class="neokyo-category-grid" id="neokyo-lens-category-items">
            ${this.renderCategoryCircles()}
          </div>
        </div>

        <!-- Catalog Toolbar: Filter Mount & Sorting -->
        <div class="catalog-toolbar">
          <div class="toolbar-left">
            <span class="toolbar-result-count" id="lens-results-count">
              Memuat katalog lensa...
            </span>
          </div>

          <div class="toolbar-right">
            <div class="toolbar-select-wrap">
              <label for="lens-mount-select">Dudukan:</label>
              <select id="lens-mount-select" class="clean-select">
                <option value="all" ${this.state.mount === 'all' ? 'selected' : ''}>Semua Mount</option>
                <option value="Sony E" ${this.state.mount === 'Sony E' ? 'selected' : ''}>Sony E-mount</option>
                <option value="Canon RF" ${this.state.mount === 'Canon RF' ? 'selected' : ''}>Canon RF</option>
                <option value="Nikon Z" ${this.state.mount === 'Nikon Z' ? 'selected' : ''}>Nikon Z</option>
                <option value="Fujifilm X" ${this.state.mount === 'Fujifilm X' ? 'selected' : ''}>Fujifilm X</option>
                <option value="Micro Four Thirds" ${this.state.mount === 'Micro Four Thirds' ? 'selected' : ''}>Micro 4/3</option>
                <option value="L-mount" ${this.state.mount === 'L-mount' ? 'selected' : ''}>L-mount</option>
              </select>
            </div>

            <div class="toolbar-select-wrap">
              <label for="lens-sort-select">Urutan:</label>
              <select id="lens-sort-select" class="clean-select">
                <option value="year-desc" ${this.state.sort === 'year-desc' ? 'selected' : ''}>Tahun Terbaru</option>
                <option value="year-asc" ${this.state.sort === 'year-asc' ? 'selected' : ''}>Tahun Terlama</option>
                <option value="rating-desc" ${this.state.sort === 'rating-desc' ? 'selected' : ''}>Rating Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Product Cards Grid -->
        <div id="lens-cards-grid" class="clean-products-grid">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat koleksi lensa...</p>
          </div>
        </div>

      </section>
    `;
  },

  renderCategoryCircles() {
    if (this.state.categoryTab === 'type') {
      return this.categoryTypes.map(item => {
        const isActive = (this.state.category === item.id) || (item.id === 'all' && this.state.category === 'all');
        return `
          <div class="neokyo-circle-item ${isActive ? 'active' : ''}" data-lens-type="${item.id}">
            <div class="neokyo-circle-thumb">
              <img src="${item.img}" alt="${item.name}" loading="lazy" />
            </div>
            <span class="neokyo-circle-label">${item.name}</span>
          </div>
        `;
      }).join('');
    } else {
      return this.categoryMounts.map(item => {
        const isActive = (this.state.mount === item.id) || (item.id === 'all' && this.state.mount === 'all');
        return `
          <div class="neokyo-circle-item ${isActive ? 'active' : ''}" data-lens-mount="${item.id}">
            <div class="neokyo-circle-thumb">
              <img src="${item.img}" alt="${item.name}" loading="lazy" />
            </div>
            <span class="neokyo-circle-label">${item.name}</span>
          </div>
        `;
      }).join('');
    }
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

    // Tabs switch: Type vs Mount
    const tabType = document.getElementById('tab-lens-type');
    const tabMount = document.getElementById('tab-lens-mount');
    const container = document.getElementById('neokyo-lens-category-items');

    if (tabType && tabMount) {
      tabType.addEventListener('click', () => {
        tabType.classList.add('active');
        tabMount.classList.remove('active');
        this.state.categoryTab = 'type';
        this.state.mount = 'all';
        const mountSelect = document.getElementById('lens-mount-select');
        if (mountSelect) mountSelect.value = 'all';
        if (container) {
          container.innerHTML = this.renderCategoryCircles();
          this.bindCategoryCircleClicks();
        }
        this.loadData();
      });

      tabMount.addEventListener('click', () => {
        tabMount.classList.add('active');
        tabType.classList.remove('active');
        this.state.categoryTab = 'mount';
        this.state.category = 'all';
        if (container) {
          container.innerHTML = this.renderCategoryCircles();
          this.bindCategoryCircleClicks();
        }
        this.loadData();
      });
    }

    this.bindCategoryCircleClicks();

    // Mount filter dropdown
    const mountSelect = document.getElementById('lens-mount-select');
    if (mountSelect) {
      mountSelect.addEventListener('change', (e) => {
        this.state.mount = e.target.value;
        if (this.state.categoryTab === 'mount') {
          const container = document.getElementById('neokyo-lens-category-items');
          if (container) {
            container.innerHTML = this.renderCategoryCircles();
            this.bindCategoryCircleClicks();
          }
        }
        this.loadData();
      });
    }

    // Sorting dropdown
    const sortSelect = document.getElementById('lens-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.sort = e.target.value;
        this.loadData();
      });
    }
  },

  bindCategoryCircleClicks() {
    const items = document.querySelectorAll('#neokyo-lens-category-items .neokyo-circle-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (this.state.categoryTab === 'type') {
          this.state.category = item.getAttribute('data-lens-type');
        } else {
          this.state.mount = item.getAttribute('data-lens-mount');
          const mountSelect = document.getElementById('lens-mount-select');
          if (mountSelect) mountSelect.value = this.state.mount;
        }
        this.loadData();
      });
    });
  },

  async loadData() {
    const grid = document.getElementById('lens-cards-grid');
    const counter = document.getElementById('lens-results-count');
    if (!grid) return;

    grid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat koleksi lensa...</p>
      </div>
    `;

    try {
      const lenses = await ApiService.getLenses({
        search: this.state.search,
        category: this.state.category,
        mount: this.state.mount,
        brand: this.state.brand,
        sort: this.state.sort
      });

      this.state.lenses = lenses;

      if (counter) {
        counter.innerHTML = `Menampilkan <strong>${lenses.length}</strong> produk`;
      }

      if (!lenses || lenses.length === 0) {
        grid.innerHTML = `
          <div class="empty-state-clean col-span-full">
            <p>Tidak ada lensa yang sesuai dengan filter atau kata kunci pencarian.</p>
            <button class="btn-clean-reset" id="btn-reset-lens-cat">Tampilkan Semua Lensa</button>
          </div>
        `;
        const resetBtn = document.getElementById('btn-reset-lens-cat');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.state.search = '';
            this.state.category = 'all';
            this.state.mount = 'all';
            this.state.brand = 'all';
            const searchInput = document.getElementById('lens-search-input');
            if (searchInput) searchInput.value = '';
            const mountSelect = document.getElementById('lens-mount-select');
            if (mountSelect) mountSelect.value = 'all';
            const container = document.getElementById('neokyo-lens-category-items');
            if (container) {
              container.innerHTML = this.renderCategoryCircles();
              this.bindCategoryCircleClicks();
            }
            this.loadData();
          });
        }
        return;
      }

      // Render Clean, Realistic Store Product Cards
      grid.innerHTML = lenses.map(lens => {
        const isFav = StorageService.isLensFavorite(lens.id);
        return `
          <article class="clean-product-card" data-id="${lens.id}">
            <div class="card-thumb-box">
              <img 
                src="${lens.imageUrl}" 
                alt="${lens.name}" 
                class="card-thumb-img" 
                loading="lazy"
                onerror="this.src='/icons/icon-512.png'"
              />
              <button 
                class="card-wishlist-btn ${isFav ? 'is-active' : ''}" 
                data-fav-id="${lens.id}" 
                title="${isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="${isFav ? '#c85a32' : 'none'}" stroke="${isFav ? '#c85a32' : '#6b7280'}" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div class="card-detail-box">
              <div class="card-brand-row">
                <span class="card-brand-label">${lens.brand} &bull; ${lens.category}</span>
                <span class="card-year-label">${lens.releaseYear}</span>
              </div>
              
              <h3 class="card-product-name">${lens.name}</h3>

              <div class="card-specs-line">
                <span>${lens.focalLength}</span>
                <span class="sep">&middot;</span>
                <span>${lens.maxAperture}</span>
                <span class="sep">&middot;</span>
                <span>${lens.mount}</span>
              </div>

              <div class="card-price-row">
                <div class="price-box">
                  <span class="price-title">Harga</span>
                  <span class="price-amount">${lens.estimatedPriceIdr}</span>
                </div>
                <span class="view-detail-text">Detail &rarr;</span>
              </div>
            </div>
          </article>
        `;
      }).join('');

      // Attach Card Clicks to Detail Navigation (Ketentuan 4)
      grid.querySelectorAll('.clean-product-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.card-wishlist-btn')) return;
          const id = card.getAttribute('data-id');
          window.location.hash = `#lens/${id}`;
        });
      });

      // Attach Favorite Toggle Buttons
      grid.querySelectorAll('.card-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-fav-id');
          const lens = this.state.lenses.find(l => l.id === id);
          if (lens) {
            const isAdded = StorageService.toggleFavoriteLens(lens);
            btn.classList.toggle('is-active', isAdded);
            const svg = btn.querySelector('svg');
            if (svg) {
              svg.setAttribute('fill', isAdded ? '#c85a32' : 'none');
              svg.setAttribute('stroke', isAdded ? '#c85a32' : '#6b7280');
            }
            if (window.App && window.App.showToast) {
              window.App.showToast(isAdded ? `Ditambahkan ke Favorit: ${lens.name}` : `Dihapus dari Favorit: ${lens.name}`);
            }
          }
        });
      });

    } catch (err) {
      grid.innerHTML = `
        <div class="empty-state-clean col-span-full">
          <p>Gagal memuat data: ${err.message}</p>
          <button class="btn-clean-reset" onclick="LensesView.loadData()">Coba Lagi</button>
        </div>
      `;
    }
  }
};

window.LensesView = LensesView;
