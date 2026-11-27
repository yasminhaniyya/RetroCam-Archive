/**
 * RetroCam Archive - Favorites View (Halaman 5)
 * Halaman Koleksi Saya yang tersimpan di LocalStorage secara offline
 */

const FavoritesView = {
  activeTab: 'all', // 'all' | 'cameras' | 'lenses'

  async render() {
    return `
      <section class="page-container page-favorites animate-fade-in">
        <!-- Hero Header -->
        <header class="section-hero">
          <div class="hero-badge badge-rose"><span class="badge-dot"></span> Koleksi Tersimpan</div>
          <h1 class="hero-title">Koleksi Favorit Saya</h1>
          <p class="hero-subtitle">
            Daftar kamera digital klasik dan lensa vintage impian yang Anda simpan. Data tersimpan di memori perangkat secara offline melalui LocalStorage.
          </p>
        </header>

        <!-- Segmented Tab Controls -->
        <div class="segmented-control card-glass">
          <button class="segment-btn ${this.activeTab === 'all' ? 'active' : ''}" data-tab="all" id="tab-fav-all">
            Semua (<span id="count-fav-all">0</span>)
          </button>
          <button class="segment-btn ${this.activeTab === 'cameras' ? 'active' : ''}" data-tab="cameras" id="tab-fav-cameras">
            📷 Kamera (<span id="count-fav-cameras">0</span>)
          </button>
          <button class="segment-btn ${this.activeTab === 'lenses' ? 'active' : ''}" data-tab="lenses" id="tab-fav-lenses">
            🔍 Lensa (<span id="count-fav-lenses">0</span>)
          </button>
        </div>

        <!-- Favorites Cards Grid -->
        <div id="favorites-cards-grid" class="cards-grid">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat koleksi favorit...</p>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    this.bindEvents();
    this.loadFavorites();
  },

  bindEvents() {
    const tabs = document.querySelectorAll('.segmented-control .segment-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.getAttribute('data-tab');
        this.loadFavorites();
      });
    });

    window.addEventListener('favoritesUpdated', () => {
      this.loadFavorites();
    });
  },

  loadFavorites() {
    const grid = document.getElementById('favorites-cards-grid');
    if (!grid) return;

    const cameras = StorageService.getFavoriteCameras();
    const lenses = StorageService.getFavoriteLenses();

    // Update counters in tabs
    const elAll = document.getElementById('count-fav-all');
    const elCam = document.getElementById('count-fav-cameras');
    const elLen = document.getElementById('count-fav-lenses');
    if (elAll) elAll.textContent = cameras.length + lenses.length;
    if (elCam) elCam.textContent = cameras.length;
    if (elLen) elLen.textContent = lenses.length;

    let itemsToDisplay = [];
    if (this.activeTab === 'all') {
      itemsToDisplay = [
        ...cameras.map(c => ({ ...c, _type: 'camera' })),
        ...lenses.map(l => ({ ...l, _type: 'lens' }))
      ];
    } else if (this.activeTab === 'cameras') {
      itemsToDisplay = cameras.map(c => ({ ...c, _type: 'camera' }));
    } else if (this.activeTab === 'lenses') {
      itemsToDisplay = lenses.map(l => ({ ...l, _type: 'lens' }));
    }

    if (itemsToDisplay.length === 0) {
      grid.innerHTML = `
        <div class="empty-state card-glass col-span-full">
          <div class="empty-icon">🔖</div>
          <h3>Belum Ada Koleksi Tersimpan</h3>
          <p>Anda belum menandai kamera atau lensa sebagai favorit. Klik ikon hati pada katalog untuk menyimpannya ke koleksi Anda.</p>
          <div class="empty-state-actions">
            <a href="#cameras" class="btn btn-primary">Jelajahi Kamera</a>
            <a href="#lenses" class="btn btn-secondary">Jelajahi Lensa</a>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = itemsToDisplay.map(item => {
      const isCamera = item._type === 'camera';
      const typeLabel = isCamera ? (item.category || 'Kamera saku') : 'Lensa manual';
      const specsLine = isCamera 
        ? `<span>${item.megapixels} MP</span><span class="sep">&middot;</span><span>${item.sensorType}</span><span class="sep">&middot;</span><span>${typeLabel}</span>`
        : `<span>${item.focalLength}</span><span class="sep">&middot;</span><span>${item.maxAperture}</span><span class="sep">&middot;</span><span>${item.mount}</span>`;

      return `
        <article class="clean-product-card" data-type="${item._type}" data-id="${item.id}">
          <div class="card-thumb-box">
            <img 
              src="${item.imageUrl}" 
              alt="${item.name}" 
              class="card-thumb-img" 
              loading="lazy"
              decoding="async"
              onload="this.classList.add('is-loaded'); this.parentElement.classList.add('is-loaded');"
              onerror="this.src='/icons/icon-512.png'; this.classList.add('is-loaded'); this.parentElement.classList.add('is-loaded');"
            />
            <button 
              class="card-wishlist-btn is-active" 
              data-remove-type="${item._type}" 
              data-remove-id="${item.id}" 
              title="Hapus dari koleksi"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#0284c7" stroke="#0284c7" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div class="card-detail-box">
            <div class="card-brand-row">
              <span class="card-brand-label">${item.brand}</span>
              <span class="card-year-label">${item.releaseYear}</span>
            </div>
            
            <h3 class="card-product-name">${item.name}</h3>

            <div class="card-specs-line">
              ${specsLine}
            </div>

            <div class="card-price-row">
              <div class="price-box">
                <span class="price-title">Harga</span>
                <span class="price-amount">${item.estimatedPriceIdr}</span>
              </div>
              <span class="view-detail-text">Detail &rarr;</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Bind item card click -> navigate to detail
    grid.querySelectorAll('.clean-product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-wishlist-btn')) return;
        const type = card.getAttribute('data-type');
        const id = card.getAttribute('data-id');
        window.location.hash = type === 'camera' ? `#camera/${id}` : `#lens/${id}`;
      });
    });

    // Bind remove button
    grid.querySelectorAll('.card-wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-remove-type');
        const id = btn.getAttribute('data-remove-id');

        if (type === 'camera') {
          const cam = cameras.find(c => c.id === id);
          if (cam) {
            StorageService.toggleFavoriteCamera(cam);
            if (window.App && window.App.showToast) {
              window.App.showToast(`Dihapus dari koleksi: ${cam.name}`);
            }
          }
        } else {
          const lens = lenses.find(l => l.id === id);
          if (lens) {
            StorageService.toggleFavoriteLens(lens);
            if (window.App && window.App.showToast) {
              window.App.showToast(`Dihapus dari koleksi: ${lens.name}`);
            }
          }
        }
        this.loadFavorites();
      });
    });
  }
};

window.FavoritesView = FavoritesView;
