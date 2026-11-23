const path = require('path');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pvwsllkimmscfyqshass.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3NsbGtpbW1zY2Z5cXNoYXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NDIwNTYsImV4cCI6MjExMTAxODA1Nn0._e9KPNnMzIwTyDT9ZKREHI0HtVfD7X06mnMcg6sVjm4';

async function fetchFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/cameras?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {}
  return null;
}

module.exports = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'cameras.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    let localCameras = JSON.parse(raw);
    const supabaseCameras = await fetchFromSupabase();
    let cameras = supabaseCameras || localCameras;

    // POST: Tambah Kamera Baru (Admin)
    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.name || !body.brand) {
        return res.status(400).json({ status: 'error', message: 'Nama dan merek kamera wajib diisi' });
      }

      const newId = body.id || `cam-${Date.now()}`;
      const newCamera = {
        id: newId,
        name: body.name,
        brand: body.brand,
        category: body.category || 'Kamera saku',
        releaseYear: parseInt(body.releaseYear) || new Date().getFullYear(),
        sensorType: body.sensorType || 'CCD',
        megapixels: parseFloat(body.megapixels) || 12.0,
        priceYen: body.priceYen || '¥45,000',
        rating: parseFloat(body.rating) || 4.8,
        imageUrl: body.imageUrl || '/images/cameras/cam-pocket-01.jpg',
        summary: body.summary || body.name,
        description: body.description || `${body.name} dikurasi dan ditambahkan ke katalog RetroCam Archive.`,
        specs: body.specs || {
          sensor: body.sensorType || 'CCD',
          lens: body.lensSpec || 'Built-in Zoom',
          isoRange: body.isoRange || 'ISO 80 - 1600',
          storage: 'SD / SDHC',
          battery: 'Rechargeable Li-Ion'
        },
        colorProfile: body.colorProfile || 'Karakteristik tone warna klasik dengan saturasi kontras alami.',
        pros: Array.isArray(body.pros) ? body.pros : [body.summary || 'Kualitas optik prima'],
        cons: Array.isArray(body.cons) ? body.cons : ['Kamera vintage edisi pilihan']
      };

      cameras.unshift(newCamera);

      // Sinkronisasi ke Supabase
      fetch(`${SUPABASE_URL}/rest/v1/cameras`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(newCamera)
      }).catch(() => {});

      try {
        fs.writeFileSync(filePath, JSON.stringify(cameras, null, 2), 'utf-8');
      } catch (err) {}

      return res.status(201).json({
        status: 'success',
        message: 'Kamera baru berhasil ditambahkan ke katalog.',
        data: newCamera
      });
    }

    // PUT: Update Kamera (Admin)
    if (req.method === 'PUT') {
      const body = req.body || {};
      const targetId = req.query.id || body.id;
      const idx = cameras.findIndex(c => c.id === targetId);
      if (idx === -1) {
        return res.status(404).json({ status: 'error', message: 'Kamera tidak ditemukan' });
      }
      cameras[idx] = { ...cameras[idx], ...body, id: targetId };

      // Sinkronisasi ke Supabase
      fetch(`${SUPABASE_URL}/rest/v1/cameras?id=eq.${encodeURIComponent(targetId)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cameras[idx])
      }).catch(() => {});

      try {
        fs.writeFileSync(filePath, JSON.stringify(cameras, null, 2), 'utf-8');
      } catch (err) {}
      return res.status(200).json({ status: 'success', message: 'Kamera berhasil diperbarui', data: cameras[idx] });
    }

    const { id, search, category, sensor, brand, sort } = req.query;

    if (id) {
      const single = cameras.find(c => c.id === id);
      if (!single) {
        return res.status(404).json({ status: 'error', message: 'Camera not found' });
      }
      return res.status(200).json({ status: 'success', data: single });
    }

    if (search) {
      const q = search.toLowerCase();
      cameras = cameras.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.sensorType.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'all') {
      cameras = cameras.filter(c => c.category && c.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (sensor && sensor !== 'all') {
      cameras = cameras.filter(c => c.sensorType.toLowerCase().includes(sensor.toLowerCase()));
    }

    if (brand && brand !== 'all') {
      cameras = cameras.filter(c => c.brand.toLowerCase().includes(brand.toLowerCase()));
    }

    if (sort === 'year-asc') {
      cameras.sort((a, b) => a.releaseYear - b.releaseYear);
    } else if (sort === 'year-desc') {
      cameras.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sort === 'mp-desc') {
      cameras.sort((a, b) => b.megapixels - a.megapixels);
    } else if (sort === 'rating-desc') {
      cameras.sort((a, b) => b.rating - a.rating);
    }

    res.status(200).json({
      status: 'success',
      count: cameras.length,
      data: cameras
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
