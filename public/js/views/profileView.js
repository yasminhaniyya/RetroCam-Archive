/**
 * RetroCam Archive - Profile & About View
 * Halaman Profil Pengembang & Informasi Aplikasi (Tanpa Checklist TA)
 */

const ProfileView = {
  profileData: null,
  statsData: null,

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
        studyProgram: customProfile?.studyProgram || profile?.academicInfo?.studyProgram || 'Teknik Komputer',
        faculty: profile?.academicInfo?.faculty || 'Fakultas Teknik',
        academicYear: profile?.academicInfo?.academicYear || '2024 / 2025'
      };

      const isOnline = navigator.onLine;

      container.innerHTML = `
        <!-- Student Profile Card -->
        <div class="profile-hero-card card-glass">
          <div class="profile-layout">
            <div class="profile-avatar-box">
              <div class="avatar-ring">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" 
                  alt="Foto Pengembang" 
                  class="profile-avatar-img"
                  id="profile-avatar-display"
                />
              </div>
              <div class="avatar-badge-tag">Pengembang</div>
            </div>

            <div class="profile-details">
              <h2 class="profile-name" id="display-student-name">${academic.studentName}</h2>
              <div class="profile-meta-list">
                <div class="profile-meta-item">
                  <span class="meta-k">NIM:</span>
                  <strong class="meta-v" id="display-student-nim">${academic.studentNim}</strong>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Program Studi:</span>
                  <span class="meta-v">${academic.studyProgram}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Kelas / Kelompok:</span>
                  <span class="meta-v" id="display-student-group">${academic.classGroup}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Platform:</span>
                  <span class="meta-v">JavaScript & Progressive Web Apps (PWA)</span>
                </div>
              </div>

              <div class="profile-action-btn-row">
                <button class="btn btn-sm btn-outline" id="btn-edit-student-profile">
                  Edit Data Profil
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Modal / Form Container -->
        <div id="profile-edit-box" class="card-glass edit-profile-box is-hidden">
          <div class="edit-box-header">
            <h3>Sesuaikan Data Profil</h3>
            <p class="subtitle-small">Data tersimpan di perangkat lokal untuk kemudahan demonstrasi.</p>
          </div>
          <form id="form-edit-profile" class="edit-form-grid">
            <div class="form-group">
              <label for="input-edit-name">Nama Lengkap:</label>
              <input type="text" id="input-edit-name" class="form-input" value="${academic.studentName}" required />
            </div>
            <div class="form-group">
              <label for="input-edit-nim">NIM Mahasiswa:</label>
              <input type="text" id="input-edit-nim" class="form-input" value="${academic.studentNim}" required />
            </div>
            <div class="form-group">
              <label for="input-edit-group">Kelas / Kelompok:</label>
              <input type="text" id="input-edit-group" class="form-input" value="${academic.classGroup}" required />
            </div>
            <div class="form-group">
              <label for="input-edit-program">Program Studi:</label>
              <input type="text" id="input-edit-program" class="form-input" value="${academic.studyProgram}" />
            </div>
            <div class="form-action-row">
              <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
              <button type="button" class="btn btn-secondary" id="btn-cancel-edit-profile">Batal</button>
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
              <span class="metric-value highlight-gold">${stats?.totalCameras || 10} Kamera</span>
            </div>

            <div class="status-metric-cell">
              <span class="metric-label">Lensa Terkatalog</span>
              <span class="metric-value highlight-gold">${stats?.totalLenses || 8} Lensa</span>
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
    const form = document.getElementById('form-edit-profile');

    if (editBtn && editBox) {
      editBtn.addEventListener('click', () => {
        editBox.classList.toggle('is-hidden');
        if (!editBox.classList.contains('is-hidden')) {
          document.getElementById('input-edit-name')?.focus();
        }
      });
    }

    if (cancelBtn && editBox) {
      cancelBtn.addEventListener('click', () => {
        editBox.classList.add('is-hidden');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updated = {
          studentName: document.getElementById('input-edit-name').value.trim(),
          studentNim: document.getElementById('input-edit-nim').value.trim(),
          classGroup: document.getElementById('input-edit-group').value.trim(),
          studyProgram: document.getElementById('input-edit-program').value.trim()
        };

        StorageService.saveCustomProfile(updated);

        document.getElementById('display-student-name').textContent = updated.studentName;
        document.getElementById('display-student-nim').textContent = updated.studentNim;
        document.getElementById('display-student-group').textContent = updated.classGroup;

        editBox.classList.add('is-hidden');
        if (window.App && window.App.showToast) {
          window.App.showToast('Data profil berhasil diperbarui.');
        }
      });
    }

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
