const { GITHUB_OWNER, GITHUB_REPO, LICENSE_FILE_PATH } = require('./config');

function requireGithubToken() {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN belum diatur di Vercel Environment Variables.');
  if (GITHUB_OWNER.startsWith('GANTI_') || GITHUB_REPO.startsWith('GANTI_')) throw new Error('Isi GITHUB_OWNER dan GITHUB_REPO di lib/config.js.');
}
function apiUrl() {
  return `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${LICENSE_FILE_PATH.split('/').map(encodeURIComponent).join('/')}`;
}
async function githubRequest(url, options = {}) {
  requireGithubToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || `GitHub API error ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return data;
}
async function readLicenses() {
  const data = await githubRequest(apiUrl());
  const content = Buffer.from(data.content || '', 'base64').toString('utf8');
  let parsed;
  try { parsed = JSON.parse(content); } catch { throw new Error('tokens.json bukan JSON yang valid.'); }
  if (!Array.isArray(parsed)) throw new Error('Format tokens.json harus berupa array JSON.');
  return { licenses: parsed, sha: data.sha };
}
async function writeLicenses(licenses, sha, message) {
  await githubRequest(apiUrl(), {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(licenses, null, 2) + '\n').toString('base64'),
      sha,
    }),
  });
}
module.exports = { readLicenses, writeLicenses, requireGithubToken };
