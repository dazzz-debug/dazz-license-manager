# DAZZ License Manager — Vercel

Fitur: Add Token, Delete Token, List Token lengkap, Search Token. Dashboard langsung terbuka tanpa login.

## Risiko
Tanpa login, siapa pun yang mengetahui URL deployment dapat melihat token dan memanggil endpoint API untuk menambah/menghapus lisensi. Gunakan hanya bila risikonya diterima; lebih aman menambahkan proteksi akses sebelum publik.

## Siapkan GitHub
Buat `tokens.json` pada repository lisensi:
```json
{
  "tokens": ["TOKEN_BOT_YANG_DIIZINKAN"]
}
```
Buat GitHub Personal Access Token dengan izin Contents read/write hanya pada repository lisensi.

## Deploy
Import folder project ke Vercel. Di Project Settings → Environment Variables, tambahkan:
- `GITHUB_OWNER` = username pemilik repository
- `GITHUB_REPO` = nama repository
- `GITHUB_TOKEN` = GitHub PAT (rahasia, jangan taruh di frontend)
- `GITHUB_BRANCH` = `main` (opsional)
- `GITHUB_FILE_PATH` = `tokens.json` (opsional)

Redeploy setelah menambahkan environment variables, lalu buka domain Vercel.

Endpoint: `GET /api/tokens`, `POST /api/tokens` dengan body `{"token":"..."}`, `DELETE /api/tokens` dengan body `{"token":"..."}`.
