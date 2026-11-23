const path = require('path');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pvwsllkimmscfyqshass.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3NsbGtpbW1zY2Z5cXNoYXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NDIwNTYsImV4cCI6MjExMTAxODA1Nn0._e9KPNnMzIwTyDT9ZKREHI0HtVfD7X06mnMcg6sVjm4';

async function fetchFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/lenses?select=*`, {
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
    const filePath = path.join(process.cwd(), 'data', 'lenses.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    let localLenses = JSON.parse(raw);
    const supabaseLenses = await fetchFromSupabase();
    let lenses = supabaseLenses || localLenses;

    // POST: Tambah Lensa Baru (Admin)
    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.name || !body.brand) {
        return res.status(400).json({ status: 'error', message: 'Nama dan merek lensa wajib diisi' });
      }

      const newId = body.id || `lens-${Date.now()}`;
      const newLens = {
        id: newId,
        name: body.name,
        brand: body.brand,
        category: body.category || 'Lensa Prime',
        mount: body.mount || 'Sony E-mount',
        focalLength: body.focalLength || '50mm',
        maxAperture: body.maxAperture || 'f/1.8',
        releaseYear: parseInt(body.releaseYear) || new Date().getFullYear(),
        priceYen: body.priceYen || '¥38,000',
        rating: parseFloat(body.rating) || 4.8,
        imageUrl: body.imageUrl || '/images/lenses/lens-prime-01.jpg',
        summary: body.summary || body.name,
        description: body.description || `${body.name} dikurasi dan ditambahkan ke katalog RetroCam Archive.`,
        specs: body.specs || {
          focalLength: body.focalLength || '50mm',
          maxAperture: body.maxAperture || 'f/1.8',
          minAperture: body.minAperture || 'f/22',
          mount: body.mount || 'Sony E-mount',
          filterThread: body.filterThread || '49mm'
        },
        bokehCharacter: body.bokehCharacter || 'Bokeh melingkar dengan degradasi fokus halus.',
        pros: Array.isArray(body.pros) ? body.pros : [body.summary || 'Kualitas optik tajam'],
        cons: Array.isArray(body.cons) ? body.cons : ['Fokus manual']
      };

      lenses.unshift(newLens);

      // Sinkronisasi ke Supabase
      fetch(`${SUPABASE_URL}/rest/v1/lenses`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(newLens)
      }).catch(() => {});

      try {
        fs.writeFileSync(filePath, JSON.stringify(lenses, null, 2), 'utf-8');
      } catch (err) {}

      return res.status(201).json({
        status: 'success',
        message: 'Lensa baru berhasil ditambahkan ke katalog.',
        data: newLens
      });
    }

    // PUT: Update Lensa (Admin)
    if (req.method === 'PUT') {
      const body = req.body || {};
      const targetId = req.query.id || body.id;
      const idx = lenses.findIndex(l => l.id === targetId);
      if (idx === -1) {
        return res.status(404).json({ status: 'error', message: 'Lensa tidak ditemukan' });
      }
      lenses[idx] = { ...lenses[idx], ...body, id: targetId };

      // Sinkronisasi ke Supabase
      fetch(`${SUPABASE_URL}/rest/v1/lenses?id=eq.${encodeURIComponent(targetId)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lenses[idx])
      }).catch(() => {});

      try {
        fs.writeFileSync(filePath, JSON.stringify(lenses, null, 2), 'utf-8');
      } catch (err) {}
      return res.status(200).json({ status: 'success', message: 'Lensa berhasil diperbarui', data: lenses[idx] });
    }

    const { id, search, category, mount, brand, sort } = req.query;

    if (id) {
      const single = lenses.find(l => l.id === id);
      if (!single) {
        return res.status(404).json({ status: 'error', message: 'Lens not found' });
      }
      return res.status(200).json({ status: 'success', data: single });
    }

    if (search) {
      const q = search.toLowerCase();
      lenses = lenses.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.brand.toLowerCase().includes(q) ||
        l.mount.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        (l.category && l.category.toLowerCase().includes(q)) ||
        (l.tag && l.tag.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'all') {
      lenses = lenses.filter(l => l.category && l.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (mount && mount !== 'all') {
      lenses = lenses.filter(l => l.mount.toLowerCase().includes(mount.toLowerCase()));
    }

    if (brand && brand !== 'all') {
      lenses = lenses.filter(l => l.brand.toLowerCase().includes(brand.toLowerCase()));
    }

    if (sort === 'year-asc') {
      lenses.sort((a, b) => a.releaseYear - b.releaseYear);
    } else if (sort === 'year-desc') {
      lenses.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sort === 'rating-desc') {
      lenses.sort((a, b) => b.rating - a.rating);
    }

    res.status(200).json({
      status: 'success',
      count: lenses.length,
      data: lenses
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
