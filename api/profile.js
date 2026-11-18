const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'profile.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const profile = JSON.parse(raw);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
