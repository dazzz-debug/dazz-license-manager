const { clearSession } = require('../../lib/session');
module.exports = function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan.' });
  clearSession(res);
  return res.status(200).json({ ok: true });
};
