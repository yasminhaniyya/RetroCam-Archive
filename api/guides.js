const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'guides.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const guides = JSON.parse(raw);

    const { id } = req.query;
    if (id) {
      const single = guides.find(g => g.id === id);
      if (!single) {
        return res.status(404).json({ status: 'error', message: 'Guide not found' });
      }
      return res.status(200).json({ status: 'success', data: single });
    }

    res.status(200).json({ status: 'success', count: guides.length, data: guides });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
