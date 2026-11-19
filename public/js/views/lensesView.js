/**
 * RetroCam Archive - Lenses List View (Halaman 3)
 * Desain Katalog Otentik Lensa Manual (Gaya Neokyo / Map Camera)
 */

const LensesView = {
  state: {
    lenses: [],
    loading: true,
    error: null,
    search: '',
    categoryTab: 'focal', // 'focal' | 'mount'
    focalType: 'all',
    mount: 'all',
    sort: 'year-desc'
  },

  categoryFocal: [
    { id: 'all', name: 'Semua lensa', img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=300&q=80' },
    { id: '50mm', name: 'Lensa 50mm', img: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=300&q=80' },
    { id: '85mm', name: 'Lensa Portrait 85mm', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80' },
    { id: '45mm', name: 'Lensa Pancake', img: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=300&q=80' }
  ],

  categoryMounts: [
    { id: 'all', name: 'Semua mount', img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=300&q=80' },
    { id: 'M42', name: 'M42 Screw', img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80' },
    { id: 'Canon FD', name: 'Canon FD', img: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=300&q=80' },
    { id: 'Nikon F', name: 'Nikon F', img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=300&q=80' },
    { id: 'Olympus OM', name: 'Olympus OM', img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80' },
    { id: 'Minolta', name: 'Minolta MD', img: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=300&q=80' }
  ],

  async render() {
    return `
      <section class="page-container page-lenses animate-fade-in">

        <!-- Search Bar -->
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
              placeholder="Cari lensa manual berdasarkan nama, bukaan, atau mount..." 
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
              class="neokyo-tab-btn ${this.state.categoryTab === 'focal' ? 'active' : ''}" 
              id="tab-lens-focal" 
              data-tab="focal"
            >
              Berdasarkan fokal lensa
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

        <!-- Toolbar Sort -->
        <div class="catalog-toolbar">
          <div class="toolbar-left">
            <span class="toolbar-result-count" id="lens-results-count">
              Memuat katalog lensa...
            </span>
          </div>

          <div class="toolbar-right">
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
    if (this.state.categoryTab === 'focal') {
      return this.categoryFocal.map(item => {
        const isActive = (this.state.focalType === item.id) || (item.id === 'all' && this.state.focalType === 'all');
        return `
          <div class="neokyo-circle-item ${isActive ? 'active' : ''}" data-lens-focal="${item.id}">
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

    // Tabs
    const tabFocal = document.getElementById('tab-lens-focal');
    const tabMount = document.getElementById('tab-lens-mount');
    const container = document.getElementById('neokyo-lens-category-items');

    if (tabFocal && tabMount) {
      tabFocal.addEventListener('click', () => {
        tabFocal.classList.add('active');
        tabMount.classList.remove('active');
        this.state.categoryTab = 'focal';
        this.state.mount = 'all';
        if (container) {
          container.innerHTML = this.renderCategoryCircles();
          this.bindCategoryCircleClicks();
        }
        this.loadData();
      });

      tabMount.addEventListener('click', () => {
        tabMount.classList.add('active');
        tabFocal.classList.remove('active');
        this.state.categoryTab = 'mount';
        this.state.focalType = 'all';
        if (container) {
          container.innerHTML = this.renderCategoryCircles();
          this.bindCategoryCircleClicks();
        }
        this.loadData();
      });
    }

    this.bindCategoryCircleClicks();

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

        if (this.state.categoryTab === 'focal') {
          this.state.focalType = item.getAttribute('data-lens-focal');
        } else {
          this.state.mount = item.getAttribute('data-lens-mount');
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
      let lenses = await ApiService.getLenses({
        search: this.state.search,
        mount: this.state.mount,
        sort: this.state.sort
      });

      // Filter by focal length if selected
      if (this.state.focalType && this.state.focalType !== 'all') {
        lenses = lenses.filter(l => (l.focalLength || '').includes(this.state.focalType));
      }

      this.state.lenses = lenses;

      if (counter) {
        counter.innerHTML = `Menampilkan <strong>${lenses.length}</strong> produk`;
      }

      if (!lenses || lenses.length === 0) {
        grid.innerHTML = `
          <div class="empty-state-clean col-span-full">
            <p>Tidak ada lensa yang sesuai dengan pilihan kategori.</p>
            <button class="btn-clean-reset" id="btn-reset-lens-cat">Tampilkan Semua Lensa</button>
          </div>
        `;
        const resetBtn = document.getElementById('btn-reset-lens-cat');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.state.search = '';
            this.state.mount = 'all';
            this.state.focalType = 'all';
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
                <span class="card-brand-label">${lens.brand}</span>
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
