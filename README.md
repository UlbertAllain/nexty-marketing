# Nexty Labs Marketing Contact Tracker

Sistem sederhana untuk tim marketing Nexty Labs: melihat calon klien yang belum dihubungi, membuka WhatsApp dengan pesan yang sudah terisi, menandai pesan yang sudah dikirim, dan membuat pengingat.

Versi ini sengaja **tidak memakai Meta WhatsApp API, webhook, Firebase Admin, cron, atau pengiriman massal otomatis**. WhatsApp dibuka melalui tautan resmi `wa.me`, lalu tim menekan tombol Send sendiri di WhatsApp.

## Yang benar-benar dilakukan sistem

- Login menggunakan nomor WhatsApp Nexty dan kode OTP SMS dari Firebase.
- Tambah calon klien secara manual atau ambil dari Excel.
- Instagram dan Google Maps dari Excel ditampilkan sebagai tombol yang dapat langsung dibuka.
- Data yang belum dihubungi otomatis muncul paling atas.
- Pesan siap pakai otomatis mengisi nama kontak, perusahaan, dan jenis usaha.
- Pembuat draf otomatis menyusun pesan berdasarkan tujuan, layanan, dan gaya bahasa tanpa memerlukan API tambahan.
- Tombol **Buka WhatsApp** membuka WhatsApp Web/Desktop dengan nomor tujuan dan pesan yang sudah terisi.
- Setelah tim menekan Send di WhatsApp, tombol **Sudah dikirim** mencatat progres di sistem.
- Saat pesan ditandai terkirim, pengingat tiga hari berikutnya dibuat otomatis.
- Tim dapat mencatat perkembangan: menunggu jawaban, sudah membalas, penawaran, negosiasi, atau menjadi klien.
- Beranda menunjukkan yang belum dihubungi, belum dikonfirmasi, dan pengingat yang jatuh tempo.
- Hasil marketing menghitung jumlah yang dihubungi, tingkat balasan, dan calon klien yang berhasil.
- Data perusahaan ganda dideteksi berdasarkan nama yang sudah dinormalisasi.

## Batasan yang harus dipahami

Tanpa Meta WhatsApp API, browser tidak memiliki izin untuk:

- menekan tombol Send secara otomatis;
- memastikan pesan benar-benar terkirim, sampai, atau dibaca;
- membaca balasan WhatsApp;
- mengirim pesan di background saat aplikasi ditutup;
- memilih akun pengirim secara paksa.

Karena itu alurnya dibuat jujur:

```text
Klik Buka WhatsApp
→ pesan dan nomor tujuan sudah terisi
→ tekan Send di WhatsApp
→ kembali ke sistem
→ klik Sudah dikirim
→ progres tercatat
→ pengingat tiga hari dibuat otomatis
```

Pesan akan dikirim dari akun yang sedang aktif di WhatsApp Web/Desktop. Gunakan profil browser khusus marketing dan pastikan profil tersebut login ke akun WhatsApp Nexty.

## Struktur fitur

| Menu | Kegunaan |
|---|---|
| Beranda kerja | Melihat pekerjaan yang perlu didahulukan. |
| Calon klien | Daftar kontak, perkembangan, dan tombol WhatsApp. |
| Pengingat | Daftar siapa yang harus dihubungi kembali. |
| Pesan siap pakai | Menyimpan contoh pesan agar tidak mengetik ulang. |
| Hasil marketing | Ringkasan progres yang dicatat tim. |
| Pengaturan | Memeriksa nomor login dan penjelasan cara pengiriman. |

Tidak ada menu campaign, inbox palsu, scheduled send, atau status delivered/read karena fitur tersebut tidak dapat bekerja tanpa API.

## Persyaratan

- Node.js 22 atau lebih baru.
- Project Firebase.
- Firebase Authentication dengan provider Phone.
- Cloud Firestore.
- WhatsApp Web/Desktop yang sudah login menggunakan akun Nexty.

## 1. Instalasi di Windows

Ekstrak ZIP, buka PowerShell di folder project, kemudian:

```powershell
npm install
Copy-Item .env.example .env.local
```

Atau:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1
```

Jangan jalankan aplikasi sebelum `.env.local` diisi.

## 2. Membuat project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih **Create a project**.
3. Setelah project siap, buka **Project settings → General**.
4. Pada **Your apps**, klik ikon Web `</>`.
5. Beri nama, misalnya `nexty-marketing`, lalu klik **Register app**.
6. Firebase menampilkan objek `firebaseConfig`.

Salin nilainya ke `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=isi_apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=isi_authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=isi_projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=isi_storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=isi_messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=isi_appId
```

Nilai tersebut adalah konfigurasi aplikasi web, bukan password Firebase. Keamanan data tetap ditentukan oleh Authentication dan Firestore Rules.

## 3. Mengaktifkan login nomor Nexty

Login menggunakan Firebase Phone Authentication. Kode masuk dikirim sebagai **SMS OTP**, bukan pesan WhatsApp.

1. Buka **Firebase Console → Build → Authentication**.
2. Klik **Get started** jika belum pernah digunakan.
3. Buka tab **Sign-in method**.
4. Aktifkan provider **Phone**.
5. Periksa pengaturan wilayah SMS jika Firebase meminta region yang diizinkan.
6. Masukkan nomor WhatsApp Nexty ke `.env.local` dalam format internasional tanpa tanda `+`:

```env
NEXT_PUBLIC_NEXTY_WHATSAPP_NUMBER=6281234567890
```

Jika nomor aslinya `081234567890`, tulis `6281234567890`.

Hanya nomor yang sama persis dengan variabel tersebut yang dapat meminta OTP melalui halaman login aplikasi. Firebase tetap memverifikasi kode OTP yang diterima pada nomor tersebut.

Untuk development, Firebase menyediakan nomor telepon pengujian pada pengaturan Phone Authentication. Nomor tes menghindari pengiriman SMS nyata, tetapi hanya gunakan pada development dan jangan gunakan kode tes pada production. Panduan resmi: [Firebase Phone Authentication for Web](https://firebase.google.com/docs/auth/web/phone-auth).

## 4. Membuat Firestore

1. Buka **Firebase Console → Build → Firestore Database**.
2. Pilih **Create database**.
3. Pilih mode Production.
4. Pilih region database.
5. Pasang Firebase CLI:

```powershell
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

Rules project memastikan setiap pengguna hanya membaca dan mengubah data milik akun loginnya sendiri.

## 5. Menjalankan aplikasi

```powershell
npm run dev
```

Buka:

```text
http://localhost:3000
```

Masukkan nomor WhatsApp Nexty, tunggu OTP SMS, lalu masukkan kodenya.

## 6. Menyiapkan WhatsApp Nexty

1. Pada komputer marketing, buka [WhatsApp Web](https://web.whatsapp.com/).
2. Hubungkan akun WhatsApp Nexty melalui menu **Linked devices** di ponsel.
3. Gunakan profil browser khusus marketing agar tidak tertukar dengan WhatsApp pribadi.
4. Biarkan sesi WhatsApp Nexty tetap aktif.
5. Dari aplikasi CRM, buka **Pengaturan** dan pastikan nomor login benar.

Tautan `wa.me` tidak dapat menentukan akun pengirim. Akun yang dipakai selalu akun WhatsApp yang sedang aktif pada browser/aplikasi tersebut.

## 7. Membuat pesan siap pakai

Buka **Pesan siap pakai → Buat pesan**.

Contoh:

```text
Halo {{contact_name}}, saya dari Nexty Labs. Saya melihat {{company_name}} punya peluang menarik untuk mengembangkan bisnis {{category}} secara digital.
```

Penanda yang tersedia:

| Penanda | Diganti menjadi |
|---|---|
| `{{contact_name}}` | Nama orang yang dihubungi atau “Bapak/Ibu” jika kosong |
| `{{company_name}}` | Nama perusahaan |
| `{{category}}` | Jenis usaha |

Pesan dapat diubah lagi sebelum WhatsApp dibuka.

### Membuat draf secara otomatis

Pada formulir **Buat pesan**, tersedia bagian **Buat draf otomatis**:

1. Pilih tujuan pesan: perkenalan, menanyakan kembali, ajakan konsultasi, atau penawaran.
2. Pilih layanan: semua layanan, website dan aplikasi, design dan branding, atau Internet of Things.
3. Pilih gaya bahasa: ramah profesional, singkat, atau formal.
4. Klik **Buat draf**.
5. Periksa dan ubah kata-katanya bila diperlukan.
6. Klik **Simpan pesan**.

Fitur ini bekerja langsung di aplikasi dan tidak memerlukan API AI. Nama kontak dan perusahaan tetap baru dimasukkan ketika pesan digunakan untuk calon klien tertentu.

## 8. Alur kerja harian

1. Buka menu **Calon klien**.
2. Data berstatus **Belum dihubungi** muncul paling atas.
3. Klik **Buka WhatsApp** pada baris yang ingin dihubungi.
4. WhatsApp terbuka dengan nomor dan pesan yang sudah terisi.
5. Periksa pesan, lalu tekan Send di WhatsApp.
6. Kembali ke sistem.
7. Tombol pada baris berubah menjadi **Sudah dikirim**. Klik tombol tersebut.
8. Sistem mencatat waktu kirim dan membuat pengingat tiga hari.
9. Jika calon klien membalas, buka datanya dan ubah perkembangan secara manual menjadi **Sudah membalas**.
10. Lanjutkan perkembangan sampai menjadi klien atau peluang berhenti.

## 9. Format Excel

Semua sheet yang memiliki tabel kontak akan dibaca. File lama **Target Pasar Nexty Labs** dapat langsung digunakan tanpa mengganti judul kolom. Baris cadangan/kosong otomatis dilewati, termasuk baris yang belum memiliki nama usaha tetapi sudah berisi pilihan default Excel.

| Kolom | Nama alternatif | Wajib |
|---|---|---|
| `company_name` | `Nama Perusahaan`, `Nama Usaha`, `Nama Bisnis` | Ya |
| `category` | `Kategori`, `Bidang Usaha`, `Jenis Usaha` | Tidak |
| `contact_name` | `Nama Kontak` | Tidak |
| `phone` | `WhatsApp`, `Kontak`, `Nomor Kontak`, `No WA` | Tidak |
| `email` | `Email` | Tidak |
| `instagram` | `Instagram`, `IG` | Tidak |
| `googleMaps` | `Link Google Maps`, `Google Maps` | Tidak |
| `potential` | `Potensi`, `Prioritas` | Tidak (`Low`, `Medium`, `High`) |
| `status` | `Status Follow-Up`, `Perkembangan` | Tidak |
| `notes` | `Catatan` | Tidak |

Nomor yang tersimpan sebagai angka Excel, tampil dalam notasi ilmiah, memakai tanda hubung, atau berisi dua nomor juga ditangani. Untuk dua nomor, nomor pertama dipakai sebagai nomor utama dan sisanya disimpan di catatan. Nomor kosong tetap dapat disimpan, tetapi tombol WhatsApp tidak aktif sampai nomor dilengkapi.

Nilai `Belum Dihubungi` dan `Menunggu Balasan` pada file lama ikut dipertahankan sebagai perkembangan awal, sehingga daftar tidak kembali menjadi serba belum dihubungi.

## 10. Deployment

Project dapat di-deploy ke Vercel tanpa cron atau server API khusus.

1. Push project ke repository Git privat.
2. Import repository ke Vercel.
3. Masukkan seluruh variabel `NEXT_PUBLIC_*` dari `.env.local` ke Environment Variables Vercel.
4. Deploy.
5. Tambahkan domain hasil deployment ke **Firebase Authentication → Settings → Authorized domains**.
6. Buka aplikasi dan uji OTP.

Tidak ada `META_*`, `CRON_SECRET`, private key Firebase Admin, webhook, atau Cloudinary yang perlu diisi.

## Pemeriksaan sebelum deploy

```powershell
npm run lint
npm test
npm run build
```

## Struktur project

```text
app/                     Halaman Next.js
components/              Login dan ruang kerja
components/workspace/    Beranda, calon klien, pengingat, pesan, laporan
lib/business.ts          Validasi, isi pesan, tautan WhatsApp, dan perhitungan
lib/firebase.ts          Koneksi Firebase Web
lib/repository.ts        Operasi data Firestore
lib/types.ts             Bentuk data sistem
tests/                   Unit test aturan utama
firestore.rules          Perlindungan data per akun
firestore.indexes.json   Index query yang benar-benar digunakan
setup-windows.ps1        Penyiapan awal Windows
```

## Masalah yang sering terjadi

- **OTP tidak terkirim**: pastikan provider Phone aktif, nomor memakai format `62`, region SMS diizinkan, dan kuota Firebase tersedia.
- **reCAPTCHA gagal**: pastikan domain aplikasi ada di Authorized domains dan `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` benar.
- **Nomor ditolak aplikasi**: samakan input dengan `NEXT_PUBLIC_NEXTY_WHATSAPP_NUMBER`.
- **WhatsApp pribadi yang terbuka**: logout dari WhatsApp pribadi atau gunakan profil browser khusus yang login ke akun Nexty.
- **Pesan belum terisi**: buat minimal satu Pesan siap pakai dan jadikan pilihan utama.
- **Data tidak dapat disimpan**: deploy `firestore.rules` dan `firestore.indexes.json`, lalu login ulang.
- **Vite atau Wrangler muncul**: kamu menggunakan source lama. Versi ini menjalankan `next dev`.

## Keamanan

- Jangan commit `.env.local`.
- Firebase Phone Auth menggunakan reCAPTCHA untuk mengurangi penyalahgunaan permintaan SMS.
- Nomor yang diizinkan berada pada variabel konfigurasi publik; keamanan login tetap berasal dari OTP Firebase, bukan dari kerahasiaan nomor.
- Firestore Rules membatasi data berdasarkan `ownerId` akun yang sedang login.
- Gunakan profil browser khusus dan kunci perangkat marketing karena sesi WhatsApp Nexty tersimpan di perangkat tersebut.
