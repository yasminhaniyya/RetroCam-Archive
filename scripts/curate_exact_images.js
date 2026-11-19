const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'cameras');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'RetroCamArchiveApp/1.0 (academic practical project; student@example.edu)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'RetroCamArchiveApp/1.0 (academic practical project; student@example.edu)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode + ' for ' + url));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => resolve(dest));
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadByExactTitle(fileTitle, destPath) {
  const iUrl = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(fileTitle) + '&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json';
  const data = await fetchJson(iUrl);
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  const info = pages[pageId].imageinfo ? pages[pageId].imageinfo[0] : null;
  if (!info) throw new Error('No imageinfo for ' + fileTitle);
  const downloadUrl = info.thumburl || info.url;
  await downloadFile(downloadUrl, destPath);
  const size = fs.statSync(destPath).size;
  console.log(`[OK] ${path.basename(destPath)} <- ${fileTitle} (${Math.round(size/1024)} KB)`);
}

// Map of exact files to fix or replace
const exactReplacements = [
  // Saku fixes
  { id: 'cam-saku-03', title: 'File:Canon PowerShot ELPH 100 HS.JPG' }, // Canon IXY 650 / ELPH
  { id: 'cam-saku-04', title: 'File:Sony Cyber-shot DSC-WX800 - 3.jpg' }, // Sony WX series
  { id: 'cam-saku-10', title: 'File:FujiFilm FinePix Z33WP.JPG' }, // Fuji FinePix Z
  { id: 'cam-saku-13', title: 'File:Panasonic Lumix TZ 61 - 0754.jpg' }, // Lumix TZ
  { id: 'cam-saku-15', title: 'File:Kodak EasyShare C1013 (Photo).jpg' }, // Kodak compact
  { id: 'cam-saku-16', title: 'File:Kodak EasyShare CX7300.jpg' }, // Kodak compact
  { id: 'cam-saku-18', title: 'File:Pentax Optio S30.jpg' }, // Pentax Optio S
  { id: 'cam-saku-19', title: 'File:CASIO EXILIM EX-Z60.jpg' }, // Casio Exilim

  // Prosumer fixes
  { id: 'cam-pro-03', title: 'File:Sony ZV-1 (50009804078).jpg' }, // Sony ZV-1 (fixed from .tiff)
  { id: 'cam-pro-07', title: 'File:Canon PowerShot G2.jpg' }, // Canon G2
  { id: 'cam-pro-13', title: 'File:Nikon COOLPIX P900-4 (24403817010).jpg' }, // Nikon P950/P900 superzoom
  { id: 'cam-pro-15', title: 'File:Leica D-Lux 6.jpg' }, // Leica D-Lux
  { id: 'cam-pro-17', title: 'File:Sony Cyber-shot DSC-RX10.jpg' }, // Sony RX10 bridge
  { id: 'cam-pro-18', title: 'File:Olympus CAMEDIA C-8080.JPG' }, // Olympus Camedia C-8080 / C-7070 flagship

  // Hibrida fixes
  { id: 'cam-hib-03', title: 'File:Sony ZV-E10 with Sony E 16-50mm F3.5-5.6 OSS PZ - by Henry Söderlund (51375243603).jpg' }, // Sony ZV-E10 (fixed from .tiff)
  { id: 'cam-hib-06', title: 'File:Canon EOS R10 22 nov 2022a.jpg' }, // Canon EOS R10 (fixed from .tif)
  { id: 'cam-hib-11', title: 'File:Nikon Z f 8 nov 2023a.jpg' }, // Nikon Z f
  { id: 'cam-hib-13', title: 'File:Nikon Z 50 0.jpg' }, // Nikon Z 50
  { id: 'cam-hib-15', title: 'File:Olympus OM-D E-M5 Mk II front.jpg' } // OM-D / OM-5
];

async function run() {
  console.log('Downloading exact authentic replacements...');
  for (const item of exactReplacements) {
    const dest = path.join(targetDir, `${item.id}.jpg`);
    try {
      await downloadByExactTitle(item.title, dest);
    } catch (err) {
      console.error(`Failed ${item.id}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 400));
  }
  console.log('Replacements completed!');
}

run();
