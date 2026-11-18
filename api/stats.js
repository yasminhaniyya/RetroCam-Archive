const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  try {
    const cameras = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'cameras.json'), 'utf-8'));
    const lenses = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'lenses.json'), 'utf-8'));
    const guides = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'guides.json'), 'utf-8'));

    res.status(200).json({
      status: 'success',
      data: {
        totalCameras: cameras.length,
        totalLenses: lenses.length,
        totalGuides: guides.length,
        popularMounts: [...new Set(lenses.map(l => l.mount))],
        sensorTypes: [...new Set(cameras.map(c => c.sensorType))]
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
