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
  }
};

window.App = App;

// Bootstrap when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
