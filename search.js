const crypto = require('crypto');
const { requireAuth } = require('../../lib/session');
const { readLicenses } = require('../../lib/github');
function mask(hash) { return hash ? `${hash.slice(0, 8)}••••••${hash.slice(-6)}` : ''; }
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan.' });
  if (!requireAuth(req, res)) return;
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q) return res.status(400).json({ error: 'Isi kata kunci pencarian.' });
    const maybeHash = /^[0-9a-f]{64}$/i.test(q) ? q : crypto.createHash('sha256').update(q).digest('hex');
    const { licenses } = await readLicenses();
    const found = licenses.filter(x => String(x.label || '').toLowerCase().includes(q) || x.id === q || x.tokenHash === maybeHash);
    return res.status(200).json({ licenses: found.map(x => ({ id: x.id, label: x.label || '', tokenMasked: mask(x.tokenHash), active: x.active !== false, createdAt: x.createdAt || '' })) });
  } catch (e) { return res.status(500).json({ error: e.message || 'Pencarian gagal.' }); }
};
