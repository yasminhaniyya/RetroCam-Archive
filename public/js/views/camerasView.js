/**
 * RetroCam Archive - Cameras List View (Halaman 1)
 * Desain Katalog Otentik (Gaya Neokyo / Map Camera)
 */

const CamerasView = {
  state: {
    cameras: [],
    loading: true,
    error: null,
    search: '',
    categoryTab: 'type', // 'type' | 'brand'
    category: 'all',
    brand: 'all',
    sensor: 'all',
    sort: 'year-desc'
  },

  // Category definitions with clean photo thumbnails
  categoryTypes: [
    { id: 'all', name: 'Semua jenis', img: '/images/cameras/cam-hib-11.jpg' },
    { id: 'Kamera saku', name: 'Kamera saku', img: '/images/cameras/cam-saku-01.jpg' },
    { id: 'Kamera prosumer', name: 'Kamera prosumer', img: '/images/cameras/cam-pro-08.jpg' },
    { id: 'Kamera hibrida', name: 'Kamera hibrida', img: '/images/cameras/cam-hib-01.jpg' }
  ],

  categoryBrands: [
    { id: 'all', name: 'Semua merek', img: '/images/cameras/cam-hib-11.jpg' },
    { id: 'Sony', name: 'Sony', img: '/images/cameras/cam-hib-01.jpg' },
    { id: 'Canon', name: 'Canon', img: '/images/cameras/cam-pro-04.jpg' },
    { id: 'Fujifilm', name: 'Fujifilm', img: '/images/cameras/cam-pro-08.jpg' },
    { id: 'Nikon', name: 'Nikon', img: '/images/cameras/cam-hib-12.jpg' },
    { id: 'Olympus', name: 'Olympus', img: '/images/cameras/cam-saku-11.jpg' },
    { id: 'Panasonic', name: 'Panasonic', img: '/images/cameras/cam-saku-13.jpg' },
    { id: 'Ricoh', name: 'Ricoh', img: '/images/cameras/cam-saku-01.jpg' },
    { id: 'Leica', name: 'Leica', img: '/images/cameras/cam-pro-15.jpg' },
    { id: 'Kodak', name: 'Kodak', img: '/images/cameras/cam-saku-15.jpg' },
    { id: 'Pentax', name: 'Pentax', img: '/images/cameras/cam-saku-18.jpg' },
    { id: 'Casio', name: 'Casio', img: '/images/cameras/cam-saku-19.jpg' }
  ],

  async render() {
    return `
      <section class="page-container page-cameras animate-fade-in">

        <!-- Search Bar (Top Clean Marketplace Search) -->
        <div class="catalog-top-search">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              id="camera-search-input" 
              class="input-catalog-search" 
              placeholder="Cari kamera berdasarkan nama, seri, atau merek..." 
              value="${this.state.search}"
            />
            ${this.state.search ? `<button id="btn-clear-camera-search" class="btn-clear">&times;</button>` : ''}
          </div>
        </div>

        <!-- Admin Bar: Akses Tambah Kamera -->
        ${StorageService.isAdmin() ? `
          <div class="admin-catalog-banner">
            <div class="admin-banner-content">
              <span>🛡️ <strong>Mode Admin:</strong> Anda memiliki akses mengelola dan menambah kamera ke katalog.</span>
              <button type="button" class="btn btn-sm btn-primary" onclick="window.openAddCameraModal()">
                ➕ Tambah Kamera Baru
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Section Kategori (Sesuai Contoh Gambar Neokyo) -->
        <div class="neokyo-category-section">
          <h2 class="neokyo-category-title">Kategori</h2>

          <div class="neokyo-category-tabs">
            <button 
              class="neokyo-tab-btn ${this.state.categoryTab === 'type' ? 'active' : ''}" 
              id="tab-cat-type" 
              data-tab="type"
            >
              Berdasarkan jenis kamera
            </button>
            <button 
              class="neokyo-tab-btn ${this.state.categoryTab === 'brand' ? 'active' : ''}" 
              id="tab-cat-brand" 
              data-tab="brand"
            >
              Berdasarkan merek
            </button>
          </div>

          <!-- Circular items row -->
          <div class="neokyo-category-grid" id="neokyo-category-items">
            ${this.renderCategoryCircles()}
          </div>
        </div>

        <!-- Catalog Toolbar: Filter Sensor & Sorting -->
        <div class="catalog-toolbar">
          <div class="toolbar-left">
            <span class="toolbar-result-count" id="camera-results-count">
              Memuat katalog kamera...
            </span>
          </div>

          <div class="toolbar-right">
            <div class="toolbar-select-wrap">
              <label for="sensor-select">Sensor:</label>
              <select id="sensor-select" class="clean-select">
                <option value="all" ${this.state.sensor === 'all' ? 'selected' : ''}>Semua Sensor</option>
                <option value="CCD" ${this.state.sensor === 'CCD' ? 'selected' : ''}>Sensor CCD</option>
                <option value="CMOS" ${this.state.sensor === 'CMOS' ? 'selected' : ''}>Sensor CMOS</option>
                <option value="BSI" ${this.state.sensor === 'BSI' ? 'selected' : ''}>BSI / Stacked CMOS</option>
                <option value="X-Trans" ${this.state.sensor === 'X-Trans' ? 'selected' : ''}>Fujifilm X-Trans</option>
              </select>
            </div>

            <div class="toolbar-select-wrap">
              <label for="sort-select">Urutan:</label>
              <select id="sort-select" class="clean-select">
                <option value="year-desc" ${this.state.sort === 'year-desc' ? 'selected' : ''}>Tahun Terbaru</option>
                <option value="year-asc" ${this.state.sort === 'year-asc' ? 'selected' : ''}>Tahun Terlama</option>
                <option value="mp-desc" ${this.state.sort === 'mp-desc' ? 'selected' : ''}>Megapixel Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Product Cards Grid (Clean Store / Archive Style) -->
        <div id="camera-cards-grid" class="clean-products-grid">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat daftar kamera...</p>
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
          <div class="neokyo-circle-item ${isActive ? 'active' : ''}" data-cat-type="${item.id}">
            <div class="neokyo-circle-thumb">
              <img src="${item.img}" alt="${item.name}" loading="lazy" />
            </div>
            <span class="neokyo-circle-label">${item.name}</span>
          </div>
        `;
      }).join('');
    } else {
      return this.categoryBrands.map(item => {
        const isActive = (this.state.brand === item.id) || (item.id === 'all' && this.state.brand === 'all');
        return `
          <div class="neokyo-circle-item ${isActive ? 'active' : ''}" data-cat-brand="${item.id}">
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
    // Search
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

    // Category Tabs: "Berdasarkan jenis kamera" vs "Berdasarkan merek"
    const tabTypeBtn = document.getElementById('tab-cat-type');
    const tabBrandBtn = document.getElementById('tab-cat-brand');
    const catContainer = document.getElementById('neokyo-category-items');

    if (tabTypeBtn && tabBrandBtn) {
      tabTypeBtn.addEventListener('click', () => {
        tabTypeBtn.classList.add('active');
        tabBrandBtn.classList.remove('active');
        this.state.categoryTab = 'type';
        this.state.brand = 'all'; // reset brand filter
        if (catContainer) {
          catContainer.innerHTML = this.renderCategoryCircles();
          this.bindCategoryCircleClicks();
        }
        this.loadData();
      });

      tabBrandBtn.addEventListener('click', () => {
        tabBrandBtn.classList.add('active');
        tabTypeBtn.classList.remove('active');
        this.state.categoryTab = 'brand';
        this.state.category = 'all'; // reset type filter
        if (catContainer) {
          catContainer.innerHTML = this.renderCategoryCircles();
          this.bindCategoryCircleClicks();
        }
        this.loadData();
      });
    }

    this.bindCategoryCircleClicks();

    // Toolbar select
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

  bindCategoryCircleClicks() {
    const items = document.querySelectorAll('.neokyo-circle-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (this.state.categoryTab === 'type') {
          const type = item.getAttribute('data-cat-type');
          this.state.category = type;
        } else {
          const brand = item.getAttribute('data-cat-brand');
          this.state.brand = brand;
        }
        this.loadData();
      });
    });
  },

  async loadData() {
    const grid = document.getElementById('camera-cards-grid');
    const counter = document.getElementById('camera-results-count');
    if (!grid) return;

    grid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat katalog...</p>
      </div>
    `;

    try {
      const cameras = await ApiService.getCameras({
        search: this.state.search,
        category: this.state.category,
        brand: this.state.brand,
        sensor: this.state.sensor,
        sort: this.state.sort
      });

      this.state.cameras = cameras;

      if (counter) {
        counter.innerHTML = `Menampilkan <strong>${cameras.length}</strong> produk`;
      }

      if (!cameras || cameras.length === 0) {
        grid.innerHTML = `
          <div class="empty-state-clean col-span-full">
            <p>Tidak ada kamera yang sesuai dengan pilihan kategori.</p>
            <button class="btn-clean-reset" id="btn-reset-cat">Tampilkan Semua Kamera</button>
          </div>
        `;
        const resetBtn = document.getElementById('btn-reset-cat');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.state.search = '';
            this.state.category = 'all';
            this.state.brand = 'all';
            this.state.sensor = 'all';
            const catContainer = document.getElementById('neokyo-category-items');
            if (catContainer) {
              catContainer.innerHTML = this.renderCategoryCircles();
              this.bindCategoryCircleClicks();
            }
            this.loadData();
          });
        }
        return;
      }

      // Render Clean, Realistic Store Product Cards
      grid.innerHTML = cameras.map(cam => {
        const isFav = StorageService.isCameraFavorite(cam.id);
        return `
          <article class="clean-product-card" data-id="${cam.id}">
            <div class="card-thumb-box">
              <img 
                src="${cam.imageUrl}" 
                alt="${cam.name}" 
                class="card-thumb-img" 
                loading="lazy"
                onerror="this.src='/icons/icon-512.png'"
              />
              <button 
                class="card-wishlist-btn ${isFav ? 'is-active' : ''}" 
                data-fav-id="${cam.id}" 
                title="${isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="${isFav ? '#0284c7' : 'none'}" stroke="${isFav ? '#0284c7' : '#6b7280'}" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div class="card-detail-box">
              <div class="card-brand-row">
                <span class="card-brand-label">${cam.brand}</span>
                <span class="card-year-label">${cam.releaseYear}</span>
              </div>
              
              <h3 class="card-product-name">${cam.name}</h3>

              <div class="card-specs-line">
                <span>${cam.megapixels} MP</span>
                <span class="sep">&middot;</span>
                <span>${cam.sensorType}</span>
                <span class="sep">&middot;</span>
                <span>${cam.category || 'Kamera saku'}</span>
              </div>

              <div class="card-price-row">
                <div class="price-box">
                  <span class="price-title">Harga</span>
                  <span class="price-amount">${cam.estimatedPriceIdr}</span>
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
          window.location.hash = `#camera/${id}`;
        });
      });

      // Attach Favorite Toggle Buttons
      grid.querySelectorAll('.card-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-fav-id');
          const cam = this.state.cameras.find(c => c.id === id);
          if (cam) {
            const isAdded = StorageService.toggleFavoriteCamera(cam);
            btn.classList.toggle('is-active', isAdded);
            const svg = btn.querySelector('svg');
            if (svg) {
              svg.setAttribute('fill', isAdded ? '#0284c7' : 'none');
              svg.setAttribute('stroke', isAdded ? '#0284c7' : '#6b7280');
            }
            if (window.App && window.App.showToast) {
              window.App.showToast(isAdded ? `Ditambahkan ke Favorit: ${cam.name}` : `Dihapus dari Favorit: ${cam.name}`);
            }
          }
        });
      });

    } catch (err) {
      grid.innerHTML = `
        <div class="empty-state-clean col-span-full">
          <p>Gagal memuat data: ${err.message}</p>
          <button class="btn-clean-reset" onclick="CamerasView.loadData()">Coba Lagi</button>
        </div>
      `;
    }
  }
};

window.CamerasView = CamerasView;
