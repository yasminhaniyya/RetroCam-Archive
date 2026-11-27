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
    sort: 'year-desc',
    currentPage: 1,     // Halaman pagination aktif
    itemsPerPage: 8     // Jumlah produk per halaman
  },

  lazyObserver: null,

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

    if (this.lazyObserver) {
      this.lazyObserver.disconnect();
      this.lazyObserver = null;
    }

    // Reset halaman ke halaman 1 setiap kali filter atau pencarian berubah
    this.state.currentPage = 1;

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

      if (!cameras || cameras.length === 0) {
        if (counter) counter.innerHTML = `Menampilkan <strong>0</strong> produk`;
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

      this.renderCardsWithLazyLoad();

    } catch (err) {
      grid.innerHTML = `
        <div class="empty-state-clean col-span-full">
          <p>Gagal memuat data: ${err.message}</p>
          <button class="btn-clean-reset" onclick="CamerasView.loadData()">Coba Lagi</button>
        </div>
      `;
    }
  },

  // Template satu kartu produk kamera dengan Image Lazy Load & Skeleton Shimmer
  renderCameraCardHtml(cam, isAdmin) {
    const isFav = StorageService.isCameraFavorite(cam.id);
    const stock = StorageService.getProductStock(cam.id);
    return `
      <article class="clean-product-card" data-id="${cam.id}">
        <div class="card-thumb-box">
          <img 
            src="${cam.imageUrl}" 
            alt="${cam.name}" 
            class="card-thumb-img" 
            loading="lazy"
            decoding="async"
            onload="this.classList.add('is-loaded'); this.parentElement.classList.add('is-loaded');"
            onerror="this.src='/icons/icon-512.png'; this.classList.add('is-loaded'); this.parentElement.classList.add('is-loaded');"
          />
          <button 
            type="button"
            class="card-share-btn" 
            data-share-id="${cam.id}" 
            data-share-name="${cam.name}" 
            title="Bagikan / salin tautan produk ini"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
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
            <span class="card-stock-badge ${stock <= 0 ? 'out-of-stock' : ''}">${stock > 0 ? `Stok: ${stock}` : 'Habis'}</span>
            ${isAdmin ? `
              <button type="button" class="btn-clean-edit-item" data-edit-cam-id="${cam.id}" title="Edit data kamera ini">
                ✏️ Edit
              </button>
            ` : ''}
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
              <span class="price-amount">${cam.estimatedPriceIdr || 'Rp 3.500.000'}</span>
            </div>
            <span class="view-detail-text">Detail &rarr;</span>
          </div>
        </div>
      </article>
    `;
  },

  // Render kartu kamera dengan Pagination
  renderCardsWithLazyLoad() {
    this.renderCards();
  },

  renderCards() {
    const grid = document.getElementById('camera-cards-grid');
    const counter = document.getElementById('camera-results-count');
    if (!grid) return;

    const cameras = this.state.cameras || [];
    const total = cameras.length;
    const perPage = this.state.itemsPerPage || 8;
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    if (this.state.currentPage > totalPages) this.state.currentPage = totalPages;
    if (this.state.currentPage < 1) this.state.currentPage = 1;

    const startIndex = (this.state.currentPage - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, total);
    const visible = cameras.slice(startIndex, endIndex);
    const isAdmin = StorageService.isAdmin();

    // Update Counter di Toolbar
    if (counter) {
      if (total === 0) {
        counter.innerHTML = `Menampilkan <strong>0</strong> kamera`;
      } else {
        counter.innerHTML = `Menampilkan <strong>${startIndex + 1}–${endIndex}</strong> dari <strong>${total}</strong> kamera <span class="badge-page-count">Halaman ${this.state.currentPage} / ${totalPages}</span>`;
      }
    }

    const cardsHtml = visible.map(cam => this.renderCameraCardHtml(cam, isAdmin)).join('');

    // Pagination Controls
    let paginationHtml = '';
    if (totalPages > 1) {
      let pageBtnsHtml = '';
      for (let p = 1; p <= totalPages; p++) {
        pageBtnsHtml += `
          <button 
            type="button" 
            class="pagination-num-btn ${p === this.state.currentPage ? 'active' : ''}" 
            data-page="${p}"
            title="Ke halaman ${p}"
          >
            ${p}
          </button>
        `;
      }

      paginationHtml = `
        <div class="pagination-container col-span-full">
          <div class="pagination-info">
            Menampilkan halaman <strong>${this.state.currentPage}</strong> dari <strong>${totalPages}</strong> (${total} total kamera)
          </div>
          <div class="pagination-controls">
            <button 
              type="button" 
              class="pagination-btn pagination-prev" 
              id="btn-page-prev-cam"
              ${this.state.currentPage <= 1 ? 'disabled' : ''}
              title="Halaman Sebelumnya"
            >
              &larr; Sebelumnya
            </button>
            <div class="pagination-pages-list">
              ${pageBtnsHtml}
            </div>
            <button 
              type="button" 
              class="pagination-btn pagination-next" 
              id="btn-page-next-cam"
              ${this.state.currentPage >= totalPages ? 'disabled' : ''}
              title="Halaman Selanjutnya"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        </div>
      `;
    }

    grid.innerHTML = cardsHtml + paginationHtml;
    this.bindCardEvents(grid);
    this.bindPaginationEvents(grid, totalPages);
  },

  bindPaginationEvents(grid, totalPages) {
    const prevBtn = document.getElementById('btn-page-prev-cam');
    const nextBtn = document.getElementById('btn-page-next-cam');

    if (prevBtn) {
      prevBtn.onclick = () => {
        if (this.state.currentPage > 1) {
          this.state.currentPage--;
          this.renderCards();
          this.scrollToCatalog();
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        if (this.state.currentPage < totalPages) {
          this.state.currentPage++;
          this.renderCards();
          this.scrollToCatalog();
        }
      };
    }

    grid.querySelectorAll('.pagination-num-btn').forEach(btn => {
      btn.onclick = () => {
        const p = parseInt(btn.getAttribute('data-page'), 10);
        if (p && p !== this.state.currentPage) {
          this.state.currentPage = p;
          this.renderCards();
          this.scrollToCatalog();
        }
      };
    });
  },

  scrollToCatalog() {
    const toolbar = document.querySelector('.catalog-toolbar') || document.getElementById('camera-cards-grid');
    if (toolbar) {
      toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // Bind Event Clicks untuk Navigasi, Edit, dan Favorit
  bindCardEvents(grid) {
    // Navigasi ke Halaman Detail (Ketentuan 4)
    grid.querySelectorAll('.clean-product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-wishlist-btn') || e.target.closest('.btn-clean-edit-item') || e.target.closest('.card-share-btn')) return;
        const id = card.getAttribute('data-id');
        window.location.hash = `#camera/${id}`;
      });
    });

    // Tombol Bagikan / Share Link Produk
    grid.querySelectorAll('.card-share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-share-id');
        const name = btn.getAttribute('data-share-name');
        const shareUrl = `${window.location.origin}${window.location.pathname}#camera/${id}`;
        if (navigator.share) {
          navigator.share({
            title: `${name} - RetroCam Archive`,
            text: `Lihat kamera ${name} di RetroCam Archive:`,
            url: shareUrl
          }).catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            if (window.App && window.App.showToast) {
              window.App.showToast(`🔗 Link ${name} berhasil disalin!`);
            }
          });
        }
      });
    });

    // Tombol Edit Mode Admin
    grid.querySelectorAll('.btn-clean-edit-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-edit-cam-id');
        const cam = this.state.cameras.find(c => c.id === id);
        if (cam && window.openEditCameraModal) {
          window.openEditCameraModal(cam);
        }
      });
    });

    // Tombol Toggle Favorit
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
  }
};

window.CamerasView = CamerasView;
