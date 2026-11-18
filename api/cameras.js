const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'cameras.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    let cameras = JSON.parse(raw);

    const { id, search, sensor, brand, sort } = req.query;

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
        (c.tag && c.tag.toLowerCase().includes(q))
      );
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
