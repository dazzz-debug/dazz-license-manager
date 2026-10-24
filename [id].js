const { requireAuth } = require('../../lib/session');
const { readLicenses, writeLicenses } = require('../../lib/github');
module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method tidak diizinkan.' });
  if (!requireAuth(req, res)) return;
  try {
    const id = String(req.query.id || '');
    const { licenses, sha } = await readLicenses();
    const filtered = licenses.filter(x => x.id !== id);
    if (filtered.length === licenses.length) return res.status(404).json({ error: 'Lisensi tidak ditemukan.' });
    await writeLicenses(filtered, sha, `Delete license ${id}`);
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(500).json({ error: e.message || 'Gagal menghapus lisensi.' }); }
};
