const crypto = require('crypto');
const { requireAuth } = require('../../lib/session');
const { readLicenses, writeLicenses } = require('../../lib/github');
function mask(hash) { return hash ? `${hash.slice(0, 8)}••••••${hash.slice(-6)}` : ''; }
module.exports = async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  try {
    if (req.method === 'GET') {
      const { licenses } = await readLicenses();
      return res.status(200).json({ licenses: licenses.map(x => ({ id: x.id, label: x.label || '', tokenMasked: mask(x.tokenHash), active: x.active !== false, createdAt: x.createdAt || '' })) });
    }
    if (req.method === 'POST') {
      const token = String(req.body?.token || '').trim();
      const label = String(req.body?.label || '').trim().slice(0, 100);
      if (!/^\d{5,15}:[A-Za-z0-9_-]{20,}$/.test(token)) return res.status(400).json({ error: 'Format token bot tidak valid.' });
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const { licenses, sha } = await readLicenses();
      if (licenses.some(x => x.tokenHash === tokenHash)) return res.status(409).json({ error: 'Token ini sudah terdaftar.' });
      const item = { id: crypto.randomUUID(), tokenHash, label: label || 'Bot tanpa label', active: true, createdAt: new Date().toISOString() };
      licenses.push(item);
      await writeLicenses(licenses, sha, `Add license ${item.id}`);
      return res.status(201).json({ ok: true, license: { id: item.id, label: item.label, tokenMasked: mask(tokenHash), active: true, createdAt: item.createdAt } });
    }
    return res.status(405).json({ error: 'Method tidak diizinkan.' });
  } catch (e) { return res.status(500).json({ error: e.message || 'Gagal mengakses GitHub.' }); }
};
