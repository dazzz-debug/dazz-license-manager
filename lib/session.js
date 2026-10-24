const crypto = require('crypto');
const COOKIE = 'license_panel_session';
function secret() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 4) throw new Error('SESSION_SECRET wajib diatur dan minimal 4 karakter.');
  return process.env.SESSION_SECRET;
}
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function verify(value) {
  try {
    const [body, signature] = String(value || '').split('.');
    if (!body || !signature) return false;
    const expected = crypto.createHmac('sha256', secret()).update(body).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return false;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.exp > Date.now();
  } catch { return false; }
}
function cookieValue(req) {
  const cookies = String(req.headers.cookie || '').split(';');
  const item = cookies.map(x => x.trim()).find(x => x.startsWith(COOKIE + '='));
  return item ? decodeURIComponent(item.slice(COOKIE.length + 1)) : '';
}
function requireAuth(req, res) {
  if (verify(cookieValue(req))) return true;
  res.status(401).json({ error: 'Sesi owner tidak valid atau sudah kedaluwarsa. Login lagi.' });
  return false;
}
function setSession(res) {
  const value = sign({ exp: Date.now() + 8 * 60 * 60 * 1000 });
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`);
}
function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}
module.exports = { requireAuth, setSession, clearSession };
