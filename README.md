# Nexty Labs Marketing CRM

Workspace internal sederhana untuk satu orang marketing Nexty Labs. Tujuan utamanya adalah mengganti pencatatan Excel yang tersebar dengan alur yang tetap ringan: simpan lead, hubungi melalui WhatsApp, catat hasil, dan kerjakan follow-up.

Aplikasi ini tidak terhubung ke layanan AI dan tidak memakai WhatsApp API. Tombol WhatsApp hanya membuka `wa.me` dengan nomor serta pesan yang sudah disiapkan. Pengiriman tetap dilakukan langsung di WhatsApp.

## Stack

- Next.js 16
- React 19
- TypeScript
- Firebase Authentication
- Cloud Firestore
- SheetJS untuk import Excel
- Tailwind CSS 4
- Lucide React

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

Template mendukung placeholder lokal:

- `{{contact_name}}`
- `{{company_name}}`
- `{{category}}`

## Setup

Gunakan Node.js 22 atau lebih baru.

```bash
npm install
```

Salin `.env.example` menjadi `.env.local`, lalu isi Firebase Web App config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Aktifkan Firebase Authentication provider Email/Password dan Cloud Firestore. Project sengaja menggunakan satu akun marketing; `ownerId` tetap dipakai untuk membatasi data terhadap akun yang sedang login.

## Menjalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Import Excel

Format yang diterima: `.xlsx` dan `.xls`.

Batas import sengaja dibuat sederhana agar browser tidak terbebani oleh file yang tidak wajar:

- maksimal 5 MB per file;
- maksimal 20 sheet;
- maksimal 5.000 calon klien per proses import;
- data tanpa nama perusahaan dilewati;
- nama perusahaan ganda dilewati;
- setiap row tetap melewati business validation sebelum disimpan.

## Quality checks

Untuk pengecekan cepat terhadap source:

```bash
npm run sanity
```

Untuk menjalankan seluruh pemeriksaan sebelum commit/deploy:

```bash
npm run verify
```

`verify` menjalankan source sanity check, ESLint, unit test, dan production build secara berurutan.

## Struktur utama

```text
app/                       routes dan global styling
components/                UI dan application shell
components/workspace/      dashboard, leads, follow-up, template, dialog
lib/business.ts            business rules dan pure helpers
lib/repository.ts          operasi Cloud Firestore
lib/spreadsheet-import.ts  parser dan guard import spreadsheet
lib/types.ts               domain types
scripts/source-sanity.mjs  regression/source guard
tests/                     unit tests
```

## Prinsip project

Project ini sengaja tidak dibuat menjadi CRM enterprise. Selama kebutuhan bisnis hanya satu orang marketing, tidak diperlukan workspace, role, assignment, approval, campaign engine, atau abstraction tambahan yang tidak memberi manfaat langsung.
