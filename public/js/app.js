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
    this.initBottomNav();
    this.updateFavoritesBadge();
    this.initAdminModals();

    // Listen to hash change for SPA navigation
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('favoritesUpdated', () => this.updateFavoritesBadge());

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
      if (modalAdmin) modalAdmin.classList.remove('is-hidden');
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
        const adminUser = {
          name: 'Administrator RetroCam',
          email: email || 'admin@retrocam.id',
          role: 'admin',
          phone: '+62 811-9876-5432',
          city: 'Semarang, Jawa Tengah',
          memberTier: 'Administrator',
          joinDate: 'Sistem Katalog 2024',
          bio: 'Pengelola arsip katalog kamera digital dan lensa vintage RetroCam Archive.',
          avatarUrl: '/images/app-logo.png'
        };

        StorageService.login(adminUser);
        window.closeAdminLoginModal();
        App.showToast('Login berhasil sebagai Administrator! Akses tambah kamera & lensa aktif.');

        if (window.ProfileView && window.ProfileView.loadProfileData) {
          window.ProfileView.loadProfileData();
        }
        if (window.location.hash.startsWith('#camera') && window.CamerasView && window.CamerasView.loadCamerasData) {
          window.CamerasView.loadCamerasData();
        }
        if (window.location.hash.startsWith('#lens') && window.LensesView && window.LensesView.loadLensesData) {
          window.LensesView.loadLensesData();
        }
      };
    }
  }
};

window.App = App;

// Bootstrap when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
