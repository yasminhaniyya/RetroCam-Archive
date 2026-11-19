/**
 * RetroCam Archive - Profile & About View
 * Halaman Profil Pengembang & Informasi Aplikasi (Dapat Diedit Sepenuhnya)
 */

const ProfileView = {
  profileData: null,
  statsData: null,
  currentAvatarData: null,

  async render() {
    return `
      <section class="page-container page-profile animate-fade-in">
        <!-- Hero Header -->
        <header class="section-hero">
          <h1 class="hero-title">Profil Pengembang & Tentang Aplikasi</h1>
          <p class="hero-subtitle">
            Informasi pengembang aplikasi RetroCam Archive dan status aplikasi Progressive Web Apps (PWA).
          </p>
        </header>

        <div id="profile-content-container">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat profil...</p>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    await this.loadProfileData();
  },

  async loadProfileData() {
    const container = document.getElementById('profile-content-container');
    if (!container) return;

    try {
      const profile = await ApiService.getProfile();
      const stats = await ApiService.getStats();
      this.profileData = profile;
      this.statsData = stats;

      // Check if custom saved profile exists in LocalStorage
      const customProfile = StorageService.getSavedProfile();
      const academic = {
        studentName: customProfile?.studentName || profile?.academicInfo?.studentName || 'Yasmin Haniyya',
        studentNim: customProfile?.studentNim || profile?.academicInfo?.studentNim || '21120121130000',
        classGroup: customProfile?.classGroup || profile?.academicInfo?.classGroup || 'Shift 1 / Kelompok XX',
        studyProgram: customProfile?.studyProgram || profile?.academicInfo?.studyProgram || 'Teknik Komputer / Informatika',
        faculty: customProfile?.faculty || profile?.academicInfo?.faculty || 'Fakultas Teknik',
        academicYear: customProfile?.academicYear || profile?.academicInfo?.academicYear || '2024 / 2025',
        email: customProfile?.email || profile?.academicInfo?.email || 'praktikan@example.edu',
        bio: customProfile?.bio || profile?.academicInfo?.bio || 'Praktikan pengembang aplikasi RetroCam Archive. Penggemar fotografi kamera digital era CCD dan eksplorasi lensa manual.',
        avatarUrl: customProfile?.avatarUrl || profile?.academicInfo?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      };

      this.currentAvatarData = academic.avatarUrl;
      const isOnline = navigator.onLine;

      container.innerHTML = `
        <!-- Student Profile Card -->
        <div class="profile-hero-card card-glass">
          <div class="profile-layout">
            <div class="profile-avatar-box">
              <div class="avatar-ring">
                <img 
                  src="${academic.avatarUrl}" 
                  alt="Foto Pengembang" 
                  class="profile-avatar-img"
                  id="profile-avatar-display"
                  onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'"
                />
              </div>
              <div class="avatar-badge-tag">Pengembang</div>
            </div>

            <div class="profile-details">
              <h2 class="profile-name" id="display-student-name">${academic.studentName}</h2>
              <p class="profile-bio-text" id="display-student-bio">${academic.bio}</p>

              <div class="profile-meta-list">
                <div class="profile-meta-item">
                  <span class="meta-k">NIM:</span>
                  <strong class="meta-v" id="display-student-nim">${academic.studentNim}</strong>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Program Studi:</span>
                  <span class="meta-v" id="display-student-program">${academic.studyProgram}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Fakultas / Kampus:</span>
                  <span class="meta-v" id="display-student-faculty">${academic.faculty}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Kelas / Kelompok:</span>
                  <span class="meta-v" id="display-student-group">${academic.classGroup}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Email / Kontak:</span>
                  <span class="meta-v" id="display-student-email">${academic.email}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Platform:</span>
                  <span class="meta-v">JavaScript & Progressive Web Apps (PWA)</span>
                </div>
              </div>

              <div class="profile-action-btn-row">
                <button class="btn btn-primary" id="btn-edit-student-profile">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Data Profil
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Modal / Form Container -->
        <div id="profile-edit-box" class="card-glass edit-profile-box is-hidden animate-fade-in">
          <div class="edit-box-header">
            <h3>✏️ Edit Profil Pengembang</h3>
            <p class="subtitle-small">Ubah foto profil, nama, NIM, dan rincian data akademik Anda. Perubahan langsung aktif.</p>
          </div>

          <form id="form-edit-profile" class="edit-form-grid">
            <!-- Avatar Upload & Preview Section -->
            <div class="avatar-uploader-section">
              <div class="avatar-preview-box">
                <img 
                  src="${academic.avatarUrl}" 
                  id="edit-avatar-preview-img" 
                  alt="Pratinjau Avatar"
                  onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'"
                />
              </div>
              <div class="avatar-controls-box">
                <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">Foto Profil Pengembang</label>
                <div class="avatar-file-btns">
                  <input type="file" id="input-edit-avatar-file" accept="image/*" class="hidden-file-input" />
                  <label for="input-edit-avatar-file" class="btn-file-label">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Pilih File Foto dari Perangkat
                  </label>
                </div>
                <input 
                  type="text" 
                  id="input-edit-avatar-url" 
                  class="form-input" 
                  placeholder="Atau masukkan URL foto (https://...)" 
                  value="${academic.avatarUrl.startsWith('data:') ? '' : academic.avatarUrl}"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="input-edit-name">Nama Lengkap:</label>
              <input type="text" id="input-edit-name" class="form-input" value="${academic.studentName}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-nim">NIM Mahasiswa:</label>
              <input type="text" id="input-edit-nim" class="form-input" value="${academic.studentNim}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-program">Program Studi:</label>
              <input type="text" id="input-edit-program" class="form-input" value="${academic.studyProgram}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-faculty">Fakultas / Kampus:</label>
              <input type="text" id="input-edit-faculty" class="form-input" value="${academic.faculty}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-group">Kelas / Kelompok / Shift:</label>
              <input type="text" id="input-edit-group" class="form-input" value="${academic.classGroup}" required />
            </div>

            <div class="form-group">
              <label for="input-edit-email">Email / Kontak:</label>
              <input type="email" id="input-edit-email" class="form-input" value="${academic.email || ''}" placeholder="nama@email.com" />
            </div>

            <div class="form-group col-span-full">
              <label for="input-edit-bio">Bio Singkat / Catatan Pengembang:</label>
              <textarea id="input-edit-bio" class="form-textarea" placeholder="Tuliskan catatan singkat profil Anda...">${academic.bio || ''}</textarea>
            </div>

            <div class="form-action-row">
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

        <!-- About RetroCam Archive Card -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Tentang RetroCam Archive</h3>
              <p class="subtitle-small">Platform katalog kamera digital era CCD dan lensa vintage</p>
            </div>
          </div>
          <div class="narrative-body">
            <p>
              RetroCam Archive adalah platform arsip katalog interaktif yang mengkurasi kamera digital klasik—khususnya era sensor CCD awal tahun 2000-an—dan lensa manual vintage. Dilengkapi dengan spesifikasi teknis mendalam, karakteristik warna filmis, panduan adaptor, serta kemampuan akses secara offline melalui teknologi Progressive Web Apps (PWA).
            </p>
          </div>
        </div>

        <!-- PWA Status & Installation Card -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Status Aplikasi & PWA</h3>
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

      this.bindProfileEvents(academic);

    } catch (err) {
      container.innerHTML = `
        <div class="error-state card-glass">
          <p>Gagal memuat profil: ${err.message}</p>
        </div>
      `;
    }
  },

  bindProfileEvents(currentAcademic) {
    const editBtn = document.getElementById('btn-edit-student-profile');
    const editBox = document.getElementById('profile-edit-box');
    const cancelBtn = document.getElementById('btn-cancel-edit-profile');
    const resetBtn = document.getElementById('btn-reset-default-profile');
    const form = document.getElementById('form-edit-profile');
    const fileInput = document.getElementById('input-edit-avatar-file');
    const urlInput = document.getElementById('input-edit-avatar-url');
    const previewImg = document.getElementById('edit-avatar-preview-img');

    // Toggle Edit Form
    if (editBtn && editBox) {
      editBtn.addEventListener('click', () => {
        editBox.classList.toggle('is-hidden');
        if (!editBox.classList.contains('is-hidden')) {
          editBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          document.getElementById('input-edit-name')?.focus();
        }
      });
    }

    if (cancelBtn && editBox) {
      cancelBtn.addEventListener('click', () => {
        editBox.classList.add('is-hidden');
      });
    }

    // Avatar File Upload Handling (Converts to Base64 data URL)
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file foto maksimal 5 MB.');
            return;
          }
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            this.currentAvatarData = loadEvent.target.result;
            if (previewImg) previewImg.src = this.currentAvatarData;
            if (urlInput) urlInput.value = '';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Avatar URL Input Handling
    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          this.currentAvatarData = val;
          if (previewImg) previewImg.src = val;
        }
      });
    }

    // Reset to Default Profile
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data profil ke bawaan awal?')) {
          StorageService.clearSavedProfile();
          if (window.App && window.App.showToast) {
            window.App.showToast('Data profil dikembalikan ke pengaturan bawaan.');
          }
          this.loadProfileData();
        }
      });
    }

    // Form Submit
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updated = {
          studentName: document.getElementById('input-edit-name').value.trim(),
          studentNim: document.getElementById('input-edit-nim').value.trim(),
          studyProgram: document.getElementById('input-edit-program').value.trim(),
          faculty: document.getElementById('input-edit-faculty').value.trim(),
          classGroup: document.getElementById('input-edit-group').value.trim(),
          email: document.getElementById('input-edit-email').value.trim(),
          bio: document.getElementById('input-edit-bio').value.trim(),
          avatarUrl: this.currentAvatarData || currentAcademic.avatarUrl
        };

        // 1. Save locally to LocalStorage
        StorageService.saveCustomProfile(updated);

        // 2. Synchronize to Backend Web Service API asynchronously
        ApiService.updateProfile(updated).catch(err => {
          console.warn('API update notice (normal when offline):', err);
        });

        // 3. Immediately update UI elements
        const avatarDisplay = document.getElementById('profile-avatar-display');
        if (avatarDisplay) avatarDisplay.src = updated.avatarUrl;

        const nameEl = document.getElementById('display-student-name');
        if (nameEl) nameEl.textContent = updated.studentName;

        const nimEl = document.getElementById('display-student-nim');
        if (nimEl) nimEl.textContent = updated.studentNim;

        const progEl = document.getElementById('display-student-program');
        if (progEl) progEl.textContent = updated.studyProgram;

        const facEl = document.getElementById('display-student-faculty');
        if (facEl) facEl.textContent = updated.faculty;

        const groupEl = document.getElementById('display-student-group');
        if (groupEl) groupEl.textContent = updated.classGroup;

        const emailEl = document.getElementById('display-student-email');
        if (emailEl) emailEl.textContent = updated.email || '-';

        const bioEl = document.getElementById('display-student-bio');
        if (bioEl) bioEl.textContent = updated.bio;

        // 4. Hide edit form and notify user
        editBox.classList.add('is-hidden');
        if (window.App && window.App.showToast) {
          window.App.showToast('Profil pengembang berhasil disimpan & diperbarui!');
        }
      });
    }

    // Install PWA Button
    const installBtn = document.getElementById('btn-install-pwa');
    if (installBtn) {
      installBtn.addEventListener('click', () => {
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
      });
    }
  }
};

window.ProfileView = ProfileView;
