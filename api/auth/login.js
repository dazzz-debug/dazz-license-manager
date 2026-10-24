const crypto = require('crypto');
const { setSession } = require('../../lib/session');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan.' });
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD belum diatur di Vercel.' });
  const provided = Buffer.from(String(req.body?.password || ''));
  const expected = Buffer.from(String(process.env.ADMIN_PASSWORD));
  const same = provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  if (!same) return res.status(401).json({ error: 'Password owner salah.' });
  try { setSession(res); } catch (e) { return res.status(500).json({ error: e.message }); }
  return res.status(200).json({ ok: true });
};
