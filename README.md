# RetroCam Archive: Katalog Kamera Digital & Lensa
> **Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (TA PPB)**  
> **Platform Pilihan:** Progressive Web Apps (PWA) & JavaScript  
> **Backend:** Custom REST Web Service API (Modul 1)

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange.svg?style=flat-square&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Node.js Express](https://img.shields.io/badge/Backend-Express.js%20REST%20API-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript%20ES6+-yellow.svg?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel%20Serverless-black.svg?style=flat-square&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 📌 1. Deskripsi Aplikasi
**RetroCam Archive** adalah aplikasi *Progressive Web Apps* (PWA) interaktif yang didedikasikan untuk mendokumentasikan kamera digital jadul (khususnya era sensor CCD awal tahun 2000-an yang legendaris) dan lensa manual vintage. 

Aplikasi ini dirancang dengan gaya visual modern-vintage dark industrial, dilengkapi navigasi *Bottom Navigation Bar* responsif, kemampuan berjalan 100% *offline* melalui *Service Worker*, penyimpanan koleksi favorit dengan *LocalStorage*, serta terintegrasi langsung dengan Web Service REST API mandiri yang dibuat sesuai silabus Modul 1.

---

## ✅ 2. Pemenuhan Ketentuan Tugas Akhir

| No | Ketentuan Tugas Akhir PPB | Status | Bukti Implementasi pada Proyek |
|---|---|:---:|---|
| **1** | Menggunakan API (Web Service) yang dibuat sendiri sesuai dengan Modul 1 | **TERPENUHI** | Backend REST API mandiri di `server.js` & `api/` dengan endpoint `/api/cameras`, `/api/lenses`, `/api/profile`, `/api/stats`, `/api/guides`. |
| **2** | Memiliki Bottom Navigation Bar | **TERPENUHI** | Tersedia `bottom-navigation-bar` fixed di bagian bawah layar dengan 5 navigasi utama (Kamera, Lensa, Koleksi, Panduan, Profil) beserta active indicator dan badge counter. |
| **3** | Memiliki minimal 5 halaman | **TERPENUHI** | Aplikasi memiliki **7 halaman** fungsional: <br>1. Katalog Kamera<br>2. Detail Kamera<br>3. Katalog Lensa<br>4. Detail Lensa<br>5. Koleksi Saya (Favorit)<br>6. Panduan & Tips Sensor<br>7. Profil Praktikan / About App |
| **4** | Minimal terdapat 2 halaman utama yang memiliki list dan setiap item dapat diklik untuk menampilkan halaman detail | **TERPENUHI** | **Halaman Utama 1 (Katalog Kamera):** List kamera dengan filter & search &rarr; klik item membuka Halaman Detail Kamera.<br>**Halaman Utama 2 (Katalog Lensa):** List lensa manual &rarr; klik item membuka Halaman Detail Lensa. |
| **5** | Memiliki 1 halaman Profile/About aplikasi | **TERPENUHI** | Halaman `#profile` menyajikan identitas praktikan (Nama, NIM, Kelas, Kelompok), deskripsi TA, status PWA, serta interactive live API tester. |
| **6** | Mengunggah source code Tugas Akhir ke GitHub | **TERPENUHI** | Repository terstruktur rapi, siap dipush ke GitHub dengan petunjuk git lengkap. |
| **7** | Judul TA tidak sama dengan praktikan lain | **TERPENUHI** | *"RetroCam Archive: Katalog Kamera Digital & Lensa"* |
| **Bonus PWA** | Deploy menggunakan Free Hosting | **TERPENUHI** | Dikonfigurasi dengan `vercel.json` siap deploy 1-klik di Vercel (Free Serverless & HTTPS) dan Netlify. |

---

## 🚀 3. Fitur Utama Aplikasi

1. **Katalog Kamera Digital Klasik (Halaman 1 & 2):**
   - Menampilkan 10+ kamera digital legendaris (Canon PowerShot G2, Fujifilm FinePix F31fd, Sony Cyber-shot DSC-P200, Leica Digilux 2, Epson R-D1, Olympus Camedia C-7070, dll).
   - Pencarian real-time berdasarkan nama, merek, dan sensor.
   - Filter chips merek (*Canon, Fujifilm, Sony, Olympus, Nikon, Leica, Ricoh, Pentax*).
   - Filter tipe sensor (*CCD, Super CCD, CMOS*).
   - **Halaman Detail:** Spesifikasi perangkat keras, sensor size, megapixels, lensa bawaan, ISO, baterai, slot memori, analisis tone warna CCD, kelebihan & kekurangan, serta tombol bookmark koleksi.

2. **Katalog Lensa Manual & Vintage (Halaman 3 & 4):**
   - Menampilkan 8+ lensa manual legendaris (Helios 44-2 58mm f/2 swirly bokeh, Asahi Pentax Super-Takumar 50mm f/1.4 thorium golden glow, Canon FD 50mm f/1.4 S.S.C., Carl Zeiss Jena Pancolar, Jupiter-9 85mm f/2 15-blade, Minolta MD Rokkor 45mm pancake, dll).
   - Filter dudukan mount (*M42, Canon FD, Nikon F, Olympus OM, Minolta MD*).
   - **Halaman Detail:** Formula optik, jumlah bilah diafragma, karakter bokeh, panduan adaptor mirrorless (Sony E, Fuji X, Canon RF, Nikon Z, M4/3), serta estimasi harga pasaran kolektor.

3. **Koleksi Saya / Favorit (Halaman 5):**
   - Menyimpan kamera dan lensa yang disukai pengguna secara offline menggunakan `LocalStorage`.
   - Filter tab: Semua, Kamera Saja, Lensa Saja.
   - Badge counter otomatis pada Bottom Navigation Bar.

4. **Panduan & Tips Fotografi Retro (Halaman 6):**
   - Artikel mendalam perbandingan teknis: *Sensor CCD vs CMOS*, *Panduan Memilih Adaptor Lensa Manual*, dan *Checklist Membeli Kamera Jadul Bekas di Pasar Loak*.
   - Fitur baca interaktif buka/tutup artikel.

5. **Halaman Profil Praktikan & About (Halaman 7):**
   - Data diri praktikan (Nama, NIM, Kelas, Kelompok).
   - Fitur **Edit Profil Praktikan**: memungkinkan pengubahan identitas langsung dari browser untuk kemudahan presentasi/demo praktikum.
   - Status PWA (*Online/Offline state, Service Worker status, Install App Button*).
   - **Live Web Service API Tester**: tombol interaktif untuk menguji respon JSON asli dari Web Service secara langsung.

6. **Kemampuan PWA (Progressive Web Apps):**
   - **Offline-First:** Dilengkapi Service Worker (`sw.js`) yang meng-cache antarmuka dan data API secara lokal (*stale-while-revalidate*).
   - **Add to Home Screen:** Memenuhi Web App Manifest (`manifest.json`) dengan icon multi-resolusi (192px, 512px, maskable) sehingga dapat di-install layaknya aplikasi native Android/Desktop.

---

## 📡 4. Dokumentasi Web Service REST API (Modul 1)

Web Service API mandiri dibangun dengan **Node.js & Express.js**.

### Base URL:
- Lokal: `http://localhost:3000/api`
- Vercel: `https://<nama-project-anda>.vercel.app/api`

### Daftar Endpoint:

| Method | Endpoint | Deskripsi | Query Parameters |
|---|---|---|---|
| `GET` | `/api` | Informasi root Web Service & daftar endpoint | - |
| `GET` | `/api/health` | Health-check status server | - |
| `GET` | `/api/cameras` | Mengambil seluruh katalog kamera digital | `?search=...`<br>`?brand=...`<br>`?sensor=...`<br>`?sort=year-desc` |
| `GET` | `/api/cameras/:id` | Mengambil detail spesifikasi kamera spesifik | - |
| `GET` | `/api/lenses` | Mengambil seluruh katalog lensa manual | `?search=...`<br>`?mount=...`<br>`?sort=year-desc` |
| `GET` | `/api/lenses/:id` | Mengambil detail optik lensa spesifik | - |
| `GET` | `/api/guides` | Mengambil daftar artikel panduan retro | `?id=...` |
| `GET` | `/api/profile` | Mengambil data profil pengembang & spesifikasi TA | - |
| `GET` | `/api/stats` | Mengambil statistik jumlah kamera, lensa, dan mount | - |

#### Contoh Respon JSON (`GET /api/cameras/cam-01`):
```json
{
  "status": "success",
  "data": {
    "id": "cam-01",
    "name": "Canon PowerShot G2",
    "brand": "Canon",
    "releaseYear": 2001,
    "sensorType": "CCD",
    "sensorSize": "1/1.8 inch (7.18 x 5.32 mm)",
    "megapixels": 4.0,
    "lens": "Canon 7.0 - 21.0mm f/2.0 - 2.5 (34 - 102mm equiv)",
    "estimatedPriceIdr": "Rp 850.000 - Rp 1.500.000",
    "colorProfile": "Warm skin tones, saturasi padat pada warna merah dan kuning...",
    "pros": ["Lensa bawaan sangat terang (f/2.0)", "Layar putar (swivel LCD)"],
    "cons": ["Autofokus lambat di kondisi minim cahaya"]
  }
}
```

---

## 🛠️ 5. Struktur Direktori Proyek

```text
TA PPB/
├── .gitignore               # Mengabaikan node_modules, file temporary, dsb
├── README.md                # Dokumentasi lengkap proyek tugas akhir
├── package.json             # Konfigurasi dependensi Node.js & script
├── server.js                # Server REST Web Service API (Express.js)
├── vercel.json              # Konfigurasi deploy serverless di Vercel free hosting
├── generate_icons.py        # Generator icon PWA multi-resolusi
├── api/                     # Serverless Function Handlers (untuk Vercel)
│   ├── index.js             # Entrypoint serverless
│   ├── cameras.js           # API handler kamera
│   ├── lenses.js            # API handler lensa
│   ├── guides.js            # API handler artikel
│   ├── profile.js           # API handler profil
│   └── stats.js             # API handler statistik arsip
├── data/                    # Database JSON Web Service
│   ├── cameras.json         # Data 10 kamera digital klasik
│   ├── lenses.json          # Data 8 lensa manual vintage
│   ├── guides.json          # Data artikel panduan CCD vs CMOS
│   └── profile.json         # Data profil akademis & tugas akhir
└── public/                  # Frontend Progressive Web Apps (PWA)
    ├── index.html           # HTML App Shell & Bottom Navigation Bar
    ├── manifest.json        # Web App Manifest PWA
    ├── sw.js                # Service Worker offline caching
    ├── favicon.ico          # Favicon browser
    ├── css/
    │   └── style.css        # Desain visual modern-vintage dark industrial
    ├── js/
    │   ├── app.js           # Main router & bottom nav controller
    │   ├── api.js           # API Client service
    │   ├── storage.js       # LocalStorage manager (Koleksi Favorit)
    │   ├── fallbackData.js  # Embedded backup data untuk offline fallback
    │   └── views/
    │       ├── camerasView.js      # Halaman 1: List Kamera
    │       ├── cameraDetailView.js # Halaman 2: Detail Kamera
    │       ├── lensesView.js       # Halaman 3: List Lensa
    │       ├── lensDetailView.js   # Halaman 4: Detail Lensa
    │       ├── favoritesView.js    # Halaman 5: Koleksi Favorit
    │       ├── guideView.js        # Halaman 6: Panduan & Tips
    │       └── profileView.js      # Halaman 7: Profile Mahasiswa / About
    └── icons/
        ├── icon-192.png     # PWA icon 192x192
        ├── icon-512.png     # PWA icon 512x512
        ├── icon-maskable.png# PWA maskable icon
        └── favicon.png      # Favicon PNG
```

---

## 💻 6. Panduan Menjalankan Secara Lokal

### Prasyarat:
- Komputer telah terpasang **Node.js** (versi 16 atau yang lebih baru).

### Langkah-langkah:
1. Buka terminal atau PowerShell di folder proyek ini:
   ```bash
   cd "C:\Users\Lenovo\Downloads\TA PPB"
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   npm start
   ```
   *Atau mode auto-reload saat pengembangan:*
   ```bash
   npm run dev
   ```
4. Buka browser di alamat:
   ```text
   http://localhost:3000
   ```
5. Akses endpoint API langsung:
   ```text
   http://localhost:3000/api/cameras
   http://localhost:3000/api/lenses
   http://localhost:3000/api/profile
   ```

---

## ☁️ 7. Panduan Deploy ke Free Hosting (Vercel)

Aplikasi ini telah dikonfigurasi secara khusus dengan file `vercel.json` sehingga backend Web Service dan antarmuka PWA dapat langsung berjalan otomatis dalam **satu domain gratis** dengan HTTPS aktif.

### Cara 1: Deploy Melalui GitHub (Paling Direkomendasikan)
1. **Push source code ke GitHub** (ikuti petunjuk pada Bagian 8 di bawah).
2. Buka situs [https://vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
3. Klik tombol **"Add New..."** &rarr; pilih **"Project"**.
4. Pilih repository GitHub proyek `RetroCam-Archive` Anda, lalu klik **"Import"**.
5. Pada pengaturan project:
   - Framework Preset: biarkan **Other**
   - Root Directory: biarkan `./` (default)
6. Klik tombol **"Deploy"**.
7. Tunggu sekitar 1 menit hingga proses selesai. Anda akan mendapatkan URL live gratis, misalnya:
   `https://retrocam-archive.vercel.app`
8. Salin URL tersebut untuk dicantumkan pada form pengumpulan Tugas Akhir!

### Cara 2: Deploy Cepat via Vercel CLI (Opsional)
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🐙 8. Panduan Mengunggah Source Code ke GitHub

1. Buka situs [https://github.com](https://github.com), login, dan klik **New Repository**.
2. Beri nama repository, misalnya: `RetroCam-Archive` atau `TA-PPB-RetroCam`.
3. Pilih visibilitas **Public**.
4. Jangan centang "Add a README file" (karena sudah ada di lokal). Klik **Create repository**.
5. Di terminal lokal pada folder proyek, jalankan perintah berikut:
   ```bash
   git init
   git add .
   git commit -m "feat: complete RetroCam Archive PWA & REST API Tugas Akhir PPB"
   git branch -M main
   git remote add origin https://github.com/<USERNAME-ANDA>/<NAMA-REPOSITORY>.git
   git push -u origin main
   ```
6. Salin link repository GitHub Anda untuk dicantumkan pada kolom pengumpulan Tugas Akhir.

---

## 📱 9. Cara Menginstal PWA di Smartphone Android / Desktop

1. Buka URL aplikasi yang telah di-deploy (atau `http://localhost:3000`) menggunakan **Google Chrome** di Android atau Komputer Desktop.
2. **Di Android:**
   - Pop-up *"Add RetroCam to Home screen"* akan muncul di bagian bawah, atau klik tombol **"Install App"** di header / halaman Profil.
   - Atau klik ikon titik tiga (⋮) di pojok kanan atas browser Chrome &rarr; pilih **"Install app"** / **"Tambahkan ke Layar Utama"**.
3. **Di Desktop (Chrome / Edge):**
   - Klik ikon instalasi monitor kecil di bilah URL samping bookmark &rarr; klik **"Install"**.
4. Aplikasi kini akan terbuka di jendela tersendiri tanpa address bar browser layaknya aplikasi bawaan sistem operasi dan tetap dapat dibuka saat offline!

---

## 👨‍🎓 10. Identitas Praktikan

- **Nama Praktikan:** Yasmin Haniyya
- **NIM:** 21120121130000 *(dapat disesuaikan)*
- **Mata Kuliah:** Praktikum Pemrograman Perangkat Bergerak (PPB)
- **Topik / Judul:** RetroCam Archive: Katalog Kamera Digital & Lensa
- **Platform:** JavaScript & Progressive Web Apps (PWA)

---
*RetroCam Archive © 2024 / 2025. Dibuat dengan dedikasi untuk pemenuhan Tugas Akhir Praktikum Pemrograman Perangkat Bergerak.*
