/**
 * RetroCam Archive - Profile & About View
 * Halaman Profil Pengguna E-Commerce & Informasi Aplikasi
 * Dilengkapi Sistem Autentikasi (Login/Daftar) & Pemotong Foto Profil Lingkaran
 */

const ProfileView = {
  profileData: null,
  statsData: null,
  currentAvatarData: null,

  // State untuk Cropper Foto Lingkaran (WA/IG style)
  cropperState: {
    img: null,
    scale: 1,
    minScale: 1,
    maxScale: 3,
    posX: 0,
    posY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    imgStartX: 0,
    imgStartY: 0
  },

  async render() {
    return `
      <section class="page-container page-profile animate-fade-in">
        <!-- Hero Header -->
        <header class="section-hero">
          <h1 class="hero-title" id="profile-page-title">Profil</h1>
          <p class="hero-subtitle" id="profile-page-subtitle">
            Informasi akun dan preferensi belanja kamera Anda.
          </p>
        </header>

        <div id="profile-content-container">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat profil...</p>
          </div>
        </div>

        <!-- Modal Pemotong Foto Profil Lingkaran (Gaya WA / IG) -->
        <div id="avatar-crop-modal" class="avatar-crop-modal is-hidden" role="dialog" aria-modal="true" aria-labelledby="crop-modal-title">
          <div class="avatar-crop-card">
            <div class="avatar-crop-header">
              <h3 id="crop-modal-title">Sesuaikan Foto Profil</h3>
              <button type="button" class="btn-clear" id="btn-close-crop-x">&times;</button>
            </div>

            <div class="avatar-crop-body">
              <div class="crop-canvas-wrapper">
                <canvas id="avatar-crop-canvas" width="280" height="280"></canvas>
              </div>

              <p class="crop-hint-text">
                Geser (drag) foto dan atur pembesaran (zoom) agar pas di dalam lingkaran seperti di WhatsApp / Instagram.
              </p>

              <div class="crop-zoom-control">
                <label for="crop-zoom-slider">🔍 Zoom:</label>
                <input type="range" id="crop-zoom-slider" class="crop-slider" min="1" max="3" step="0.01" value="1" />
              </div>
            </div>

            <div class="avatar-crop-footer">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-crop">Batal</button>
              <button type="button" class="btn btn-primary btn-sm" id="btn-apply-crop">Terapkan Foto</button>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    await this.loadProfileData();
  },

  // Helper untuk merender bagian About dan Status Aplikasi
  renderAboutAndStatusSection(isOnline, stats) {
    return `
      <!-- About / Tentang Aplikasi Card -->
      <div class="info-card card-glass about-app-card">
        <div class="info-card-header">
          <div>
            <h3>About RetroCam Archive</h3>
            <p class="subtitle-small">Katalog Interaktif Kamera Digital & Lensa Klasik</p>
          </div>
        </div>
        <div class="narrative-body">
          <p>
            <strong>RetroCam Archive</strong> adalah aplikasi web interaktif berbasis Progressive Web Apps (PWA) yang mengkurasi arsip kamera digital klasik era sensor CCD/CMOS tahun 2000-an hingga modern, serta berbagai lensa kamera pilihan dari Yodobashi Camera dan arsip fotografi.
          </p>
          <div class="about-app-grid">
            <div class="about-app-item">
              <span class="about-item-icon">📷</span>
              <div class="about-item-content">
                <strong>Katalog Kamera</strong>
                <p>Menjelajahi beragam tipe kamera digital (Hibrida, Saku, Prosumer, Refleks) lengkap dengan spesifikasi teknis dan karakteristik sensor.</p>
              </div>
            </div>
            <div class="about-app-item">
              <span class="about-item-icon">🔍</span>
              <div class="about-item-content">
                <strong>Katalog Lensa</strong>
                <p>Koleksi lensa prime, zoom, makro, dan telephoto dengan panduan mount lensa dan bukaan diafragma (aperture).</p>
              </div>
            </div>
            <div class="about-app-item">
              <span class="about-item-icon">⭐</span>
              <div class="about-item-content">
                <strong>Koleksi Pribadi</strong>
                <p>Fitur simpan favorit secara offline di penyimpanan lokal perangkat untuk menandai kamera dan lensa pilihan.</p>
              </div>
            </div>
            <div class="about-app-item">
              <span class="about-item-icon">⚡</span>
              <div class="about-item-content">
                <strong>PWA & Akses Offline</strong>
                <p>Dapat dipasang langsung ke layar beranda perangkat dan tetap dapat diakses saat tidak ada koneksi internet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Aplikasi Card -->
      <div class="info-card card-glass">
        <div class="info-card-header">
          <div>
            <h3>Status Aplikasi</h3>
            <p class="subtitle-small">Kemampuan offline dan instalasi ke layar utama</p>
          </div>
        </div>

        <div class="pwa-status-grid">
          <div class="status-metric-cell">
            <span class="metric-label">Status Koneksi</span>
            <span class="metric-value ${isOnline ? 'text-success' : 'text-warning'}">
              <span class="dot-status ${isOnline ? 'dot-online' : 'dot-offline'}"></span>
              ${isOnline ? 'Online (Terhubung)' : 'Offline (Mode Cache)'}
            </span>
          </div>

          <div class="status-metric-cell">
            <span class="metric-label">Kamera Terkatalog</span>
            <span class="metric-value highlight-gold">${stats?.totalCameras || 55} Kamera</span>
          </div>

          <div class="status-metric-cell">
            <span class="metric-label">Lensa Terkatalog</span>
            <span class="metric-value highlight-gold">${stats?.totalLenses || 52} Lensa</span>
          </div>
        </div>

        <div class="pwa-install-banner mt-3" id="pwa-install-banner">
          <div class="install-info">
            <h4>Pasang Aplikasi di Perangkat</h4>
            <p>Aplikasi ini dapat diinstal ke layar utama (Home Screen) smartphone atau komputer Anda untuk dibuka secara mandiri tanpa bilah browser.</p>
          </div>
          <button class="btn btn-primary" id="btn-install-pwa">
            Install Aplikasi
          </button>
        </div>
      </div>
    `;
  },

  async loadProfileData() {
    const container = document.getElementById('profile-content-container');
    const heroTitle = document.getElementById('profile-page-title');
    const heroSubtitle = document.getElementById('profile-page-subtitle');
    if (!container) return;

    try {
      const profile = await ApiService.getProfile();
      const stats = await ApiService.getStats();
      this.profileData = profile;
      this.statsData = stats;

      const isOnline = navigator.onLine;
      const isLoggedIn = StorageService.isLoggedIn();

      // ==========================================
      // KONDISI 1: PENGGUNA BELUM LOGIN
      // ==========================================
      if (!isLoggedIn) {
        if (heroTitle) heroTitle.textContent = 'Profil Akun';
        if (heroSubtitle) heroSubtitle.textContent = 'Silakan masuk ke akun Anda untuk melihat profil e-commerce, pesanan, dan wishlist kamera.';

        container.innerHTML = `
          <!-- E-Commerce Auth Card -->
          <div class="auth-card card-glass animate-fade-in">
            <div class="auth-header">
              <div class="auth-icon-badge">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h2 style="font-size: 1.45rem; font-weight: 800; color: #0f172a; margin-bottom: 0.35rem;">Masuk ke Akun</h2>
              <p class="subtitle-small">Masuk untuk mengelola profil belanja, wishlist kamera favorit, dan pengiriman.</p>
            </div>

            <!-- Tabs: Masuk / Daftar -->
            <div class="auth-tabs">
              <button type="button" class="auth-tab-btn is-active" id="tab-auth-login">Masuk (Login)</button>
              <button type="button" class="auth-tab-btn" id="tab-auth-register">Daftar Akun</button>
            </div>

            <!-- Form Login -->
            <form id="form-auth-login" class="auth-form">
              <div class="form-group">
                <label for="login-email">Email / Username:</label>
                <input type="email" id="login-email" class="form-input" placeholder="contoh: yasmin@example.com" value="yasminhaniyyaa@gmail.com" required />
              </div>

              <div class="form-group">
                <label for="login-password">Kata Sandi:</label>
                <input type="password" id="login-password" class="form-input" placeholder="••••••••" value="password123" required />
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; margin: 0.2rem 0;">
                <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: var(--text-secondary);">
                  <input type="checkbox" checked /> Ingat Saya
                </label>
                <a href="javascript:void(0)" style="color: #0284c7; text-decoration: none; font-weight: 600;" onclick="alert('Kata sandi demo bebas atau gunakan password123')">Lupa Sandi?</a>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Masuk Sekarang
              </button>
            </form>

            <!-- Form Register -->
            <form id="form-auth-register" class="auth-form is-hidden">
              <div class="form-group">
                <label for="reg-name">Nama Lengkap:</label>
                <input type="text" id="reg-name" class="form-input" placeholder="Nama Anda" value="Yasmin Haniyya" required />
              </div>

              <div class="form-group">
                <label for="reg-email">Email:</label>
                <input type="email" id="reg-email" class="form-input" placeholder="email@example.com" value="yasminhaniyyaa@gmail.com" required />
              </div>

              <div class="form-group">
                <label for="reg-phone">Nomor Telepon / WhatsApp:</label>
                <input type="text" id="reg-phone" class="form-input" placeholder="+62 8..." value="+62 812-3456-7890" required />
              </div>

              <div class="form-group">
                <label for="reg-city">Kota Domisili:</label>
                <input type="text" id="reg-city" class="form-input" placeholder="Kota" value="Semarang, Jawa Tengah" required />
              </div>

              <div class="form-group">
                <label for="reg-password">Kata Sandi:</label>
                <input type="password" id="reg-password" class="form-input" placeholder="Minimal 6 karakter" value="password123" required />
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem;">
                Daftar & Masuk
              </button>
            </form>

            <!-- Quick Demo Login Button -->
            <div class="auth-quick-demo">
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.6rem;">Pilih mode login demo cepat:</p>
              <button type="button" id="btn-quick-demo-login" class="btn-demo-quick">
                ⚡ Masuk sebagai Member (Yasmin Haniyya)
              </button>
              <button type="button" id="btn-quick-admin-login" class="btn-demo-quick btn-demo-admin">
                🛡️ Masuk sebagai Admin (Kelola & Tambah Katalog)
              </button>
            </div>
          </div>

          ${this.renderAboutAndStatusSection(isOnline, stats)}
        `;

        this.bindAuthEvents(profile);
        return;
      }

      // ==========================================
      // KONDISI 2: PENGGUNA SUDAH LOGIN
      // ==========================================
      if (heroTitle) heroTitle.textContent = 'Profil';
      if (heroSubtitle) heroSubtitle.textContent = 'Informasi akun e-commerce, alamat pengiriman, dan preferensi belanja kamera Anda.';

      const authUser = StorageService.getAuthUser() || {};
      const customProfile = StorageService.getSavedProfile() || {};
      const isAdmin = StorageService.isAdmin();

      const user = {
        name: isAdmin ? (customProfile.name || authUser.name || 'Administrator RetroCam') : (customProfile.name || authUser.name || profile?.userInfo?.name || 'Yasmin Haniyya'),
        email: customProfile.email || authUser.email || (isAdmin ? 'admin@retrocam.id' : (profile?.userInfo?.email || 'yasminhaniyyaa@gmail.com')),
        phone: customProfile.phone || authUser.phone || (isAdmin ? '+62 811-9876-5432' : (profile?.userInfo?.phone || '+62 812-3456-7890')),
        city: customProfile.city || authUser.city || (isAdmin ? 'Semarang / Jakarta' : (profile?.userInfo?.city || 'Semarang, Jawa Tengah')),
        memberTier: isAdmin ? 'Administrator' : (customProfile.memberTier || authUser.memberTier || profile?.userInfo?.memberTier || 'Gold Member'),
        joinDate: customProfile.joinDate || authUser.joinDate || (isAdmin ? 'Sistem Katalog 2024' : (profile?.userInfo?.joinDate || 'Januari 2024')),
        bio: customProfile.bio || authUser.bio || (isAdmin ? 'Pengelola arsip katalog kamera digital dan lensa vintage RetroCam Archive.' : (profile?.userInfo?.bio || 'Pecinta fotografi kamera digital era CCD dan eksplorasi lensa manual vintage.')),
        avatarUrl: customProfile.avatarUrl || authUser.avatarUrl || (isAdmin ? '/images/app-logo.png' : (profile?.userInfo?.avatarUrl || profile?.academicInfo?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'))
      };

      this.currentAvatarData = user.avatarUrl;
      const favCamerasCount = StorageService.getFavoriteCameras().length;
      const favLensesCount = StorageService.getFavoriteLenses().length;
      const totalFavCount = favCamerasCount + favLensesCount;

      container.innerHTML = `
        <!-- E-Commerce User Profile Card -->
        <div class="profile-hero-card card-glass">
          <div class="profile-layout">
            <div class="profile-avatar-box">
              <div class="avatar-ring">
                <img 
                  src="${user.avatarUrl}" 
                  alt="Foto Profil" 
                  class="profile-avatar-img"
                  id="profile-avatar-display"
                  onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'"
                />
              </div>
            </div>

            <div class="profile-details">
              <div class="ecommerce-badge ${isAdmin ? 'admin-badge' : ''}">
                <span>${isAdmin ? '🛡️ Administrator' : `👑 ${user.memberTier}`}</span> • <span>${isAdmin ? 'Kelola Katalog' : 'Terverifikasi'}</span>
              </div>
              <h2 class="profile-name" id="display-user-name">${user.name}</h2>

              <div class="profile-meta-list">
                <div class="profile-meta-item">
                  <span class="meta-k">✉️ Email:</span>
                  <span class="meta-v" id="display-user-email">${user.email}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">📱 Nomor HP / WA:</span>
                  <strong class="meta-v" id="display-user-phone">${user.phone}</strong>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">📍 Kota Domisili:</span>
                  <span class="meta-v" id="display-user-city">${user.city}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">📅 Member Sejak:</span>
                  <span class="meta-v">${user.joinDate}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">💬 Minat / Catatan:</span>
                  <span class="meta-v" id="display-user-bio">${user.bio}</span>
                </div>
              </div>

              <div class="profile-action-btn-row" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                ${isAdmin ? `
                  <button type="button" class="btn btn-primary" id="btn-profile-add-camera" style="background: linear-gradient(135deg, #0284c7, #0369a1);">
                    ➕ Tambah Kamera Baru
                  </button>
                  <button type="button" class="btn btn-primary" id="btn-profile-add-lens" style="background: linear-gradient(135deg, #0284c7, #0369a1);">
                    ➕ Tambah Lensa Baru
                  </button>
                ` : ''}
                <button class="btn ${isAdmin ? 'btn-secondary' : 'btn-primary'}" id="btn-edit-student-profile">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Data Profil
                </button>
                <button class="btn btn-secondary" id="btn-logout-user" style="border-color: #ef4444; color: #ef4444;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Keluar / Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- E-Commerce / Admin Activity Summary -->
        <div class="ecommerce-dashboard-grid">
          ${isAdmin ? `
            <div class="ecommerce-dash-card" style="cursor: pointer;" onclick="window.openAddCameraModal && window.openAddCameraModal()">
              <div class="ecommerce-dash-icon">📸</div>
              <div>
                <div class="ecommerce-dash-title">Kelola Kamera</div>
                <div class="ecommerce-dash-value" style="color: #0284c7;">+ Tambah Kamera Baru</div>
              </div>
            </div>
            <div class="ecommerce-dash-card" style="cursor: pointer;" onclick="window.openAddLensModal && window.openAddLensModal()">
              <div class="ecommerce-dash-icon">🔍</div>
              <div>
                <div class="ecommerce-dash-title">Kelola Lensa</div>
                <div class="ecommerce-dash-value" style="color: #0284c7;">+ Tambah Lensa Baru</div>
              </div>
            </div>
            <a href="#favorites" class="ecommerce-dash-card">
              <div class="ecommerce-dash-icon">❤️</div>
              <div>
                <div class="ecommerce-dash-title">Wishlist Favorit</div>
                <div class="ecommerce-dash-value">${totalFavCount} Item Tersimpan</div>
              </div>
            </a>
            <div class="ecommerce-dash-card" onclick="alert('Role: Administrator RetroCam. Anda memiliki akses penuh menambah katalog kamera dan lensa.')">
              <div class="ecommerce-dash-icon">🛡️</div>
              <div>
                <div class="ecommerce-dash-title">Hak Akses Admin</div>
                <div class="ecommerce-dash-value" style="color: #10b981;">Akses Penuh Aktif</div>
              </div>
            </div>
          ` : `
            <a href="#favorites" class="ecommerce-dash-card">
              <div class="ecommerce-dash-icon">❤️</div>
              <div>
                <div class="ecommerce-dash-title">Wishlist Favorit</div>
                <div class="ecommerce-dash-value">${totalFavCount} Item Tersimpan</div>
              </div>
            </a>
            <div class="ecommerce-dash-card" onclick="alert('Pesanan Saya: 2 transaksi kamera sebelumnya berstatus selesai & telah diterima.')">
              <div class="ecommerce-dash-icon">🛒</div>
              <div>
                <div class="ecommerce-dash-title">Pesanan Saya</div>
                <div class="ecommerce-dash-value">2 Pesanan Selesai</div>
              </div>
            </div>
            <div class="ecommerce-dash-card" onclick="alert('Voucher Aktif: Diskon 10% untuk pembelian kamera retro dan gratis ongkir se-Jawa!')">
              <div class="ecommerce-dash-icon">🎟️</div>
              <div>
                <div class="ecommerce-dash-title">Voucher Diskon</div>
                <div class="ecommerce-dash-value">3 Kupon Aktif</div>
              </div>
            </div>
            <div class="ecommerce-dash-card" onclick="alert('Poin Loyalitas: Anda memiliki 1.250 Poin yang dapat ditukar voucher diskon.')">
              <div class="ecommerce-dash-icon">⭐</div>
              <div>
                <div class="ecommerce-dash-title">Poin Reward</div>
                <div class="ecommerce-dash-value">1.250 Poin</div>
              </div>
            </div>
          `}
        </div>

        <!-- Edit Profile Form Container -->
        <div id="profile-edit-box" class="card-glass edit-profile-box is-hidden animate-fade-in">
          <div class="edit-box-header">
            <h3>✏️ Edit Profil E-Commerce</h3>
            <p class="subtitle-small">Ubah foto profil, nama, nomor kontak, domisili, dan catatan Anda. Perubahan langsung aktif.</p>
          </div>

          <form id="form-edit-profile" class="edit-form-grid">
            <!-- Avatar Upload & Circular Sizing Section -->
            <div class="avatar-uploader-section col-span-full">
              <div class="avatar-preview-box">
                <img 
                  src="${user.avatarUrl}" 
                  id="edit-avatar-preview-img" 
                  alt="Pratinjau Avatar"
                  onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'"
                />
              </div>
              <div class="avatar-controls-box">
                <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">Foto Profil</label>
                <div class="avatar-file-btns">
                  <input type="file" id="input-edit-avatar-file" accept="image/*" class="hidden-file-input" />
                  <label for="input-edit-avatar-file" class="btn-file-label">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Pilih Foto Baru (Vertikal / Horizontal)
                  </label>
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-open-cropper-manual">
                    ✂️ Atur Ukuran Lingkaran
                  </button>
                </div>
                <input 
                  type="text" 
                  id="input-edit-avatar-url" 
                  class="form-input" 
                  placeholder="Atau masukkan URL foto (https://...)" 
                  value="${user.avatarUrl.startsWith('data:') ? '' : user.avatarUrl}"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="input-edit-name">Nama Lengkap:</label>
              <input type="text" id="input-edit-name" class="form-input" value="${user.name}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-email">Email:</label>
              <input type="email" id="input-edit-email" class="form-input" value="${user.email}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-phone">Nomor Telepon / WhatsApp:</label>
              <input type="text" id="input-edit-phone" class="form-input" value="${user.phone}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-city">Kota Domisili / Alamat:</label>
              <input type="text" id="input-edit-city" class="form-input" value="${user.city}" required />
            </div>

            <div class="form-group col-span-full">
              <label for="input-edit-bio">Minat Fotografi / Catatan Kolektor:</label>
              <input type="text" id="input-edit-bio" class="form-input" value="${user.bio}" />
            </div>

            <div class="form-action-row col-span-full">
              <button type="submit" class="btn btn-primary" id="btn-save-profile">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Simpan Perubahan
              </button>
              <button type="button" class="btn btn-secondary" id="btn-cancel-edit-profile">Batal</button>
              <button type="button" class="btn-danger-outline" id="btn-reset-default-profile">↺ Reset ke Bawaan</button>
            </div>
          </form>
        </div>

        ${this.renderAboutAndStatusSection(isOnline, stats)}
      `;

      this.bindProfileEvents(user);
      this.initCircularCropper();
    } catch (err) {
      console.error('Error rendering profile:', err);
      container.innerHTML = `<div class="error-state"><p>Gagal memuat profil: ${err.message}</p></div>`;
    }
  },

  // Event handler saat pengguna belum login
  bindAuthEvents(profile) {
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const formLogin = document.getElementById('form-auth-login');
    const formRegister = document.getElementById('form-auth-register');
    const quickDemoBtn = document.getElementById('btn-quick-demo-login');
    const quickAdminBtn = document.getElementById('btn-quick-admin-login');

    // Switch Tabs
    if (tabLogin && tabRegister && formLogin && formRegister) {
      tabLogin.onclick = () => {
        tabLogin.classList.add('is-active');
        tabRegister.classList.remove('is-active');
        formLogin.classList.remove('is-hidden');
        formRegister.classList.add('is-hidden');
      };

      tabRegister.onclick = () => {
        tabRegister.classList.add('is-active');
        tabLogin.classList.remove('is-active');
        formRegister.classList.remove('is-hidden');
        formLogin.classList.add('is-hidden');
      };
    }

    // Submit Login
    if (formLogin) {
      formLogin.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const isAdminEmail = email.toLowerCase().includes('admin');
        const demoUser = {
          name: isAdminEmail ? 'Administrator RetroCam' : (profile?.userInfo?.name || 'Yasmin Haniyya'),
          email: email || (isAdminEmail ? 'admin@retrocam.id' : 'yasminhaniyyaa@gmail.com'),
          role: isAdminEmail ? 'admin' : 'member',
          phone: profile?.userInfo?.phone || '+62 812-3456-7890',
          city: profile?.userInfo?.city || 'Semarang, Jawa Tengah',
          memberTier: isAdminEmail ? 'Administrator' : 'Gold Member',
          joinDate: 'Januari 2024',
          bio: isAdminEmail ? 'Pengelola arsip katalog kamera digital dan lensa vintage RetroCam Archive.' : (profile?.userInfo?.bio || 'Pecinta fotografi kamera digital era CCD dan eksplorasi lensa manual.'),
          avatarUrl: isAdminEmail ? '/images/app-logo.png' : (profile?.userInfo?.avatarUrl || profile?.academicInfo?.avatarUrl)
        };

        StorageService.login(demoUser);
        if (window.App && window.App.showToast) {
          window.App.showToast(`Selamat datang kembali, ${demoUser.name}!`);
        }
        this.loadProfileData();
      };
    }

    // Quick Demo Login Button (Member)
    if (quickDemoBtn) {
      quickDemoBtn.onclick = () => {
        const demoUser = {
          name: profile?.userInfo?.name || 'Yasmin Haniyya',
          email: 'yasminhaniyyaa@gmail.com',
          role: 'member',
          phone: profile?.userInfo?.phone || '+62 812-3456-7890',
          city: profile?.userInfo?.city || 'Semarang, Jawa Tengah',
          memberTier: 'Gold Member',
          joinDate: 'Januari 2024',
          bio: profile?.userInfo?.bio || 'Pecinta fotografi kamera digital era CCD dan eksplorasi lensa manual.',
          avatarUrl: profile?.userInfo?.avatarUrl || profile?.academicInfo?.avatarUrl
        };

        StorageService.login(demoUser);
        if (window.App && window.App.showToast) {
          window.App.showToast(`Login berhasil sebagai ${demoUser.name}!`);
        }
        this.loadProfileData();
      };
    }

    // Quick Demo Admin Login Button
    if (quickAdminBtn) {
      quickAdminBtn.onclick = () => {
        const adminUser = {
          name: 'Administrator RetroCam',
          email: 'admin@retrocam.id',
          role: 'admin',
          phone: '+62 811-9876-5432',
          city: 'Semarang, Jawa Tengah',
          memberTier: 'Administrator',
          joinDate: 'Sistem Katalog 2024',
          bio: 'Pengelola arsip katalog kamera digital dan lensa vintage RetroCam Archive.',
          avatarUrl: '/images/app-logo.png'
        };

        StorageService.login(adminUser);
        if (window.App && window.App.showToast) {
          window.App.showToast('Login berhasil sebagai Administrator! Akses kelola & tambah katalog aktif.');
        }
        this.loadProfileData();
      };
    }

    // Submit Register
    if (formRegister) {
      formRegister.onsubmit = (e) => {
        e.preventDefault();
        const newUser = {
          name: document.getElementById('reg-name').value.trim() || 'Yasmin Haniyya',
          email: document.getElementById('reg-email').value.trim() || 'yasminhaniyyaa@gmail.com',
          role: 'member',
          phone: document.getElementById('reg-phone').value.trim() || '+62 812-3456-7890',
          city: document.getElementById('reg-city').value.trim() || 'Semarang, Jawa Tengah',
          memberTier: 'Member Baru',
          joinDate: 'November 2024',
          bio: 'Pengguna baru aplikasi RetroCam Archive.',
          avatarUrl: profile?.userInfo?.avatarUrl || profile?.academicInfo?.avatarUrl
        };

        StorageService.login(newUser);
        if (window.App && window.App.showToast) {
          window.App.showToast(`Akun berhasil dibuat. Selamat datang, ${newUser.name}!`);
        }
        this.loadProfileData();
      };
    }

    // Install PWA Button
    const installBtn = document.getElementById('btn-install-pwa');
    if (installBtn) {
      installBtn.onclick = () => {
        if (window.deferredPWAInstallPrompt) {
          window.deferredPWAInstallPrompt.prompt();
          window.deferredPWAInstallPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              console.log('User accepted PWA installation');
            }
            window.deferredPWAInstallPrompt = null;
          });
        } else {
          alert('Fitur instalasi PWA: Buka menu browser Anda (ikon titik tiga di Chrome / ikon Bagikan di Safari iOS), lalu pilih "Tambahkan ke Layar Utama" (Add to Home screen / Install App).');
        }
      };
    }
  },

  // Event handler saat pengguna sudah login
  bindProfileEvents(currentUser) {
    const editBtn = document.getElementById('btn-edit-student-profile');
    const cancelBtn = document.getElementById('btn-cancel-edit-profile');
    const editBox = document.getElementById('profile-edit-box');
    const form = document.getElementById('form-edit-profile');
    const resetBtn = document.getElementById('btn-reset-default-profile');
    const logoutBtn = document.getElementById('btn-logout-user');
    const fileInput = document.getElementById('input-edit-avatar-file');
    const urlInput = document.getElementById('input-edit-avatar-url');
    const previewImg = document.getElementById('edit-avatar-preview-img');
    const btnOpenCropperManual = document.getElementById('btn-open-cropper-manual');
    const btnProfileAddCamera = document.getElementById('btn-profile-add-camera');
    const btnProfileAddLens = document.getElementById('btn-profile-add-lens');

    // Admin Action Buttons
    if (btnProfileAddCamera) {
      btnProfileAddCamera.onclick = () => {
        if (window.openAddCameraModal) window.openAddCameraModal();
      };
    }
    if (btnProfileAddLens) {
      btnProfileAddLens.onclick = () => {
        if (window.openAddLensModal) window.openAddLensModal();
      };
    }

    // Buka / Tutup Form Edit
    if (editBtn && editBox) {
      editBtn.onclick = () => {
        editBox.classList.remove('is-hidden');
        editBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    }

    if (cancelBtn && editBox) {
      cancelBtn.onclick = () => {
        editBox.classList.add('is-hidden');
      };
    }

    // Tombol Logout
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
          StorageService.logout();
          if (window.App && window.App.showToast) {
            window.App.showToast('Anda telah berhasil keluar dari akun.');
          }
          this.loadProfileData();
        }
      };
    }

    // Buka Pemotong Lingkaran dari foto file
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            this.openCircularCropper(img);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
    }

    // Tombol manual untuk membuka cropper dari foto yang sedang tampil
    if (btnOpenCropperManual) {
      btnOpenCropperManual.onclick = () => {
        const currentSrc = previewImg ? previewImg.src : this.currentAvatarData;
        if (!currentSrc) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this.openCircularCropper(img);
        };
        img.src = currentSrc;
      };
    }

    // URL Foto Input
    if (urlInput && previewImg) {
      urlInput.oninput = (e) => {
        const url = e.target.value.trim();
        if (url) {
          previewImg.src = url;
          this.currentAvatarData = url;
        }
      };
    }

    // Reset ke Bawaan
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Kembalikan seluruh data profil ke bawaan awal?')) {
          StorageService.clearSavedProfile();
          if (window.App && window.App.showToast) {
            window.App.showToast('Data profil dikembalikan ke pengaturan bawaan.');
          }
          this.loadProfileData();
        }
      };
    }

    // Form Submit
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();

        const updated = {
          name: document.getElementById('input-edit-name').value.trim(),
          email: document.getElementById('input-edit-email').value.trim(),
          phone: document.getElementById('input-edit-phone').value.trim(),
          city: document.getElementById('input-edit-city').value.trim(),
          bio: document.getElementById('input-edit-bio').value.trim(),
          memberTier: currentUser.memberTier || 'Gold Member',
          joinDate: currentUser.joinDate || 'Januari 2024',
          avatarUrl: this.currentAvatarData || currentUser.avatarUrl
        };

        // 1. Simpan di LocalStorage
        StorageService.saveCustomProfile(updated);
        StorageService.setAuthUser(updated);

        // 2. Sinkron ke Backend API jika online
        ApiService.updateProfile(updated).catch(err => {
          console.warn('API update notice (normal saat offline):', err);
        });

        // 3. Update DOM langsung
        const avatarDisplay = document.getElementById('profile-avatar-display');
        if (avatarDisplay) avatarDisplay.src = updated.avatarUrl;

        const nameEl = document.getElementById('display-user-name');
        if (nameEl) nameEl.textContent = updated.name;

        const emailEl = document.getElementById('display-user-email');
        if (emailEl) emailEl.textContent = updated.email || '-';

        const phoneEl = document.getElementById('display-user-phone');
        if (phoneEl) phoneEl.textContent = updated.phone || '-';

        const cityEl = document.getElementById('display-user-city');
        if (cityEl) cityEl.textContent = updated.city || '-';

        const bioEl = document.getElementById('display-user-bio');
        if (bioEl) bioEl.textContent = updated.bio || '-';

        // 4. Tutup form edit dan tampilkan toast
        editBox.classList.add('is-hidden');
        if (window.App && window.App.showToast) {
          window.App.showToast('Profil e-commerce berhasil diperbarui!');
        }
      };
    }

    // Install PWA Button
    const installBtn = document.getElementById('btn-install-pwa');
    if (installBtn) {
      installBtn.onclick = () => {
        if (window.deferredPWAInstallPrompt) {
          window.deferredPWAInstallPrompt.prompt();
          window.deferredPWAInstallPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              console.log('User accepted PWA installation');
            }
            window.deferredPWAInstallPrompt = null;
          });
        } else {
          alert('Fitur instalasi PWA: Buka menu browser Anda (ikon titik tiga di Chrome / ikon Bagikan di Safari iOS), lalu pilih "Tambahkan ke Layar Utama" (Add to Home screen / Install App).');
        }
      };
    }
  },

  // Inisialisasi Event Listener Modal Cropper Lingkaran (WA / IG style)
  initCircularCropper() {
    const modal = document.getElementById('avatar-crop-modal');
    const canvas = document.getElementById('avatar-crop-canvas');
    const slider = document.getElementById('crop-zoom-slider');
    const applyBtn = document.getElementById('btn-apply-crop');
    const cancelBtn = document.getElementById('btn-cancel-crop');
    const closeXBtn = document.getElementById('btn-close-crop-x');

    if (!canvas || !modal) return;

    const closeModal = () => {
      modal.classList.add('is-hidden');
    };

    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (closeXBtn) closeXBtn.onclick = closeModal;

    // Zoom Slider
    if (slider) {
      slider.oninput = (e) => {
        if (!this.cropperState.img) return;
        const newScale = parseFloat(e.target.value);
        const oldScale = this.cropperState.scale;
        const ratio = newScale / oldScale;

        // Pusatkan perbesaran di tengah lingkaran (140, 140)
        this.cropperState.posX = 140 - (140 - this.cropperState.posX) * ratio;
        this.cropperState.posY = 140 - (140 - this.cropperState.posY) * ratio;
        this.cropperState.scale = newScale;
        this.drawCropCanvas();
      };
    }

    // Pointer Dragging (Mouse & Touch)
    const onPointerDown = (e) => {
      if (!this.cropperState.img) return;
      this.cropperState.isDragging = true;
      this.cropperState.dragStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.cropperState.dragStartY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      this.cropperState.imgStartX = this.cropperState.posX;
      this.cropperState.imgStartY = this.cropperState.posY;
    };

    const onPointerMove = (e) => {
      if (!this.cropperState.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaX = clientX - this.cropperState.dragStartX;
      const deltaY = clientY - this.cropperState.dragStartY;

      this.cropperState.posX = this.cropperState.imgStartX + deltaX;
      this.cropperState.posY = this.cropperState.imgStartY + deltaY;
      this.drawCropCanvas();
    };

    const onPointerUp = () => {
      this.cropperState.isDragging = false;
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Terapkan hasil potongan lingkaran
    if (applyBtn) {
      applyBtn.onclick = () => {
        if (!this.cropperState.img) return;

        // Ekstraksi area lingkaran (diameter 240px) ke canvas offscreen resolusi tinggi 360x360
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 360;
        offCanvas.height = 360;
        const offCtx = offCanvas.getContext('2d');

        const { img, scale, posX, posY } = this.cropperState;
        const circleDiameter = 240;
        const circleRadius = circleDiameter / 2;
        const circleCenterX = 140;
        const circleCenterY = 140;

        // Hitung koordinat sumber pemotongan pada gambar asli
        const srcX = (circleCenterX - circleRadius - posX) / scale;
        const srcY = (circleCenterY - circleRadius - posY) / scale;
        const srcSize = circleDiameter / scale;

        // Gambar potongan ke canvas 360x360
        offCtx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, 360, 360);

        const croppedDataUrl = offCanvas.toDataURL('image/jpeg', 0.92);
        this.currentAvatarData = croppedDataUrl;

        // Update pratinjau thumbnail
        const previewImg = document.getElementById('edit-avatar-preview-img');
        if (previewImg) previewImg.src = croppedDataUrl;

        closeModal();

        if (window.App && window.App.showToast) {
          window.App.showToast('Foto profil disesuaikan! Klik "Simpan Perubahan" untuk menyimpan.');
        }
      };
    }
  },

  // Buka modal cropper dan hitung skala awal
  openCircularCropper(img) {
    this.cropperState.img = img;
    const modal = document.getElementById('avatar-crop-modal');
    const slider = document.getElementById('crop-zoom-slider');
    if (!modal) return;

    // Diameter lingkaran = 240px
    const circleDiameter = 240;

    // Skala minimum agar gambar menutupi seluruh diameter lingkaran (baik vertikal maupun horizontal)
    const minScale = Math.max(circleDiameter / img.width, circleDiameter / img.height);
    this.cropperState.minScale = minScale;
    this.cropperState.maxScale = minScale * 3.5;
    this.cropperState.scale = minScale;

    // Pusatkan posisi foto tepat di tengah kanvas 280x280
    this.cropperState.posX = 140 - (img.width * minScale) / 2;
    this.cropperState.posY = 140 - (img.height * minScale) / 2;

    if (slider) {
      slider.min = minScale.toFixed(3);
      slider.max = (minScale * 3.5).toFixed(3);
      slider.step = ((minScale * 2.5) / 100).toFixed(4);
      slider.value = minScale.toFixed(3);
    }

    modal.classList.remove('is-hidden');
    this.drawCropCanvas();
  },

  // Gambar foto + overlay masking lingkaran ala WA / IG
  drawCropCanvas() {
    const canvas = document.getElementById('avatar-crop-canvas');
    if (!canvas || !this.cropperState.img) return;
    const ctx = canvas.getContext('2d');

    const width = 280;
    const height = 280;
    const centerX = 140;
    const centerY = 140;
    const radius = 120; // diameter 240px

    const { img, scale, posX, posY } = this.cropperState;

    ctx.clearRect(0, 0, width, height);

    // 1. Gambar foto (vertikal / horizontal) dengan posisi dan skala saat ini
    ctx.drawImage(img, posX, posY, img.width * scale, img.height * scale);

    // 2. Gambar overlay transparan gelap di luar lingkaran (masking WA / IG)
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();

    // 3. Gambar garis lingkar penanda (Baby Blue highlight ring)
    ctx.save();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair titik tengah halus
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, centerY);
    ctx.lineTo(centerX + 8, centerY);
    ctx.moveTo(centerX, centerY - 8);
    ctx.lineTo(centerX, centerY + 8);
    ctx.stroke();

    ctx.restore();
  }
};

window.ProfileView = ProfileView;
