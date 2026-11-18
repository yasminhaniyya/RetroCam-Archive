/**
 * RetroCam Archive - Profile & About View (Halaman 7)
 * Memenuhi Ketentuan 5: Memiliki 1 halaman Profile/About aplikasi
 */

const ProfileView = {
  profileData: null,
  statsData: null,

  async render() {
    return `
      <section class="page-container page-profile animate-fade-in">
        <!-- Hero Header -->
        <header class="section-hero">
          <div class="hero-badge badge-gold"><span class="badge-dot"></span> Identitas Praktikan & Tugas Akhir</div>
          <h1 class="hero-title">Profil Pengembang & Tentang Aplikasi</h1>
          <p class="hero-subtitle">
            Halaman profil akademis praktikan, spesifikasi arsitektur Progressive Web Apps (PWA), status service worker offline, serta dokumentasi REST Web Service Modul 1.
          </p>
        </header>

        <div id="profile-content-container">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat profil pengembang dan status aplikasi...</p>
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
        studentName: customProfile?.studentName || profile?.academicInfo?.studentName || 'Praktikan PPB',
        studentNim: customProfile?.studentNim || profile?.academicInfo?.studentNim || '2112012XXXXXXX',
        classGroup: customProfile?.classGroup || profile?.academicInfo?.classGroup || 'Shift 1 / Kelompok XX',
        studyProgram: customProfile?.studyProgram || profile?.academicInfo?.studyProgram || 'Teknik Komputer / Informatika',
        faculty: profile?.academicInfo?.faculty || 'Fakultas Teknik',
        academicYear: profile?.academicInfo?.academicYear || '2024 / 2025'
      };

      const isOnline = navigator.onLine;
      const swActive = 'serviceWorker' in navigator && navigator.serviceWorker.controller;

      container.innerHTML = `
        <!-- Student Profile Card -->
        <div class="profile-hero-card card-glass">
          <div class="profile-layout">
            <div class="profile-avatar-box">
              <div class="avatar-ring">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" 
                  alt="Foto Praktikan" 
                  class="profile-avatar-img"
                  id="profile-avatar-display"
                />
              </div>
              <div class="avatar-badge-tag">Praktikan PPB</div>
            </div>

            <div class="profile-details">
              <div class="profile-tagline">TUGAS AKHIR PEMROGRAMAN PERANGKAT BERGERAK</div>
              <h2 class="profile-name" id="display-student-name">${academic.studentName}</h2>
              <div class="profile-meta-list">
                <div class="profile-meta-item">
                  <span class="meta-k">NIM:</span>
                  <strong class="meta-v highlight-gold" id="display-student-nim">${academic.studentNim}</strong>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Kelas / Kelompok:</span>
                  <span class="meta-v" id="display-student-group">${academic.classGroup}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Program Studi:</span>
                  <span class="meta-v">${academic.studyProgram}</span>
                </div>
                <div class="profile-meta-item">
                  <span class="meta-k">Materi Pilihan:</span>
                  <span class="meta-v"><span class="badge-accent">Progressive Web Apps (PWA) + JavaScript</span></span>
                </div>
              </div>

              <div class="profile-action-btn-row">
                <button class="btn btn-sm btn-outline" id="btn-edit-student-profile">
                  ✏️ Edit Data Praktikan
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Modal / Form Container -->
        <div id="profile-edit-box" class="card-glass edit-profile-box is-hidden">
          <div class="edit-box-header">
            <h3>✏️ Sesuaikan Identitas Praktikan</h3>
            <p class="subtitle-small">Data ini disimpan di browser Anda (LocalStorage) agar sesuai saat demo praktikum.</p>
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

        <!-- PWA Status & Installation Card -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div class="info-icon">⚡</div>
            <div>
              <h3>Status Progressive Web App (PWA)</h3>
              <p class="subtitle-small">Kemampuan offline, service worker, dan instalasi native</p>
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
              <span class="metric-label">Service Worker</span>
              <span class="metric-value ${swActive ? 'text-success' : 'text-info'}">
                ${swActive ? '✓ Aktif & Mengontrol Cache' : 'Terdaftar (Standby)'}
              </span>
            </div>

            <div class="status-metric-cell">
              <span class="metric-label">Arsip Kamera Terkatalog</span>
              <span class="metric-value highlight-gold">${stats?.totalCameras || 10} Kamera</span>
            </div>

            <div class="status-metric-cell">
              <span class="metric-label">Lensa Manual Terkatalog</span>
              <span class="metric-value highlight-gold">${stats?.totalLenses || 8} Lensa</span>
            </div>
          </div>

          <div class="pwa-install-banner mt-3" id="pwa-install-banner">
            <div class="install-info">
              <h4>📲 Pasang Aplikasi di Perangkat</h4>
              <p>Aplikasi ini memenuhi standar PWA dan dapat diinstal ke layar utama (Home Screen) smartphone Android atau komputer desktop Anda.</p>
            </div>
            <button class="btn btn-primary" id="btn-install-pwa">
              Install RetroCam App
            </button>
          </div>
        </div>

        <!-- About RetroCam Archive -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div>
              <h3>Tentang RetroCam Archive</h3>
              <p class="subtitle-small">Proyek kurasi kamera digital klasik era CCD dan lensa vintage</p>
            </div>
          </div>
          <div class="narrative-body">
            <p>
              RetroCam Archive adalah platform arsip interaktif yang mengkurasi kamera digital klasik—khususnya era sensor CCD awal tahun 2000-an—dan lensa manual legendaris. Dilengkapi spesifikasi teknis mendalam, karakter optik, panduan adaptor, dan kemampuan akses offline berbasis Progressive Web Apps (PWA).
            </p>
          </div>
        </div>

        <!-- Live Web Service API Tester (Untuk Kemudahan Demo Praktikum) -->
        <div class="info-card card-glass">
          <div class="info-card-header">
            <div class="info-icon">🧪</div>
            <div>
              <h3>Uji Langsung API REST Web Service (Modul 1)</h3>
              <p class="subtitle-small">Klik endpoint di bawah untuk melihat respon JSON langsung dari backend</p>
            </div>
          </div>

          <div class="api-test-buttons-row">
            <button class="btn btn-sm btn-outline api-test-btn" data-url="/api/cameras">GET /api/cameras</button>
            <button class="btn btn-sm btn-outline api-test-btn" data-url="/api/cameras/cam-01">GET /api/cameras/cam-01</button>
            <button class="btn btn-sm btn-outline api-test-btn" data-url="/api/lenses">GET /api/lenses</button>
            <button class="btn btn-sm btn-outline api-test-btn" data-url="/api/lenses/lens-01">GET /api/lenses/lens-01</button>
            <button class="btn btn-sm btn-outline api-test-btn" data-url="/api/profile">GET /api/profile</button>
            <button class="btn btn-sm btn-outline api-test-btn" data-url="/api/stats">GET /api/stats</button>
          </div>

          <div class="api-viewer-box mt-3">
            <div class="api-viewer-header">
              <span id="api-viewer-url">Endpoint: /api/stats</span>
              <span class="badge-status-ok" id="api-viewer-status">Status 200 OK</span>
            </div>
            <pre class="api-json-code" id="api-json-output">Klik salah satu tombol endpoint di atas untuk menguji respon API secara live...</pre>
          </div>
        </div>
      `;

      this.bindProfileEvents(academic);

      // Pre-load stats on the API tester box
      const initialEndpointBtn = container.querySelector('.api-test-btn[data-url="/api/stats"]');
      if (initialEndpointBtn) {
        initialEndpointBtn.click();
      }

    } catch (err) {
      container.innerHTML = `
        <div class="error-state card-glass">
          <p>Gagal memuat informasi profil: ${err.message}</p>
        </div>
      `;
    }
  },

  bindProfileEvents(currentAcademic) {
    // Edit Profile Modal
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

        // Update displays in DOM
        document.getElementById('display-student-name').textContent = updated.studentName;
        document.getElementById('display-student-nim').textContent = updated.studentNim;
        document.getElementById('display-student-group').textContent = updated.classGroup;

        editBox.classList.add('is-hidden');
        if (window.App && window.App.showToast) {
          window.App.showToast('✓ Profil praktikan berhasil diperbarui!');
        }
      });
    }

    // PWA Install Button
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
          alert('Fitur instalasi PWA: Buka menu browser Anda (ikon titik tiga di Chrome Android / ikon Bagikan di Safari iOS), lalu pilih "Tambahkan ke Layar Utama" (Add to Home screen / Install App).');
        }
      });
    }

    // API Tester Buttons
    const apiBtns = document.querySelectorAll('.api-test-btn');
    const jsonOutput = document.getElementById('api-json-output');
    const urlDisplay = document.getElementById('api-viewer-url');
    const statusDisplay = document.getElementById('api-viewer-status');

    apiBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        apiBtns.forEach(b => b.classList.remove('btn-primary'));
        apiBtns.forEach(b => b.classList.add('btn-outline'));
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');

        const url = btn.getAttribute('data-url');
        if (urlDisplay) urlDisplay.textContent = `GET ${url}`;
        if (statusDisplay) {
          statusDisplay.textContent = 'Mengambil...';
          statusDisplay.className = 'badge-status-loading';
        }
        if (jsonOutput) jsonOutput.textContent = 'Memuat data dari Web Service...';

        try {
          const res = await fetch(url);
          const data = await res.json();
          if (statusDisplay) {
            statusDisplay.textContent = `Status ${res.status} OK`;
            statusDisplay.className = 'badge-status-ok';
          }
          if (jsonOutput) {
            jsonOutput.textContent = JSON.stringify(data, null, 2);
          }
        } catch (e) {
          if (statusDisplay) {
            statusDisplay.textContent = 'Error Fetch';
            statusDisplay.className = 'badge-status-err';
          }
          if (jsonOutput) {
            jsonOutput.textContent = `Error connecting to ${url}: ${e.message}`;
          }
        }
      });
    });
  }
};

window.ProfileView = ProfileView;
