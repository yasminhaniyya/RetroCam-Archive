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

const exactLensReplacements = [
  { id: 'lens-zoom-07', title: 'File:Nikon NIKKOR Z 24-120mm f 4 S (51793292337).jpg' },
  { id: 'lens-zoom-11', title: 'File:Fujinon XF 18-55.jpg' },
  { id: 'lens-zoom-13', title: 'File:Tamron 28-75mm Lens and Sony Camera.jpg' },
  { id: 'lens-zoom-18', title: 'File:Sony A6400 with Tamron 18-300mm lens.jpg' },
  { id: 'lens-prime-03', title: 'File:Sony FE 50mm F1.4 ZA lens - ready to be mounted on the camera - DSC01107.jpg' },
  { id: 'lens-prime-11', title: 'File:Nikon NIKKOR Z 85mm f 1.8 S (48706710723).jpg' },
  { id: 'lens-prime-16', title: 'File:Sigma 30mm F1.4 DC DN Contemporary.jpg' },
  { id: 'lens-tele-03', title: 'File:A man using Sony A7C2 with Tamron 28-200mm F2.8-5.6 and Godox V1S flash 20260516151759.jpg' },
  { id: 'lens-tele-12', title: 'File:Sony FE 200-600mm G and FE 100-400mm GM + 1.4x TC (51419168214).jpg' },
  { id: 'lens-tele-13', title: 'File:Fujinon XF 55-200.jpg' },
  { id: 'lens-tele-14', title: 'File:Fujinon XF 55-200.jpg' },
  { id: 'lens-tele-15', title: 'File:Sigma APO MACRO 150mm F2.8 EX DG OS HSM Lens Side View.jpg' },
  { id: 'lens-tele-16', title: 'File:Olympus 40-150mm ƒ2.8 PRO.jpg' }
];

async function run() {
  console.log('Downloading curated lens replacements...');
  for (const item of exactLensReplacements) {
    const dest = path.join(targetDir, `${item.id}.jpg`);
    try {
      await downloadByExactTitle(item.title, dest);
    } catch (err) {
      console.error(`Failed ${item.id}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 400));
  }
  console.log('Lens replacements completed!');
}

run();
