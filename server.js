/**
 * RetroCam Archive - Custom REST Web Service API (Modul 1)
 * Built with Node.js & Express
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper function to safely read JSON data
function loadData(fileName) {
  try {
    const filePath = path.join(__dirname, 'data', fileName);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error.message);
    return [];
  }
}

// In-memory cached data
let camerasData = loadData('cameras.json');
let lensesData = loadData('lenses.json');
let guidesData = loadData('guides.json');
let profileData = loadData('profile.json');

// ==========================================
// API ROUTES (Web Service Sesuai Modul 1)
// ==========================================

// 1. Health check & API info
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    name: 'RetroCam Archive API',
    version: '1.0.0',
    description: 'Custom Web Service REST API for Retro Digital Cameras and Vintage Lenses Catalog',
    endpoints: [
      { method: 'GET', path: '/api/cameras', description: 'List all digital cameras (filters: search, sensor, brand, sort)' },
      { method: 'GET', path: '/api/cameras/:id', description: 'Get detail of single camera by id' },
      { method: 'GET', path: '/api/lenses', description: 'List all vintage lenses (filters: search, mount, sort)' },
      { method: 'GET', path: '/api/lenses/:id', description: 'Get detail of single lens by id' },
      { method: 'GET', path: '/api/guides', description: 'List camera guides and articles' },
      { method: 'GET', path: '/api/profile', description: 'Student profile & academic submission info' },
      { method: 'GET', path: '/api/stats', description: 'Aggregate archive statistics' }
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Get Camera List (supports search, category filter, sensor filter, brand filter, sorting)
app.get('/api/cameras', (req, res) => {
  let results = [...camerasData];
  const { search, category, sensor, brand, sort } = req.query;

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      c.sensorType.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'all') {
    results = results.filter(c => c.category && c.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (sensor && sensor !== 'all') {
    results = results.filter(c => c.sensorType.toLowerCase().includes(sensor.toLowerCase()));
  }

  if (brand && brand !== 'all') {
    results = results.filter(c => c.brand.toLowerCase().includes(brand.toLowerCase()));
  }

  if (sort === 'year-asc') {
    results.sort((a, b) => a.releaseYear - b.releaseYear);
  } else if (sort === 'year-desc') {
    results.sort((a, b) => b.releaseYear - a.releaseYear);
  } else if (sort === 'mp-desc') {
    results.sort((a, b) => b.megapixels - a.megapixels);
  } else if (sort === 'rating-desc') {
    results.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    status: 'success',
    count: results.length,
    data: results
  });
});

// 3. Get Single Camera by ID
app.get('/api/cameras/:id', (req, res) => {
  const camera = camerasData.find(c => c.id === req.params.id);
  if (!camera) {
    return res.status(404).json({
      status: 'error',
      message: `Camera with id '${req.params.id}' not found`
    });
  }
  res.json({
    status: 'success',
    data: camera
  });
});

// 4. Get Lenses List (supports search, category filter, mount filter, brand filter, sorting)
app.get('/api/lenses', (req, res) => {
  let results = [...lensesData];
  const { search, category, mount, brand, sort } = req.query;

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(l => 
      l.name.toLowerCase().includes(q) ||
      l.brand.toLowerCase().includes(q) ||
      l.mount.toLowerCase().includes(q) ||
      l.summary.toLowerCase().includes(q) ||
      (l.category && l.category.toLowerCase().includes(q)) ||
      (l.tag && l.tag.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'all') {
    results = results.filter(l => l.category && l.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (mount && mount !== 'all') {
    results = results.filter(l => l.mount.toLowerCase().includes(mount.toLowerCase()));
  }

  if (brand && brand !== 'all') {
    results = results.filter(l => l.brand.toLowerCase().includes(brand.toLowerCase()));
  }

  if (sort === 'year-asc') {
    results.sort((a, b) => a.releaseYear - b.releaseYear);
  } else if (sort === 'year-desc') {
    results.sort((a, b) => b.releaseYear - a.releaseYear);
  } else if (sort === 'rating-desc') {
    results.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    status: 'success',
    count: results.length,
    data: results
  });
});

// 5. Get Single Lens by ID
app.get('/api/lenses/:id', (req, res) => {
  const lens = lensesData.find(l => l.id === req.params.id);
  if (!lens) {
    return res.status(404).json({
      status: 'error',
      message: `Lens with id '${req.params.id}' not found`
    });
  }
  res.json({
    status: 'success',
    data: lens
  });
});

// 6. Get Guides & Tips
app.get('/api/guides', (req, res) => {
  res.json({
    status: 'success',
    count: guidesData.length,
    data: guidesData
  });
});

app.get('/api/guides/:id', (req, res) => {
  const guide = guidesData.find(g => g.id === req.params.id);
  if (!guide) {
    return res.status(404).json({
      status: 'error',
      message: `Guide with id '${req.params.id}' not found`
    });
  }
  res.json({
    status: 'success',
    data: guide
  });
});

// 7. Get & Update Profile & Academic Information (Syarat Halaman Profile/About)
app.get('/api/profile', (req, res) => {
  res.json({
    status: 'success',
    data: profileData
  });
});

app.post('/api/profile', (req, res) => {
  try {
    const body = req.body || {};
    const academicUpdates = body.academicInfo ? body.academicInfo : body;

    profileData.academicInfo = {
      ...profileData.academicInfo,
      ...academicUpdates
    };

    const filePath = path.join(__dirname, 'data', 'profile.json');
    fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2), 'utf-8');

    res.json({
      status: 'success',
      message: 'Profil mahasiswa berhasil diperbarui.',
      data: profileData
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.put('/api/profile', (req, res) => {
  try {
    const body = req.body || {};
    const academicUpdates = body.academicInfo ? body.academicInfo : body;

    profileData.academicInfo = {
      ...profileData.academicInfo,
      ...academicUpdates
    };

    const filePath = path.join(__dirname, 'data', 'profile.json');
    fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2), 'utf-8');

    res.json({
      status: 'success',
      message: 'Profil mahasiswa berhasil diperbarui.',
      data: profileData
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 8. Get Database Aggregate Statistics
app.get('/api/stats', (req, res) => {
  res.json({
    status: 'success',
    data: {
      totalCameras: camerasData.length,
      totalLenses: lensesData.length,
      totalGuides: guidesData.length,
      oldestCameraYear: Math.min(...camerasData.map(c => c.releaseYear)),
      newestCameraYear: Math.max(...camerasData.map(c => c.releaseYear)),
      popularMounts: [...new Set(lensesData.map(l => l.mount))],
      sensorTypes: [...new Set(camerasData.map(c => c.sensorType))]
    }
  });
});

// Serve static frontend files (PWA)
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all middleware to serve PWA Single Page Application
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ status: 'error', message: 'API Endpoint not found' });
  }
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send('RetroCam Archive API Server is ready.');
});

// Start the server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  RetroCam Archive - Web Service API & PWA Server      `);
    console.log(`  Running on: http://localhost:${PORT}                 `);
    console.log(`  API Base:   http://localhost:${PORT}/api             `);
    console.log(`=======================================================`);
  });
}

module.exports = app;
