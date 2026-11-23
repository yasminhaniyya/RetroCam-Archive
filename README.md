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

## 1. Deskripsi Aplikasi
**RetroCam Archive** adalah aplikasi *Progressive Web Apps* (PWA) interaktif yang didedikasikan untuk mendokumentasikan kamera digital jadul (khususnya era sensor CCD awal tahun 2000-an yang legendaris) dan lensa manual vintage. 

Aplikasi ini dirancang dengan gaya visual modern-clean white beraksen baby blue elegan, dilengkapi navigasi *Bottom Navigation Bar* responsif, kemampuan berjalan 100% *offline* melalui *Service Worker*, penyimpanan koleksi favorit dengan *LocalStorage*, serta terintegrasi langsung dengan Web Service REST API mandiri yang dibuat sesuai silabus Modul 1.

---

## 2. Fitur Utama Aplikasi

1. **Katalog Kamera Digital Klasik & Modern (Halaman 1 & 2):**
   - Menampilkan **55 kamera digital** katalog & ranking Yodobashi Camera (19 Kamera Saku, 19 Kamera Prosumer, 17 Kamera Hibrida) dengan foto produk fisik otentik.
   - Pencarian real-time berdasarkan nama, seri, merek, atau kategori.
   - Kategori melingkar interaktif gaya Neokyo: Berdasarkan Jenis Kamera & Berdasarkan Merek (*Sony, Canon, Fujifilm, Nikon, Olympus, Panasonic, Ricoh, Leica, Kodak, Pentax, Casio*).
   - Format harga tunggal nominal tertinggi (bukan rentang).
   - **Halaman Detail:** Spesifikasi resolusi megapixels, tipe sensor CCD/CMOS, lensa, rentang ISO, analisis render warna, tabel spesifikasi teknis lengkap, dan bookmark favorit.

2. **Katalog Lensa Kamera Interchangeable (Halaman 3 & 4):**
   - Menampilkan **52 lensa interchangeable** terlaris Yodobashi Camera (18 Zoom Standar, 18 Prime / Fix, 16 Telephoto Zoom) dengan foto unit fisik akurat.
   - Kategori melingkar Neokyo: Berdasarkan Jenis Lensa & Berdasarkan Dudukan Mount (*Sony E-mount, Canon RF, Nikon Z, Fujifilm X, Micro Four Thirds, L-mount*).
   - Format harga tunggal nominal tertinggi.
   - **Halaman Detail:** Panjang fokal, aperture maksimum/minimum, bilah diafragma, formula optik, diameter filter ulir, jarak fokus minimum, bobot, ulasan keunggulan optik, dan panduan kompatibilitas bodi kamera mirrorless.

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


