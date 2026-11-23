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
            Informasi profil pengguna aplikasi.
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
      const isAdmin = StorageService.isAdmin();
      const customProfile = StorageService.getSavedProfile() || {};

      if (heroTitle) heroTitle.textContent = 'Profil';
      if (heroSubtitle) {
        heroSubtitle.textContent = 'Informasi profil pengguna aplikasi.';
      }

      const defaultAcademic = profile?.academicInfo || {};
      const user = {
        name: customProfile.name || defaultAcademic.studentName || 'Yasmin Haniyya',
        nim: customProfile.nim || defaultAcademic.studentNim || '21120121130000',
        studyProgram: customProfile.studyProgram || defaultAcademic.studyProgram || 'Teknik Komputer / Informatika',
        faculty: customProfile.faculty || defaultAcademic.faculty || 'Fakultas Teknik',
        email: customProfile.email || defaultAcademic.email || 'yasminhaniyyaa@gmail.com',
        avatarUrl: customProfile.avatarUrl || defaultAcademic.avatarUrl || (profile?.userInfo?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')
      };

      this.currentAvatarData = user.avatarUrl;

      container.innerHTML = `
        <!-- Profile Hero Card (Sesuai Screenshot Pengguna) -->
        <div class="profile-hero-card card-glass">
          <!-- Tombol Login Abu-Abu di Kanan Atas Tanpa Shape (Hover Ditunjuk) -->
          <button 
            type="button" 
            id="btn-profile-login-link" 
            class="text-login-link" 
            title="${isAdmin ? 'Klik untuk keluar dari mode administrator' : 'Klik untuk masuk sebagai admin'}"
          >
            ${isAdmin ? 'Mode Admin (Keluar)' : 'Login'}
          </button>

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
              <h2 class="profile-name" id="display-user-name">${user.name}</h2>

              <div class="profile-meta-list">
                <div class="profile-meta-item">
                  <span class="meta-k">NIM:</span>
                  <strong class="meta-v" id="display-user-nim">${user.nim}</strong>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Program Studi:</span>
                  <span class="meta-v" id="display-user-prodi">${user.studyProgram}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Fakultas / Kampus:</span>
                  <span class="meta-v" id="display-user-faculty">${user.faculty}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Email / Kontak:</span>
                  <span class="meta-v" id="display-user-email">${user.email}</span>
                </div>
              </div>

              <div class="profile-action-btn-row" style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
                <button type="button" class="btn btn-primary" id="btn-edit-student-profile" style="background: #0284c7; color: #fff; border: none; border-radius: 8px; padding: 0.55rem 1.1rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Data Profil
                </button>
                ${isAdmin ? `
                  <button type="button" class="btn btn-primary" id="btn-profile-add-camera" style="background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 8px; padding: 0.55rem 1rem; font-weight: 600;">
                    ➕ Tambah Kamera
                  </button>
                  <button type="button" class="btn btn-primary" id="btn-profile-add-lens" style="background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 8px; padding: 0.55rem 1rem; font-weight: 600;">
                    ➕ Tambah Lensa
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Form Container -->
        <div id="profile-edit-box" class="card-glass edit-profile-box is-hidden animate-fade-in">
          <div class="edit-box-header">
            <h3>✏️ Edit Data Profil</h3>
            <p class="subtitle-small">Ubah foto profil, nama, NIM, program studi, fakultas, atau kontak Anda. Perubahan langsung aktif.</p>
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
              <label for="input-edit-nim">NIM:</label>
              <input type="text" id="input-edit-nim" class="form-input" value="${user.nim}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-prodi">Program Studi:</label>
              <input type="text" id="input-edit-prodi" class="form-input" value="${user.studyProgram}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-faculty">Fakultas / Kampus:</label>
              <input type="text" id="input-edit-faculty" class="form-input" value="${user.faculty}" required />
            </div>

            <div class="form-group col-span-full">
              <label for="input-edit-email">Email / Kontak:</label>
              <input type="email" id="input-edit-email" class="form-input" value="${user.email}" required />
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

  // Event handler interaksi halaman profil
  bindProfileEvents(currentUser) {
    const editBtn = document.getElementById('btn-edit-student-profile');
    const cancelBtn = document.getElementById('btn-cancel-edit-profile');
    const editBox = document.getElementById('profile-edit-box');
    const form = document.getElementById('form-edit-profile');
    const resetBtn = document.getElementById('btn-reset-default-profile');
    const profileLoginLink = document.getElementById('btn-profile-login-link');
    const fileInput = document.getElementById('input-edit-avatar-file');
    const urlInput = document.getElementById('input-edit-avatar-url');
    const previewImg = document.getElementById('edit-avatar-preview-img');
    const btnOpenCropperManual = document.getElementById('btn-open-cropper-manual');
    const btnProfileAddCamera = document.getElementById('btn-profile-add-camera');
    const btnProfileAddLens = document.getElementById('btn-profile-add-lens');
    const installBtn = document.getElementById('btn-install-pwa');

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

    // Tombol Login / Keluar Admin di Kanan Atas
    if (profileLoginLink) {
      profileLoginLink.onclick = () => {
        if (StorageService.isAdmin()) {
          StorageService.logout();
          if (window.App && window.App.showToast) {
            window.App.showToast('Keluar dari Mode Administrator.');
          }
          this.loadProfileData();
          if (window.location.hash.startsWith('#camera') && window.CamerasView && window.CamerasView.loadCamerasData) {
            window.CamerasView.loadCamerasData();
          }
          if (window.location.hash.startsWith('#lens') && window.LensesView && window.LensesView.loadLensesData) {
            window.LensesView.loadLensesData();
          }
        } else {
          if (window.openAdminLoginModal) window.openAdminLoginModal();
        }
      };
    }

    // Install PWA Button
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
          nim: document.getElementById('input-edit-nim').value.trim(),
          studyProgram: document.getElementById('input-edit-prodi').value.trim(),
          faculty: document.getElementById('input-edit-faculty').value.trim(),
          email: document.getElementById('input-edit-email').value.trim(),
          avatarUrl: this.currentAvatarData || currentUser.avatarUrl
        };

        // 1. Simpan di LocalStorage
        StorageService.saveCustomProfile(updated);

        // 2. Sinkron ke Backend API jika online
        ApiService.updateProfile({ academicInfo: updated }).catch(err => {
          console.warn('API update notice (normal saat offline):', err);
        });

        // 3. Update DOM langsung
        const avatarDisplay = document.getElementById('profile-avatar-display');
        if (avatarDisplay) avatarDisplay.src = updated.avatarUrl;

        const nameEl = document.getElementById('display-user-name');
        if (nameEl) nameEl.textContent = updated.name;

        const nimEl = document.getElementById('display-user-nim');
        if (nimEl) nimEl.textContent = updated.nim || '-';

        const prodiEl = document.getElementById('display-user-prodi');
        if (prodiEl) prodiEl.textContent = updated.studyProgram || '-';

        const facultyEl = document.getElementById('display-user-faculty');
        if (facultyEl) facultyEl.textContent = updated.faculty || '-';

        const emailEl = document.getElementById('display-user-email');
        if (emailEl) emailEl.textContent = updated.email || '-';

        // 4. Tutup form edit dan tampilkan toast
        editBox.classList.add('is-hidden');
        if (window.App && window.App.showToast) {
          window.App.showToast('Data profil berhasil diperbarui!');
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
