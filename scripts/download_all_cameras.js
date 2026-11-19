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

async function searchAndDownload(query, destPath) {
  try {
    const sUrl = 'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(query) + '&srnamespace=6&format=json';
    const sData = await fetchJson(sUrl);
    if (!sData.query || !sData.query.search || sData.query.search.length === 0) {
      console.warn('No search result for query:', query);
      return false;
    }

    // Try top 3 results until one downloads
    for (let i = 0; i < Math.min(3, sData.query.search.length); i++) {
      const fileTitle = sData.query.search[i].title;
      // Skip SVGs or PDFs
      if (fileTitle.toLowerCase().endsWith('.svg') || fileTitle.toLowerCase().endsWith('.pdf')) continue;

      const iUrl = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(fileTitle) + '&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json';
      const iData = await fetchJson(iUrl);
      const pages = iData.query.pages;
      const pageId = Object.keys(pages)[0];
      const info = pages[pageId].imageinfo ? pages[pageId].imageinfo[0] : null;
      if (!info) continue;

      const downloadUrl = info.thumburl || info.url;
      try {
        await downloadFile(downloadUrl, destPath);
        const stats = fs.statSync(destPath);
        if (stats.size > 2000) {
          console.log(`[OK] ${query} -> ${fileTitle} (${Math.round(stats.size / 1024)} KB)`);
          return true;
        }
      } catch (err) {
        // try next
      }
    }
    return false;
  } catch (e) {
    console.error(`[ERR] ${query}:`, e.message);
    return false;
  }
}

// Camera item list with targeted search queries
const cameras = [
  // KAMERA SAKU (19 items)
  { id: 'cam-saku-01', query: 'Ricoh GR III camera' },
  { id: 'cam-saku-02', query: 'Ricoh GR IIIx camera' },
  { id: 'cam-saku-03', query: 'Canon IXY Digital 650 OR PowerShot ELPH 360' },
  { id: 'cam-saku-04', query: 'Sony Cyber-shot DSC-WX500' },
  { id: 'cam-saku-05', query: 'Sony Cyber-shot DSC-W830' },
  { id: 'cam-saku-06', query: 'Sony Cyber-shot DSC-P200' },
  { id: 'cam-saku-07', query: 'Canon PowerShot SX740 HS' },
  { id: 'cam-saku-08', query: 'Canon IXUS 185 OR ELPH 180' },
  { id: 'cam-saku-09', query: 'Fujifilm FinePix F31fd' },
  { id: 'cam-saku-10', query: 'Fujifilm FinePix Z1' },
  { id: 'cam-saku-11', query: 'Olympus Tough TG-6' },
  { id: 'cam-saku-12', query: 'Olympus Tough TG-7' },
  { id: 'cam-saku-13', query: 'Panasonic Lumix DMC-TZ80 OR TZ85' },
  { id: 'cam-saku-14', query: 'Panasonic Lumix DMC-FX33' },
  { id: 'cam-saku-15', query: 'Kodak Pixpro FZ55' },
  { id: 'cam-saku-16', query: 'Kodak Pixpro WPZ2' },
  { id: 'cam-saku-17', query: 'Nikon Coolpix S7000' },
  { id: 'cam-saku-18', query: 'Pentax Optio S' },
  { id: 'cam-saku-19', query: 'Casio Exilim EX-ZR1000' },

  // KAMERA PROSUMER (19 items)
  { id: 'cam-pro-01', query: 'Sony Cyber-shot DSC-RX100 VII' },
  { id: 'cam-pro-02', query: 'Sony Cyber-shot DSC-RX100 V' },
  { id: 'cam-pro-03', query: 'Sony ZV-1 II camera' },
  { id: 'cam-pro-04', query: 'Canon PowerShot G7 X Mark III' },
  { id: 'cam-pro-05', query: 'Canon PowerShot G5 X Mark II' },
  { id: 'cam-pro-06', query: 'Canon PowerShot G1 X Mark III' },
  { id: 'cam-pro-07', query: 'Canon PowerShot G2 camera' },
  { id: 'cam-pro-08', query: 'Fujifilm X100V camera' },
  { id: 'cam-pro-09', query: 'Fujifilm X100VI camera' },
  { id: 'cam-pro-10', query: 'Panasonic Lumix DC-LX100 II' },
  { id: 'cam-pro-11', query: 'Panasonic Lumix DMC-FZ300' },
  { id: 'cam-pro-12', query: 'Nikon Coolpix P1000 camera' },
  { id: 'cam-pro-13', query: 'Nikon Coolpix P950 camera' },
  { id: 'cam-pro-14', query: 'Nikon Coolpix 995' },
  { id: 'cam-pro-15', query: 'Leica D-Lux 7' },
  { id: 'cam-pro-16', query: 'Leica Digilux 2' },
  { id: 'cam-pro-17', query: 'Sony Cyber-shot DSC-RX10 IV' },
  { id: 'cam-pro-18', query: 'Olympus Camedia C-7070 Wide Zoom' },
  { id: 'cam-pro-19', query: 'Kodak EasyShare DX6490' },

  // KAMERA HIBRIDA / MIRRORLESS (17 items)
  { id: 'cam-hib-01', query: 'Sony Alpha 7C II camera' },
  { id: 'cam-hib-02', query: 'Sony Alpha 6700 camera' },
  { id: 'cam-hib-03', query: 'Sony ZV-E10 camera' },
  { id: 'cam-hib-04', query: 'Sony Alpha 7 IV camera' },
  { id: 'cam-hib-05', query: 'Canon EOS R50 camera' },
  { id: 'cam-hib-06', query: 'Canon EOS R10 camera' },
  { id: 'cam-hib-07', query: 'Canon EOS R6 Mark II camera' },
  { id: 'cam-hib-08', query: 'Fujifilm X-T5 camera' },
  { id: 'cam-hib-09', query: 'Fujifilm X-T50 camera' },
  { id: 'cam-hib-10', query: 'Fujifilm X-S20 camera' },
  { id: 'cam-hib-11', query: 'Nikon Z f camera' },
  { id: 'cam-hib-12', query: 'Nikon Z fc camera' },
  { id: 'cam-hib-13', query: 'Nikon Z 50 camera' },
  { id: 'cam-hib-14', query: 'Panasonic Lumix S5 II' },
  { id: 'cam-hib-15', query: 'OM System OM-5' },
  { id: 'cam-hib-16', query: 'Olympus PEN E-P7' },
  { id: 'cam-hib-17', query: 'Epson R-D1' }
];

async function main() {
  console.log(`Starting download for ${cameras.length} camera photos...`);
  let successCount = 0;
  for (const cam of cameras) {
    const dest = path.join(targetDir, `${cam.id}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
      console.log(`[EXISTS] ${cam.id}`);
      successCount++;
      continue;
    }
    const ok = await searchAndDownload(cam.query, dest);
    if (ok) successCount++;
    // small sleep to be respectful to API
    await new Promise(r => setTimeout(r, 600));
  }
  console.log(`\nDone! Successfully downloaded: ${successCount} / ${cameras.length}`);
}

main();
