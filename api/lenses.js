const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'lenses.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    let lenses = JSON.parse(raw);

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
