/**
 * RetroCam Archive - Main Application Controller & Router
 * Progressive Web App (PWA) Core
 */

const App = {
  routes: {
    '': CamerasView,
    '#cameras': CamerasView,
    '#camera/:id': CameraDetailView,
    '#lenses': LensesView,
    '#lens/:id': LensDetailView,
    '#favorites': FavoritesView,
    '#guides': GuideView,
    '#profile': ProfileView
  },

  currentView: null,

  init() {
    console.log('[RetroCam App] Initializing...');
    this.registerServiceWorker();
    this.initPWAInstallPrompt();
    this.initNetworkListeners();
    this.initHeaderControls();
    this.initBottomNav();
    this.updateFavoritesBadge();
    this.initCartModal();
    this.initAdminModals();

    // Listen to hash change for SPA navigation
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('favoritesUpdated', () => this.updateFavoritesBadge());
    window.addEventListener('cartUpdated', () => this.updateCartBadge());

    // Initial route handling
    this.handleRoute();
  },

  // 1. Service Worker Registration (PWA Requirement)
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('[Service Worker] Registered with scope:', reg.scope);
            reg.update();
          })
          .catch((err) => {
            console.warn('[Service Worker] Registration failed:', err.message);
          });
      });
    }
  },

  // 2. PWA Install Prompt Listener
  initPWAInstallPrompt() {
    window.deferredPWAInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      console.log('[PWA] beforeinstallprompt captured, ready for install button');
      
      const installBtnHeader = document.getElementById('btn-header-install');
      if (installBtnHeader) {
        installBtnHeader.style.display = 'inline-flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App successfully installed!');
      this.showToast('🎉 Aplikasi RetroCam berhasil dipasang ke Home Screen!');
    });
  },

  // 3. Online/Offline Network Status Listeners
  initNetworkListeners() {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      const statusPill = document.getElementById('network-status-pill');
      if (statusPill) {
        if (isOnline) {
          statusPill.className = 'status-pill online';
          statusPill.innerHTML = '<span class="status-dot"></span><span>Online</span>';
        } else {
          statusPill.className = 'status-pill offline';
          statusPill.innerHTML = '<span class="status-dot"></span><span>Offline Mode</span>';
          this.showToast('📶 Anda sedang offline. Menampilkan arsip dari cache lokal.');
        }
      }
    };

    window.addEventListener('online', () => {
      updateOnlineStatus();
      this.showToast('✓ Koneksi kembali online!');
    });
    window.addEventListener('offline', () => {
      updateOnlineStatus();
    });

    updateOnlineStatus();
  },

  // 3b. Header Controls: Install App & Login Button
  initHeaderControls() {
    const installBtnHeader = document.getElementById('btn-header-install');
    const loginBtnHeader = document.getElementById('btn-header-login');
    const loginTextHeader = document.getElementById('header-login-text');

    this.updateHeaderAuthState = () => {
      const isAdmin = StorageService.isAdmin();
      if (loginTextHeader) {
        loginTextHeader.textContent = isAdmin ? 'Logout' : 'Login';
      }
      if (loginBtnHeader) {
        loginBtnHeader.title = isAdmin ? 'Klik untuk logout' : 'Masuk sebagai Administrator';
      }
    };

    if (installBtnHeader) {
      installBtnHeader.onclick = () => {
        if (window.deferredPWAInstallPrompt) {
          window.deferredPWAInstallPrompt.prompt();
          window.deferredPWAInstallPrompt.userChoice.then(() => {
            window.deferredPWAInstallPrompt = null;
          });
        } else {
          alert('Fitur Pasang Aplikasi (PWA): Buka menu browser Anda (ikon titik tiga di Chrome / ikon Bagikan di Safari iOS), lalu pilih "Tambahkan ke Layar Utama" (Install App).');
        }
      };
    }

    if (loginBtnHeader) {
      loginBtnHeader.onclick = () => {
        if (StorageService.isAdmin()) {
          StorageService.logout();
          this.showToast('Berhasil logout.');
          this.updateHeaderAuthState();
          this.handleRoute();
        } else {
          window.openAdminLoginModal();
        }
      };
    }

    this.updateHeaderAuthState();
    window.addEventListener('authChanged', () => {
      this.updateHeaderAuthState();
      this.updateFavoritesBadge();
    });
  },

  // 4. Client-side Router
  async handleRoute() {
    const hash = window.location.hash || '#cameras';
    console.log('[Router] Navigating to:', hash);

    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    // Match route pattern
    let targetView = null;
    let params = {};

    if (hash.startsWith('#camera/')) {
      targetView = CameraDetailView;
      params.id = hash.replace('#camera/', '').split('?')[0];
    } else if (hash.startsWith('#lens/')) {
      targetView = LensDetailView;
      params.id = hash.replace('#lens/', '').split('?')[0];
    } else if (this.routes[hash]) {
      targetView = this.routes[hash];
    } else {
      targetView = CamerasView;
    }

    // Update Bottom Navigation Bar active state
    this.updateBottomNavState(hash);

    // Render View
    try {
      this.currentView = targetView;
      appContent.innerHTML = await targetView.render(params);
      if (typeof targetView.afterRender === 'function') {
        await targetView.afterRender(params);
      }
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('[Router] Render error:', err);
      appContent.innerHTML = `
        <div class="page-container">
          <div class="error-state card-glass">
            <h3>Gagal Memuat Halaman</h3>
            <p>${err.message}</p>
            <a href="#cameras" class="btn btn-primary">Kembali ke Beranda</a>
          </div>
        </div>
      `;
    }
  },

  // 5. Bottom Navigation Bar Setup (Ketentuan 2)
  initBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');
        if (href) {
          window.location.hash = href;
        }
      });
    });
  },

  updateBottomNavState(hash) {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      const target = item.getAttribute('href');
      let isActive = false;

      if (hash.startsWith('#camera')) {
        isActive = (target === '#cameras');
      } else if (hash.startsWith('#lens')) {
        isActive = (target === '#lenses');
      } else if (hash.startsWith('#favorites')) {
        isActive = (target === '#favorites');
      } else if (hash.startsWith('#guides')) {
        isActive = (target === '#guides');
      } else if (hash.startsWith('#profile')) {
        isActive = (target === '#profile');
      }

      item.classList.toggle('active', isActive);
    });
  },

  // 6. Favorites Badge Count on Bottom Nav Bar
  updateFavoritesBadge() {
    const badge = document.getElementById('fav-badge-count');
    if (!badge) return;

    const total = StorageService.getTotalFavoritesCount();
    if (total > 0) {
      badge.textContent = total > 99 ? '99+' : total;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  },

  // 6b. Shopping Cart Badge & Management
  updateCartBadge() {
    const badge = document.getElementById('header-cart-badge');
    if (!badge) return;
    const total = StorageService.getCartTotalCount();
    if (total > 0) {
      badge.textContent = total > 99 ? '99+' : total;
      badge.classList.remove('is-hidden');
    } else {
      badge.classList.add('is-hidden');
    }
  },

  initCartModal() {
    const cartBtn = document.getElementById('btn-header-cart');
    const modalCart = document.getElementById('modal-cart');
    const closeBtn = document.getElementById('btn-close-modal-cart');

    window.openCartModal = () => {
      this.renderCartModalContent();
      if (modalCart) modalCart.classList.remove('is-hidden');
    };

    window.closeCartModal = () => {
      if (modalCart) modalCart.classList.add('is-hidden');
    };

    if (cartBtn) cartBtn.onclick = () => window.openCartModal();
    if (closeBtn) closeBtn.onclick = () => window.closeCartModal();

    if (modalCart) {
      modalCart.addEventListener('click', (e) => {
        if (e.target === modalCart) window.closeCartModal();
      });
    }

    this.updateCartBadge();
  },

  renderCartModalContent() {
    const body = document.getElementById('modal-cart-body');
    if (!body) return;

    const cart = StorageService.getCart();
    if (!cart || cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🛒</div>
          <h4>Keranjang Anda Masih Kosong</h4>
          <p>Belum ada kamera atau lensa klasik yang ditambahkan ke keranjang belanja.</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="window.closeCartModal(); window.location.hash='#cameras';">
            Jelajahi Kamera
          </button>
        </div>
      `;
      return;
    }

    const selectedItems = StorageService.getSelectedCartItems();
    const selectedCount = StorageService.getSelectedTotalCount();
    const selectedPrice = StorageService.getSelectedTotalPrice();
    const formattedTotal = 'Rp ' + selectedPrice.toLocaleString('id-ID');
    const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;

    // Preserve customer fields if user is typing
    const prevName = document.getElementById('cart-cust-name')?.value || '';
    const prevNotes = document.getElementById('cart-cust-notes')?.value || '';

    body.innerHTML = `
      <!-- Toolbar Pilih Semua & Counter -->
      <div class="cart-select-all-bar">
        <label class="cart-checkbox-label">
          <input type="checkbox" id="cart-select-all-checkbox" ${isAllSelected ? 'checked' : ''} />
          <span><strong>Pilih Semua</strong> (${cart.length} produk)</span>
        </label>
        <span class="cart-selected-count-badge">${selectedCount} barang dipilih</span>
      </div>

      <!-- Daftar Produk di Keranjang -->
      <div class="cart-items-list">
        ${cart.map(item => {
          const isSelected = item.selected !== false;
          return `
            <div class="cart-item-row ${isSelected ? 'is-selected' : ''}" data-cart-id="${item.id}">
              <label class="cart-checkbox-label" title="Centang untuk checkout barang ini">
                <input type="checkbox" class="cart-item-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''} />
              </label>
              <div class="cart-item-thumb">
                <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='/icons/icon-512.png'" />
              </div>
              <div class="cart-item-info">
                <span class="cart-item-type">${item.type} &bull; ${item.brand}</span>
                <h4 class="cart-item-title">${item.name}</h4>
                <span class="cart-item-price">${item.priceFormatted}</span>
              </div>
              <div class="cart-item-actions">
                <div class="cart-qty-control">
                  <button type="button" class="btn-qty-minus" data-id="${item.id}" title="Kurangi jumlah">&minus;</button>
                  <span class="cart-qty-value">${item.quantity || 1}</span>
                  <button type="button" class="btn-qty-plus" data-id="${item.id}" title="Tambah jumlah">&#43;</button>
                </div>
                <button type="button" class="btn-cart-remove" data-id="${item.id}" title="Hapus dari keranjang">&times;</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="cart-checkout-section">
        <div class="cart-customer-fields">
          <div class="form-group" style="margin-bottom: 0.6rem;">
            <label for="cart-cust-name" style="font-size: 0.82rem; font-weight: 600; color: #475569;">Nama Pemesan (Opsional):</label>
            <input type="text" id="cart-cust-name" class="form-input form-input-sm" placeholder="Nama Anda" value="${prevName}" />
          </div>
          <div class="form-group" style="margin-bottom: 0.6rem;">
            <label for="cart-cust-notes" style="font-size: 0.82rem; font-weight: 600; color: #475569;">Catatan / Alamat Pengiriman (Opsional):</label>
            <textarea id="cart-cust-notes" class="form-input form-input-sm" rows="2" placeholder="Catatan khusus atau kota tujuan pengiriman">${prevNotes}</textarea>
          </div>
        </div>

        <div class="cart-total-box">
          <div class="cart-total-row">
            <span>Barang Dipilih untuk Checkout:</span>
            <strong>${selectedCount} barang</strong>
          </div>
          <div class="cart-total-row highlight">
            <span>Total Estimasi Checkout:</span>
            <strong class="cart-total-price">${formattedTotal}</strong>
          </div>
        </div>

        <button type="button" id="btn-checkout-wa" class="btn btn-whatsapp-checkout ${selectedCount === 0 ? 'is-disabled' : ''}" ${selectedCount === 0 ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.02.79.81-2.94-.19-.3a8.25 8.25 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.58c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8.6.26 1.07.42 1.44.53.61.2 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/>
          </svg>
          <span>${selectedCount > 0 ? `Checkout (${selectedCount} barang) via WhatsApp` : 'Pilih Barang untuk Checkout'}</span>
        </button>
        <p class="wa-checkout-note">${selectedCount > 0 ? 'Pesanan produk terpilih dikirimkan langsung ke WhatsApp <strong>082329191645</strong>' : 'Silakan pilih/centang produk yang ingin Anda beli di atas.'}</p>
      </div>
    `;

    // Event Listeners for item checkboxes
    body.querySelectorAll('.cart-item-checkbox').forEach(cb => {
      cb.onchange = (e) => {
        const id = cb.getAttribute('data-id');
        StorageService.toggleCartItemSelection(id);
        this.renderCartModalContent();
      };
    });

    // Event Listener for Select All checkbox
    const selectAllCb = document.getElementById('cart-select-all-checkbox');
    if (selectAllCb) {
      selectAllCb.onchange = (e) => {
        StorageService.setAllCartSelection(e.target.checked);
        this.renderCartModalContent();
      };
    }

    // Event Listeners for quantity and remove
    body.querySelectorAll('.btn-qty-minus').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        StorageService.updateCartQty(id, -1);
        this.renderCartModalContent();
      };
    });

    body.querySelectorAll('.btn-qty-plus').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        StorageService.updateCartQty(id, 1);
        this.renderCartModalContent();
      };
    });

    body.querySelectorAll('.btn-cart-remove').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        StorageService.removeFromCart(id);
        this.renderCartModalContent();
      };
    });

    // Checkout WhatsApp button handler
    const checkoutBtn = document.getElementById('btn-checkout-wa');
    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        const itemsToCheckout = StorageService.getSelectedCartItems();
        if (itemsToCheckout.length === 0) {
          this.showToast('Silakan pilih minimal 1 produk untuk checkout.');
          return;
        }

        const custName = (document.getElementById('cart-cust-name')?.value || '').trim();
        const custNotes = (document.getElementById('cart-cust-notes')?.value || '').trim();
        const phone = '6282329191645';

        let message = `Halo RetroCam Archive, saya ingin memesan produk berikut:\n\n`;
        message += `🛍️ *DAFTAR PESANAN:*\n`;

        itemsToCheckout.forEach((item, index) => {
          message += `${index + 1}. *${item.name}* (x${item.quantity || 1}) - ${item.priceFormatted}\n`;
        });

        const totalItemsCount = StorageService.getSelectedTotalCount();
        const totalItemsPrice = StorageService.getSelectedTotalPrice();
        const formattedCheckoutTotal = 'Rp ' + totalItemsPrice.toLocaleString('id-ID');

        message += `\n----------------------------------------\n`;
        message += `📦 *Total Item Dipilih:* ${totalItemsCount} barang\n`;
        message += `💰 *Total Estimasi:* ${formattedCheckoutTotal}\n`;
        message += `----------------------------------------\n`;

        if (custName) {
          message += `👤 *Nama Pemesan:* ${custName}\n`;
        }
        if (custNotes) {
          message += `📝 *Catatan / Alamat:* ${custNotes}\n`;
        }

        message += `\nMohon info ketersediaan stok & petunjuk pembayarannya. Terima kasih!`;

        // 1. Kurangi stok produk yang dicheckout
        itemsToCheckout.forEach(item => {
          StorageService.reduceProductStock(item.id, item.quantity || 1);
        });

        // 2. Hapus produk yang sudah dicheckout dari keranjang belanja
        const currentCart = StorageService.getCart();
        const remainingCart = currentCart.filter(item => item.selected === false);
        StorageService.saveCart(remainingCart);

        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        this.showToast('Membuka WhatsApp & stok berhasil dikurangi!');
        this.renderCartModalContent();
      };
    }
  },

  // 7. Toast Notification System
  showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast animate-toast-in';
    toast.innerHTML = `
      <span class="toast-text">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('animate-toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // 8. Admin Modals Management (Tambah Kamera & Lensa)
  initAdminModals() {
    const modalCam = document.getElementById('modal-add-camera');
    const closeCamBtn = document.getElementById('btn-close-modal-cam');
    const cancelCamBtn = document.getElementById('btn-cancel-modal-cam');
    const formCam = document.getElementById('form-admin-add-camera');

    window.openAddCameraModal = () => {
      if (modalCam) {
        modalCam.classList.remove('is-hidden');
      }
    };

    window.closeAddCameraModal = () => {
      if (modalCam) modalCam.classList.add('is-hidden');
    };

    if (closeCamBtn) closeCamBtn.onclick = window.closeAddCameraModal;
    if (cancelCamBtn) cancelCamBtn.onclick = window.closeAddCameraModal;

    if (formCam) {
      formCam.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-add-cam');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Menyimpan...';
        }

        try {
          const newCam = {
            name: document.getElementById('add-cam-name').value.trim(),
            brand: document.getElementById('add-cam-brand').value,
            category: document.getElementById('add-cam-category').value,
            sensorType: document.getElementById('add-cam-sensor').value,
            megapixels: parseFloat(document.getElementById('add-cam-mp').value) || 12.0,
            releaseYear: parseInt(document.getElementById('add-cam-year').value) || 2008,
            priceYen: document.getElementById('add-cam-price').value.trim() || '¥45,000',
            imageUrl: document.getElementById('add-cam-img').value.trim() || '/images/cameras/cam-pocket-01.jpg',
            summary: document.getElementById('add-cam-summary').value.trim()
          };

          await ApiService.addCamera(newCam);
          window.closeAddCameraModal();
          formCam.reset();
          App.showToast(`Kamera "${newCam.name}" berhasil ditambahkan ke katalog!`);

          if (window.location.hash.startsWith('#camera') && window.CamerasView && window.CamerasView.loadCamerasData) {
            window.CamerasView.loadCamerasData();
          } else if (window.location.hash === '#profile' && window.ProfileView && window.ProfileView.loadProfileData) {
            window.ProfileView.loadProfileData();
          }
        } catch (err) {
          App.showToast(`Gagal menambahkan kamera: ${err.message}`);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Kamera ke Katalog';
          }
        }
      };
    }

    const modalLens = document.getElementById('modal-add-lens');
    const closeLensBtn = document.getElementById('btn-close-modal-lens');
    const cancelLensBtn = document.getElementById('btn-cancel-modal-lens');
    const formLens = document.getElementById('form-admin-add-lens');

    window.openAddLensModal = () => {
      if (modalLens) {
        modalLens.classList.remove('is-hidden');
      }
    };

    window.closeAddLensModal = () => {
      if (modalLens) modalLens.classList.add('is-hidden');
    };

    if (closeLensBtn) closeLensBtn.onclick = window.closeAddLensModal;
    if (cancelLensBtn) cancelLensBtn.onclick = window.closeAddLensModal;

    if (formLens) {
      formLens.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-add-lens');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Menyimpan...';
        }

        try {
          const newLens = {
            name: document.getElementById('add-lens-name').value.trim(),
            brand: document.getElementById('add-lens-brand').value,
            category: document.getElementById('add-lens-category').value,
            mount: document.getElementById('add-lens-mount').value,
            focalLength: document.getElementById('add-lens-focal').value.trim() || '50mm',
            maxAperture: document.getElementById('add-lens-aperture').value.trim() || 'f/1.8',
            releaseYear: parseInt(document.getElementById('add-lens-year').value) || 2020,
            priceYen: document.getElementById('add-lens-price').value.trim() || '¥38,000',
            imageUrl: document.getElementById('add-lens-img').value.trim() || '/images/lenses/lens-prime-01.jpg',
            summary: document.getElementById('add-lens-summary').value.trim()
          };

          await ApiService.addLens(newLens);
          window.closeAddLensModal();
          formLens.reset();
          App.showToast(`Lensa "${newLens.name}" berhasil ditambahkan ke katalog!`);

          if (window.location.hash.startsWith('#lens') && window.LensesView && window.LensesView.loadLensesData) {
            window.LensesView.loadLensesData();
          } else if (window.location.hash === '#profile' && window.ProfileView && window.ProfileView.loadProfileData) {
            window.ProfileView.loadProfileData();
          }
        } catch (err) {
          App.showToast(`Gagal menambahkan lensa: ${err.message}`);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Lensa ke Katalog';
          }
        }
      };
    }

    // Modal Admin Login
    const modalAdmin = document.getElementById('modal-admin-login');
    const closeAdminBtn = document.getElementById('btn-close-modal-admin');
    const cancelAdminBtn = document.getElementById('btn-cancel-modal-admin');
    const formAdmin = document.getElementById('form-modal-admin-login');

    window.openAdminLoginModal = () => {
      if (modalAdmin) {
        if (formAdmin) formAdmin.reset();
        modalAdmin.classList.remove('is-hidden');
      }
    };

    window.closeAdminLoginModal = () => {
      if (modalAdmin) modalAdmin.classList.add('is-hidden');
    };

    if (closeAdminBtn) closeAdminBtn.onclick = window.closeAdminLoginModal;
    if (cancelAdminBtn) cancelAdminBtn.onclick = window.closeAdminLoginModal;

    if (formAdmin) {
      formAdmin.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-login-email').value.trim();
        const password = document.getElementById('admin-login-password').value.trim();

        if (email.toLowerCase() === 'admin@retrocam.id' && password === 'admin123') {
          const adminUser = {
            name: 'Administrator',
            email: 'admin@retrocam.id',
            role: 'admin',
            phone: '+62 811-9876-5432',
            city: 'Semarang, Jawa Tengah',
            avatarUrl: '/images/app-logo.png'
          };

          StorageService.login(adminUser);
          window.closeAdminLoginModal();
          formAdmin.reset();
          App.showToast('Login berhasil sebagai Administrator.');

          if (App.updateHeaderAuthState) App.updateHeaderAuthState();
          App.handleRoute();
        } else {
          alert('Email atau kata sandi admin salah. Silakan coba lagi.');
        }
      };
    }

    // Modal Edit Kamera (Khusus Administrator)
    const modalEditCam = document.getElementById('modal-edit-camera');
    const closeEditCamBtn = document.getElementById('btn-close-modal-edit-camera');
    const cancelEditCamBtn = document.getElementById('btn-cancel-modal-edit-camera');
    const formEditCam = document.getElementById('form-modal-edit-camera');

    window.openEditCameraModal = (cam) => {
      if (!modalEditCam || !cam) return;
      document.getElementById('edit-camera-id').value = cam.id || '';
      document.getElementById('edit-camera-name').value = cam.name || '';
      document.getElementById('edit-camera-brand').value = cam.brand || '';
      document.getElementById('edit-camera-category').value = cam.category || 'Kamera saku';
      document.getElementById('edit-camera-year').value = cam.releaseYear || 2005;
      document.getElementById('edit-camera-sensor').value = cam.sensorType || 'CCD';
      document.getElementById('edit-camera-mp').value = cam.megapixels || 12.0;
      document.getElementById('edit-camera-price').value = cam.estimatedPriceIdr || 'Rp 1.250.000';
      document.getElementById('edit-camera-rating').value = cam.rating || 4.8;
      document.getElementById('edit-camera-img').value = cam.imageUrl || '';
      document.getElementById('edit-camera-summary').value = cam.summary || cam.colorProfile || '';
      modalEditCam.classList.remove('is-hidden');
    };

    window.closeEditCameraModal = () => {
      if (modalEditCam) modalEditCam.classList.add('is-hidden');
    };

    if (closeEditCamBtn) closeEditCamBtn.onclick = window.closeEditCameraModal;
    if (cancelEditCamBtn) cancelEditCamBtn.onclick = window.closeEditCameraModal;

    if (formEditCam) {
      formEditCam.onsubmit = async (e) => {
        e.preventDefault();
        const updated = {
          id: document.getElementById('edit-camera-id').value,
          name: document.getElementById('edit-camera-name').value.trim(),
          brand: document.getElementById('edit-camera-brand').value.trim(),
          category: document.getElementById('edit-camera-category').value,
          releaseYear: parseInt(document.getElementById('edit-camera-year').value) || 2005,
          sensorType: document.getElementById('edit-camera-sensor').value,
          megapixels: parseFloat(document.getElementById('edit-camera-mp').value) || 12.0,
          estimatedPriceIdr: document.getElementById('edit-camera-price').value.trim(),
          rating: parseFloat(document.getElementById('edit-camera-rating').value) || 4.8,
          imageUrl: document.getElementById('edit-camera-img').value.trim() || '/icons/icon-512.png',
          summary: document.getElementById('edit-camera-summary').value.trim()
        };

        await ApiService.updateCamera(updated);
        window.closeEditCameraModal();
        App.showToast(`Kamera "${updated.name}" berhasil diperbarui!`);

        App.handleRoute();
      };
    }

    // Modal Edit Lensa (Khusus Administrator)
    const modalEditLens = document.getElementById('modal-edit-lens');
    const closeEditLensBtn = document.getElementById('btn-close-modal-edit-lens');
    const cancelEditLensBtn = document.getElementById('btn-cancel-modal-edit-lens');
    const formEditLens = document.getElementById('form-modal-edit-lens');

    window.openEditLensModal = (lens) => {
      if (!modalEditLens || !lens) return;
      document.getElementById('edit-lens-id').value = lens.id || '';
      document.getElementById('edit-lens-name').value = lens.name || '';
      document.getElementById('edit-lens-brand').value = lens.brand || '';
      document.getElementById('edit-lens-category').value = lens.category || 'Lensa Prime';
      document.getElementById('edit-lens-mount').value = lens.mount || 'Sony E-mount';
      document.getElementById('edit-lens-focal').value = lens.focalLength || '50mm';
      document.getElementById('edit-lens-aperture').value = lens.maxAperture || 'f/1.8';
      document.getElementById('edit-lens-year').value = lens.releaseYear || 2020;
      document.getElementById('edit-lens-price').value = lens.estimatedPriceIdr || lens.priceYen || '¥38,000';
      document.getElementById('edit-lens-img').value = lens.imageUrl || '';
      document.getElementById('edit-lens-summary').value = lens.summary || lens.bokehCharacter || '';
      modalEditLens.classList.remove('is-hidden');
    };

    window.closeEditLensModal = () => {
      if (modalEditLens) modalEditLens.classList.add('is-hidden');
    };

    if (closeEditLensBtn) closeEditLensBtn.onclick = window.closeEditLensModal;
    if (cancelEditLensBtn) cancelEditLensBtn.onclick = window.closeEditLensModal;

    if (formEditLens) {
      formEditLens.onsubmit = async (e) => {
        e.preventDefault();
        const updated = {
          id: document.getElementById('edit-lens-id').value,
          name: document.getElementById('edit-lens-name').value.trim(),
          brand: document.getElementById('edit-lens-brand').value.trim(),
          category: document.getElementById('edit-lens-category').value,
          mount: document.getElementById('edit-lens-mount').value.trim(),
          focalLength: document.getElementById('edit-lens-focal').value.trim(),
          maxAperture: document.getElementById('edit-lens-aperture').value.trim(),
          releaseYear: parseInt(document.getElementById('edit-lens-year').value) || 2020,
          estimatedPriceIdr: document.getElementById('edit-lens-price').value.trim(),
          imageUrl: document.getElementById('edit-lens-img').value.trim() || '/icons/icon-512.png',
          summary: document.getElementById('edit-lens-summary').value.trim()
        };

        await ApiService.updateLens(updated);
        window.closeEditLensModal();
        App.showToast(`Lensa "${updated.name}" berhasil diperbarui!`);

        App.handleRoute();
      };
    }
  }
};

window.App = App;

// Bootstrap when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
