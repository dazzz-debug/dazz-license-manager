SPIDER LICENSE PANEL — DEPLOY VERCEL

STRUKTUR
- public/index.html: panel owner (Add / Del / List / Search)
- api/license/check.js: endpoint yang dipakai SC untuk validasi hash token
- api/licenses/*: endpoint panel yang perlu sesi owner
- lib/config.js: username dan nama repository GitHub PRIVATE (isi sebelum deploy)
- tokens.json: file awal untuk di-commit ke repository GitHub PRIVATE

GITHUB
1. Buat repository PRIVATE khusus lisensi.
2. Upload tokens.json dengan isi [] (array kosong).
3. Buat GitHub Fine-grained Personal Access Token yang hanya punya akses Contents: Read and write ke repository itu. Jangan pernah masukkan PAT ke SC.
4. Isi GITHUB_OWNER dan GITHUB_REPO di lib/config.js sesuai repository.

VERCEL
1. Import repository panel ini ke Vercel.
2. Tambahkan Environment Variables:
   GITHUB_TOKEN = GitHub PAT yang punya akses ke repo lisensi
   ADMIN_PASSWORD = password kuat khusus panel owner
   SESSION_SECRET = random secret panjang minimal 32 karakter
3. Deploy.
4. Buka domain Vercel, login, dan tes Add/List/Del.
5. Salin URL endpoint penuh: https://DOMAIN-VERCEL/api/license/check
6. Di SC, buka index.js lalu isi LICENSE_API_URL, LICENSE_GITHUB_OWNER, LICENSE_GITHUB_REPO.

FORMAT tokens.json
[
  {
    "id": "UUID-dari-panel",
    "tokenHash": "SHA-256-hex-token",
    "label": "Bot utama",
    "active": true,
    "createdAt": "ISO date"
  }
]
Panel tidak menyimpan token bot mentah, hanya SHA-256 hash.

CATATAN
- Pengecekan SC saat startup, lalu setiap 1 jam. Penghapusan lisensi akan terdeteksi pada pengecekan berikutnya (maksimum kira-kira 1 jam + waktu respons API).
- Jika API tidak bisa dihubungi saat startup, SC gagal start. Saat pengecekan berkala terjadi gangguan jaringan, SC mencatat error dan mencoba lagi pada jadwal berikutnya; tidak menganggap gangguan jaringan sebagai pencabutan.
- Jangan menaruh GitHub PAT atau password panel di SC. Credential di SC bisa diekstrak oleh siapa pun yang memiliki file tersebut.
- Setelah deploy, pastikan domain dan repo benar sebelum menjalankan SC.
