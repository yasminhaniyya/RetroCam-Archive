const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'lenses');
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

    for (let i = 0; i < Math.min(5, sData.query.search.length); i++) {
      const fileTitle = sData.query.search[i].title;
      const lower = fileTitle.toLowerCase();
      if (lower.endsWith('.svg') || lower.endsWith('.pdf') || lower.endsWith('.tif') || lower.endsWith('.tiff')) continue;

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

const lenses = [
  // ZOOM STANDAR (18 items)
  { id: 'lens-zoom-01', query: 'Sony FE 24-70mm F2.8 GM' },
  { id: 'lens-zoom-02', query: 'Tamron 28-75mm F2.8 Di III RXD' },
  { id: 'lens-zoom-03', query: 'Sigma 28-70mm F2.8 DG DN' },
  { id: 'lens-zoom-04', query: 'Canon RF 24-70mm F2.8 L IS USM' },
  { id: 'lens-zoom-05', query: 'Canon RF 24-105mm F4 L IS USM' },
  { id: 'lens-zoom-06', query: 'Nikkor Z 24-70mm f2.8 S' },
  { id: 'lens-zoom-07', query: 'Nikkor Z 24-120mm f4 S' },
  { id: 'lens-zoom-08', query: 'Sony FE 20-70mm F4 G' },
  { id: 'lens-zoom-09', query: 'Sony FE 24-105mm F4 G OSS' },
  { id: 'lens-zoom-10', query: 'Fujifilm XF 16-55mm F2.8 R LM WR' },
  { id: 'lens-zoom-11', query: 'Fujifilm XF 18-55mm F2.8-4 R LM OIS' },
  { id: 'lens-zoom-12', query: 'Sigma 18-50mm F2.8 DC DN' },
  { id: 'lens-zoom-13', query: 'Tamron 17-70mm F2.8 Di III-A VC' },
  { id: 'lens-zoom-14', query: 'Canon RF-S 18-45mm F4.5-6.3 IS STM' },
  { id: 'lens-zoom-15', query: 'Olympus M.Zuiko Digital ED 12-40mm F2.8 PRO' },
  { id: 'lens-zoom-16', query: 'Panasonic Lumix S 24-105mm F4 Macro OIS' },
  { id: 'lens-zoom-17', query: 'Sony E 16-55mm F2.8 G' },
  { id: 'lens-zoom-18', query: 'Tamron 20-40mm F2.8 Di III' },

  // PRIME / FIX (18 items)
  { id: 'lens-prime-01', query: 'Sony FE 50mm F1.4 GM' },
  { id: 'lens-prime-02', query: 'Sony FE 35mm F1.4 GM' },
  { id: 'lens-prime-03', query: 'Sony FE 85mm F1.4 GM' },
  { id: 'lens-prime-04', query: 'Sony FE 50mm F1.8 lens' },
  { id: 'lens-prime-05', query: 'Canon RF 50mm F1.8 STM' },
  { id: 'lens-prime-06', query: 'Canon RF 35mm F1.8 Macro IS STM' },
  { id: 'lens-prime-07', query: 'Canon RF 85mm F2 Macro IS STM' },
  { id: 'lens-prime-08', query: 'Canon RF 50mm F1.2 L USM' },
  { id: 'lens-prime-09', query: 'Nikkor Z 50mm f1.8 S' },
  { id: 'lens-prime-10', query: 'Nikkor Z 40mm f2' },
  { id: 'lens-prime-11', query: 'Nikkor Z 85mm f1.8 S' },
  { id: 'lens-prime-12', query: 'Fujifilm XF 33mm F1.4 R LM WR' },
  { id: 'lens-prime-13', query: 'Fujifilm XF 27mm F2.8' },
  { id: 'lens-prime-14', query: 'Fujifilm XF 56mm F1.2 R' },
  { id: 'lens-prime-15', query: 'Sigma 56mm F1.4 DC DN' },
  { id: 'lens-prime-16', query: 'Sigma 30mm F1.4 DC DN' },
  { id: 'lens-prime-17', query: 'Sony FE 24mm F1.4 GM' },
  { id: 'lens-prime-18', query: 'Olympus M.Zuiko Digital 45mm F1.8' },

  // TELEPHOTO & SUPER-TELE (16 items)
  { id: 'lens-tele-01', query: 'Sony FE 70-200mm F2.8 GM OSS' },
  { id: 'lens-tele-02', query: 'Sony FE 70-200mm F4 G OSS' },
  { id: 'lens-tele-03', query: 'Tamron 28-200mm F2.8-5.6 Di III RXD' },
  { id: 'lens-tele-04', query: 'Tamron 70-180mm F2.8 Di III' },
  { id: 'lens-tele-05', query: 'Canon RF 70-200mm F2.8 L IS USM' },
  { id: 'lens-tele-06', query: 'Canon RF 100-400mm F5.6-8 IS USM' },
  { id: 'lens-tele-07', query: 'Canon RF 100-500mm F4.5-7.1 L IS USM' },
  { id: 'lens-tele-08', query: 'Canon RF 70-200mm F4 L IS USM' },
  { id: 'lens-tele-09', query: 'Nikkor Z 180-600mm f5.6-6.3 VR' },
  { id: 'lens-tele-10', query: 'Nikkor Z 70-200mm f2.8 VR S' },
  { id: 'lens-tele-11', query: 'Nikkor Z 100-400mm f4.5-5.6 VR S' },
  { id: 'lens-tele-12', query: 'Sony FE 200-600mm F5.6-6.3 G OSS' },
  { id: 'lens-tele-13', query: 'Fujifilm XF 70-300mm F4-5.6 R LM OIS' },
  { id: 'lens-tele-14', query: 'Fujifilm XF 50-140mm F2.8 R LM OIS' },
  { id: 'lens-tele-15', query: 'Sigma 100-400mm F5-6.3 DG DN OS' },
  { id: 'lens-tele-16', query: 'Olympus M.Zuiko Digital ED 40-150mm F4.0 PRO' }
];

async function main() {
  console.log(`Starting download for ${lenses.length} lens photos...`);
  let successCount = 0;
  for (const lens of lenses) {
    const dest = path.join(targetDir, `${lens.id}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
      console.log(`[EXISTS] ${lens.id}`);
      successCount++;
      continue;
    }
    const ok = await searchAndDownload(lens.query, dest);
    if (ok) successCount++;
    await new Promise(r => setTimeout(r, 600));
  }
  console.log(`\nDone! Successfully downloaded: ${successCount} / ${lenses.length}`);
}

main();
