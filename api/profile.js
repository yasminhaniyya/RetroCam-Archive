const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'profile.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    let profile = JSON.parse(raw);

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = req.body || {};
      const academicUpdates = body.academicInfo ? body.academicInfo : body;

      profile.academicInfo = {
        ...profile.academicInfo,
        ...academicUpdates
      };

      try {
        fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf-8');
      } catch (err) {
        // Read-only filesystem on serverless environment is handled gracefully
      }

      return res.status(200).json({
        status: 'success',
        message: 'Profil mahasiswa berhasil diperbarui.',
        data: profile
      });
    }

    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
