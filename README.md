# Nexty Labs Marketing CRM

Sistem kerja sederhana untuk tim marketing Nexty Labs: melihat calon klien yang belum dihubungi, membuka WhatsApp dengan pesan yang sudah disiapkan, mencatat perkembangan, membuat pengingat, dan membuat pesan baru dengan AI.

Versi ini sengaja **tidak memakai Meta WhatsApp API, webhook, cron, atau pengiriman WhatsApp otomatis**. WhatsApp dibuka melalui tautan `wa.me`, lalu marketing menekan tombol Send sendiri di WhatsApp.

## Yang dilakukan sistem

- Login menggunakan **email dan kata sandi Firebase**.
- Admin membuat akun marketing dari Firebase Authentication; pengguna tidak perlu membuat akun sendiri dari aplikasi.
- Ada fitur **Lupa kata sandi** untuk mengirim tautan reset ke email.
- Tambah calon klien secara manual atau ambil dari Excel.
- Instagram dan Google Maps dari Excel ditampilkan sebagai kolom dan tombol yang dapat langsung dibuka.
- Data yang belum dihubungi otomatis muncul paling atas.
- Pesan siap pakai mengisi nama kontak, perusahaan, dan jenis usaha secara otomatis.
- Tombol **Buat dengan AI** benar-benar memanggil Gemini API untuk membuat pesan baru.
- Tombol **Buka WhatsApp** membuka WhatsApp Web/Desktop dengan nomor tujuan dan pesan yang sudah terisi.
- Setelah marketing menekan Send di WhatsApp, marketing cukup klik **Sudah dikirim** di CRM.
- Saat pesan ditandai terkirim, pengingat tiga hari berikutnya dibuat otomatis.
- Perkembangan calon klien dapat dicatat sampai menjadi klien atau berhenti.
- Beranda menunjukkan pekerjaan yang perlu didahulukan.
- Hasil marketing menghitung progres dari data yang dicatat tim.
- Data perusahaan ganda dideteksi berdasarkan nama yang sudah dinormalisasi.

## Alur kerja paling sederhana

```text
Login dengan email + kata sandi
        ↓
Buka Calon klien
        ↓
Yang belum dihubungi muncul paling atas
        ↓
Klik Buka WhatsApp
        ↓
Nomor + pesan sudah terisi
        ↓
Tekan Send di WhatsApp
        ↓
Kembali ke CRM
        ↓
Klik Sudah dikirim
        ↓
Sistem mencatat progres + membuat pengingat 3 hari
```

## Batasan WhatsApp

Tanpa Meta WhatsApp API, website tidak memiliki izin untuk:

- menekan tombol Send secara otomatis;
- memastikan pesan benar-benar terkirim, sampai, atau dibaca;
- membaca balasan WhatsApp;
- mengirim pesan ketika browser/aplikasi ditutup;
- memilih akun pengirim secara paksa.

Akun pengirim mengikuti akun WhatsApp yang sedang aktif di WhatsApp Web/Desktop. Gunakan profil browser khusus marketing dan pastikan profil tersebut login ke akun WhatsApp Nexty.

## Struktur menu

| Menu | Kegunaan |
|---|---|
| Beranda kerja | Melihat pekerjaan yang harus didahulukan. |
| Calon klien | Daftar perusahaan, kontak, Instagram, Maps, perkembangan, dan tombol WhatsApp. |
| Pengingat | Melihat siapa yang perlu dihubungi kembali. |
| Pesan siap pakai | Menyimpan pesan yang sering digunakan dan membuat pesan baru dengan AI. |
| Hasil marketing | Melihat ringkasan progres marketing. |
| Pengaturan | Melihat akun yang sedang masuk dan cara kerja WhatsApp. |

Tidak ada menu campaign, inbox palsu, scheduled send, atau status delivered/read karena fitur tersebut membutuhkan integrasi WhatsApp API.

## Persyaratan

- Node.js 22 atau lebih baru.
- Project Firebase.
- Firebase Authentication dengan provider **Email/Password**.
- Cloud Firestore.
- WhatsApp Web/Desktop yang sudah login menggunakan akun Nexty.
- Gemini API key dari Google AI Studio jika fitur **Buat dengan AI** ingin digunakan.

---

# Setup pertama kali

## 1. Jangan membuat folder baru setiap menerima update

Ini penting.

Setelah project pertama kali dipasang, **tetap gunakan folder project yang sama**.

`npm install` hanya diperlukan ketika dependencies belum terpasang atau `package.json`/`package-lock.json` berubah.

Kalau hanya menerima perubahan pada file `.tsx`, `.ts`, `.css`, atau README seperti versi ini, **tidak perlu `npm install` lagi**.

Contoh folder kerja:

```text
D:\Kuliah bang\skripsi\skripsi\nexty-labs-marketing-crm
```

Pertahankan folder tersebut. Untuk update source, cukup timpa file yang diperbarui ke folder yang sama.

## 2. Instalasi pertama di Windows

Buka PowerShell di folder project:

```powershell
npm install
Copy-Item .env.example .env.local
```

Atau gunakan:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1
```

Script tersebut sekarang **hanya menjalankan `npm install` jika folder `node_modules` belum ada**.

Jadi menjalankan script lagi tidak akan mengunduh semua dependency dari awal.

---

# Firebase

## 3. Membuat project Firebase

1. Buka Firebase Console.
2. Pilih **Create a project**.
3. Setelah project siap, buka **Project settings → General**.
4. Pada **Your apps**, klik ikon Web `</>`.
5. Beri nama, misalnya `nexty-marketing`.
6. Klik **Register app**.
7. Firebase menampilkan `firebaseConfig`.

Masukkan nilainya ke `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=isi_apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=isi_authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=isi_projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=isi_storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=isi_messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=isi_appId
```

Konfigurasi tersebut adalah konfigurasi aplikasi web Firebase, bukan password Firebase.

## 4. Mengaktifkan login email dan kata sandi

1. Buka **Firebase Console → Build → Authentication**.
2. Klik **Get started** jika Authentication belum pernah dipakai.
3. Buka tab **Sign-in method**.
4. Pilih **Email/Password**.
5. Aktifkan **Email/Password**.
6. Simpan.

Aplikasi tidak menyediakan tombol daftar akun. Untuk sistem internal, akun dibuat oleh admin melalui Firebase Console:

1. Buka **Authentication → Users**.
2. Klik **Add user**.
3. Masukkan email marketing.
4. Buat kata sandi sementara.
5. Berikan email dan kata sandi tersebut kepada anggota tim melalui cara yang aman.

Pengguna kemudian dapat mengganti kata sandi melalui fitur **Lupa kata sandi**.

## 5. Mengaktifkan Firestore

1. Buka **Firebase Console → Build → Firestore Database**.
2. Pilih **Create database**.
3. Gunakan mode Production.
4. Pilih region database.
5. Pasang Firebase CLI jika belum ada:

```powershell
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

Rules memastikan pengguna hanya dapat membaca dan mengubah data yang memiliki `ownerId` sama dengan akun yang sedang login.

---

# Menjalankan aplikasi

## 6. Isi `.env.local`

Minimal:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.7-flash
```

`GEMINI_API_KEY` boleh dikosongkan jika fitur AI belum diperlukan. Semua fitur CRM selain **Buat dengan AI** tetap dapat digunakan.

Jangan membuat:

```env
NEXT_PUBLIC_GEMINI_API_KEY=...
```

API key Gemini harus tetap berada di server.

## 7. Jalankan

```powershell
npm run dev
```

Buka:

```text
http://localhost:3000
```

Masuk menggunakan akun email dan kata sandi yang sudah dibuat di Firebase Authentication.

---

# WhatsApp

## 8. Menyiapkan WhatsApp Nexty

1. Pada komputer marketing, buka WhatsApp Web.
2. Hubungkan akun WhatsApp Nexty melalui **Linked devices** di ponsel.
3. Sebaiknya gunakan profil browser khusus untuk akun Nexty.
4. Biarkan sesi WhatsApp tetap aktif.
5. Dari CRM, buka daftar calon klien.
6. Klik **Buka WhatsApp**.
7. Pastikan chat yang terbuka menggunakan akun Nexty.

CRM tidak mengirim pesan langsung ke WhatsApp. CRM hanya menyiapkan nomor dan isi pesan.

---

# Membuat pesan dengan AI

## 9. Mendapatkan Gemini API key

1. Buka Google AI Studio.
2. Login dengan akun Google.
3. Buka **API Keys** atau **Get API key**.
4. Klik **Create API key**.
5. Salin key.
6. Masukkan ke `.env.local`:

```env
GEMINI_API_KEY=isi_api_key_dari_google_ai_studio
GEMINI_MODEL=gemini-3.7-flash
```

Setelah mengubah `.env.local`, hentikan server dengan `Ctrl + C`, lalu jalankan lagi:

```powershell
npm run dev
```

Jangan masukkan API key Gemini ke GitHub atau chat.

## 10. Menggunakan AI

Pada **Pesan siap pakai → Buat pesan**:

1. Tentukan jenis usaha target.
2. Pilih tujuan pesan.
3. Pilih layanan Nexty.
4. Pilih gaya bahasa.
5. Jika perlu, tulis arahan tambahan.
6. Klik **Buat dengan AI**.
7. Tunggu AI membuat pesan.
8. Periksa dan edit hasilnya.
9. Klik **Simpan pesan**.

Ini benar-benar memanggil Gemini API. Tidak ada generator rule-based sebagai pengganti AI.

Data sensitif seperti nomor WhatsApp, email, Instagram, dan Google Maps tidak perlu dikirim ke Gemini. Template menggunakan penanda seperti `{{contact_name}}`, `{{company_name}}`, dan `{{category}}`.

---

# Import Excel

## 11. File Excel target pasar

File Excel dengan struktur seperti **Target Pasar Nexty Labs** dapat langsung diimpor.

Kolom yang dikenali:

| Kolom | Contoh | Wajib |
|---|---|---|
| Nama Usaha | Kopi Senja | Ya |
| Bidang Usaha | Kafe | Tidak |
| Kontak | Budi / nomor WhatsApp | Tidak |
| Potensi | High / Medium / Low | Tidak |
| Instagram | @kopisenja | Tidak |
| Link Google Maps | link atau alamat | Tidak |
| Status Follow-Up | Belum Dihubungi / Menunggu Balasan | Tidak |

Sistem juga mengenali beberapa nama kolom alternatif.

Baris kosong atau baris cadangan Excel yang tidak mempunyai nama usaha akan dilewati agar tidak menjadi data sampah.

Instagram dan Google Maps tetap disimpan dan ditampilkan sebagai kolom tersendiri pada tabel calon klien.

---

# Alur kerja marketing

## 12. Menghubungi calon klien

1. Buka **Calon klien**.
2. Kontak **Belum dihubungi** muncul paling atas.
3. Klik **Buka WhatsApp**.
4. Nomor dan pesan sudah disiapkan.
5. Periksa isi pesan.
6. Tekan Send di WhatsApp.
7. Kembali ke CRM.
8. Klik **Sudah dikirim**.
9. Sistem menyimpan waktu pengiriman.
10. Sistem membuat pengingat tiga hari berikutnya.

## 13. Ketika calon klien membalas

Balasan dibaca langsung dari WhatsApp karena CRM tidak memakai WhatsApp API.

Marketing kemudian membuka data calon klien dan mengubah perkembangannya, misalnya:

```text
Sudah dikirim
↓
Sudah membalas
↓
Peluang cocok
↓
Jadwal pertemuan
↓
Penawaran dikirim
↓
Sedang negosiasi
↓
Berhasil jadi klien
```

---

# Update project tanpa install ulang

Jika menerima ZIP/patch yang hanya berisi source code:

1. **Jangan hapus folder project lama.**
2. **Jangan pindah ke folder baru.**
3. Backup jika diperlukan.
4. Ekstrak patch ke folder project yang sekarang.
5. Pilih **Replace/Overwrite** ketika Windows meminta konfirmasi.
6. Jalankan:

```powershell
npm run dev
```

Tidak perlu menjalankan `npm install` selama `package.json` dan `package-lock.json` tidak berubah.

Kalau suatu saat dependencies memang berubah, baru jalankan:

```powershell
npm install
```

---

# Pemeriksaan sebelum deploy

```powershell
npm run lint
npm test
npm run build
```

---

# Struktur project

```text
app/                     Halaman Next.js
app/api/ai/              Endpoint server Gemini
components/              Login dan ruang kerja
components/workspace/    Beranda, calon klien, pengingat, pesan, laporan
lib/business.ts          Validasi dan aturan kerja
lib/ai-template.ts       Validasi input, prompt, dan hasil template AI
lib/firebase.ts          Koneksi Firebase Web
lib/repository.ts        Operasi data Firestore
lib/types.ts             Bentuk data sistem
tests/                   Unit test
firestore.rules          Perlindungan data per akun
firestore.indexes.json   Index query yang digunakan
setup-windows.ps1        Setup pertama kali Windows
```

---

# Masalah yang sering terjadi

### `403` ketika membuat pesan dengan AI

Pada versi login email/password, endpoint AI tidak lagi memeriksa nomor WhatsApp. Endpoint hanya memeriksa apakah pengguna sudah login dengan Firebase.

Jika masih mendapat `403`, pastikan pengguna sudah login dan token Firebase masih aktif. Logout lalu login kembali.

### `401` ketika membuat pesan dengan AI

Sesi login sudah tidak berlaku. Logout dan login kembali.

### `503` ketika membuat pesan dengan AI

Biasanya `GEMINI_API_KEY` belum diisi. Isi key pada `.env.local`, hentikan server, lalu jalankan `npm run dev` lagi.

### Login tidak bisa

Pastikan **Authentication → Sign-in method → Email/Password** sudah aktif dan email pengguna memang sudah dibuat pada **Authentication → Users**.

### Lupa kata sandi tidak bekerja

Pastikan email yang dimasukkan benar dan Firebase Authentication Email/Password sudah aktif. Periksa juga folder spam.

### Data Firestore tidak dapat disimpan

Deploy rules dan indexes:

```powershell
firebase deploy --only firestore:rules,firestore:indexes
```

### WhatsApp pribadi yang terbuka

Logout dari WhatsApp pribadi atau gunakan profil browser khusus yang login ke akun WhatsApp Nexty.

### `npm install` terasa harus dilakukan terus

Tidak perlu. Setelah `node_modules` terpasang, simpan folder project tersebut dan gunakan terus folder yang sama. Jalankan `npm install` lagi hanya jika dependencies berubah atau `node_modules` memang terhapus.

### Muncul error Vite/Wrangler

Source lama masih digunakan. Versi ini menggunakan Next.js dan menjalankan:

```powershell
npm run dev
```

---

# Keamanan

- Jangan commit `.env.local`.
- `GEMINI_API_KEY` hanya dibaca oleh route server.
- Endpoint AI memverifikasi Firebase ID token sebelum memanggil Gemini.
- Firestore Rules membatasi data berdasarkan `ownerId` akun yang sedang login.
- Tidak ada Meta API token, webhook secret, cron secret, atau Firebase Admin private key.
- Sesi WhatsApp Nexty berada pada perangkat/browser marketing, jadi perangkat tersebut harus dijaga.
