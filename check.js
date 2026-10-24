const { readLicenses } = require('../../lib/github');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ valid: false, error: 'Method tidak diizinkan.' });
  const tokenHash = String(req.body?.tokenHash || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(tokenHash)) return res.status(200).json({ valid: false });
  try {
    const { licenses } = await readLicenses();
    const valid = licenses.some(x => x.tokenHash === tokenHash && x.active !== false);
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({ valid });
  } catch (e) {
    // Kegagalan server dibedakan dari lisensi dicabut supaya client bisa retry.
    return res.status(503).json({ valid: false, error: 'License service temporarily unavailable.' });
  }
};
