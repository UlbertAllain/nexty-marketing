# Nexty Labs Marketing CRM

CRM internal sederhana untuk membantu satu orang marketing mengelola calon klien tanpa membuat workflow lebih rumit daripada Excel.

Aplikasi berfokus pada empat pekerjaan utama:

1. Menyimpan atau mengimpor calon klien.
2. Menyiapkan pesan WhatsApp dari template manual.
3. Mencatat perkembangan lead setelah dihubungi.
4. Membuat dan menyelesaikan pengingat follow-up.

Tidak ada integrasi AI dan tidak ada WhatsApp API. Tombol WhatsApp membuka `wa.me` dengan pesan yang sudah terisi; pengiriman tetap dilakukan langsung oleh pengguna di WhatsApp.

## Stack

- Next.js 16
- React 19
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Tailwind CSS 4
- Lucide React

## Setup

Gunakan Node.js 22 atau lebih baru.

```bash
npm install
```

Salin environment example:

```bash
cp .env.example .env.local
```

Isi konfigurasi Firebase di `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Aktifkan Firebase Authentication dengan provider Email/Password dan buat akun marketing yang akan menggunakan aplikasi.

## Development

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Business flow

```text
Lead masuk
  -> pilih/tulis template
  -> buka WhatsApp
  -> kirim pesan di WhatsApp
  -> kembali ke CRM
  -> tandai sudah dikirim
  -> follow-up bila diperlukan
  -> perbarui status lead
```

Template mendukung placeholder berikut:

- `{{contact_name}}`
- `{{company_name}}`
- `{{category}}`

Placeholder tersebut hanya merupakan text templating lokal dan tidak terhubung ke layanan AI.

## Struktur utama

```text
app/                    Route dan global styling
components/             UI dan workspace components
components/workspace/   Dashboard, leads, follow-up, template, dialog
lib/business.ts         Business rules dan helper murni
lib/repository.ts       Operasi Cloud Firestore
lib/spreadsheet-import.ts Parser import spreadsheet
lib/types.ts            Domain types
tests/                  Unit tests
```

## Catatan desain

Project ini sengaja ditujukan untuk satu pengguna marketing. `ownerId` tetap disimpan pada data untuk memastikan query dan Firestore Security Rules hanya mengakses data milik akun yang sedang login. Tidak diperlukan workspace, role, assignment, atau sistem multi-user selama kebutuhan bisnis masih satu pengguna.
