/**
 * RetroCam Archive - Guides & Tips View (Halaman 6)
 * Halaman edukasi perbandingan sensor CCD vs CMOS & tips berburu kamera vintage
 */

const GuideView = {
  guides: [],

  async render() {
    return `
      <section class="page-container page-guides animate-fade-in">
        <!-- Hero Header -->
        <header class="section-hero">
          <div class="hero-badge badge-teal"><span class="badge-dot"></span> Edukasi Fotografi</div>
          <h1 class="hero-title">Panduan & Tips Fotografi Retro</h1>
          <p class="hero-subtitle">
            Pelajari rahasia teknis di balik karakter sensor CCD, tips memilih adaptor lensa manual vintage, serta checklist inspeksi sebelum membeli kamera jadul bekas.
          </p>
        </header>

        <!-- Guides List -->
        <div id="guides-list-container" class="guides-container">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat artikel panduan dari Web Service API...</p>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    await this.loadGuides();
  },

  async loadGuides() {
    const container = document.getElementById('guides-list-container');
    if (!container) return;

    try {
      const guides = await ApiService.getGuides();
      this.guides = guides;

      if (!guides || guides.length === 0) {
        container.innerHTML = `
          <div class="empty-state card-glass">
            <p>Panduan belum tersedia atau offline.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = guides.map((guide, idx) => {
        return `
          <article class="guide-card card-glass" id="guide-${guide.id}">
            <div class="guide-header-row">
              <div class="guide-meta-badge-group">
                <span class="badge-accent badge-teal">${guide.category}</span>
                <span class="badge-time">⏱️ ${guide.readingTime}</span>
              </div>
              <h2 class="guide-title">${guide.title}</h2>
              <p class="guide-summary">${guide.summary}</p>
            </div>

            <div class="guide-cover-wrapper">
              <img 
                src="${guide.coverUrl}" 
                alt="${guide.title}" 
                class="guide-cover-img" 
                loading="lazy"
                decoding="async"
                onload="this.classList.add('is-loaded')"
                onerror="this.src='/icons/icon-512.png'; this.classList.add('is-loaded')"
              />
            </div>

            <div class="guide-content-body" id="body-${guide.id}">
              ${guide.content.map(paragraph => {
                // Parse markdown bold and newlines simply
                let html = paragraph
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>');
                return `<p class="guide-p">${html}</p>`;
              }).join('')}
            </div>

            <div class="guide-footer">
              <button class="btn btn-sm btn-outline btn-toggle-read" data-target="body-${guide.id}">
                Sembunyikan / Buka Artikel
              </button>
            </div>
          </article>
        `;
      }).join('');

      // Bind toggle reading button
      container.querySelectorAll('.btn-toggle-read').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-target');
          const body = document.getElementById(targetId);
          if (body) {
            body.classList.toggle('is-collapsed');
            btn.textContent = body.classList.contains('is-collapsed') ? 'Baca Selengkapnya...' : 'Tutup Artikel';
          }
        });
      });

    } catch (err) {
      container.innerHTML = `
        <div class="error-state card-glass">
          <p>Gagal memuat artikel: ${err.message}</p>
        </div>
      `;
    }
  }
};

window.GuideView = GuideView;
