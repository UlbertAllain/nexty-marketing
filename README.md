# NextyLeads

NextyLeads adalah ruang kerja pemasaran internal NextyLabs untuk mengelola calon klien, riset, pesan, tindak lanjut, dan laporan dalam satu sistem.

## Fitur utama

- **Hari ini** — urutan pekerjaan berdasarkan tindak lanjut dan prioritas.
- **Daftar calon klien** — status, prioritas, riset, dan catatan.
- **Tindak lanjut** — jadwal terlambat, hari ini, dan berikutnya.
- **Cari calon klien** — riset bisnis, media sosial, dan sumber.
- **Contoh pesan** — contoh bawaan dan CRUD pesan kustom.
- **Rencana pertumbuhan** — perencanaan berkala.
- **Laporan** — perkembangan dan evaluasi.
- **Panduan** — dokumentasi pengguna di dalam aplikasi.
- **Pengaturan** — sinkronisasi data sumber.

## Pesan kustom

Contoh bawaan bersifat read-only karena berasal dari data acuan.

Pesan kustom disimpan terpisah:

```text
messageTemplates/{templateId}
```

Fitur:

- tambah;
- edit;
- hapus;
- salin;
- kategori;
- keterangan penggunaan.

Pesan kustom tidak ditimpa saat sinkronisasi Excel.

## Alur WhatsApp

1. Buka calon klien.
2. Pilih dan sesuaikan pesan.
3. Klik **Buka di WhatsApp**.
4. Kirim pesan.
5. Kembali ke NextyLeads.
6. Klik **Tandai terkirim**.
7. Sistem mencatat aktivitas dan membuat tindak lanjut berikutnya jika diperlukan.

## Stack

- Next.js 16.2.6
- React 19
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Zod
- date-fns
- lucide-react

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dengan konfigurasi Firebase Web App dan aktifkan Email/Password Authentication.

Pada instalasi baru, buka **Pengaturan → Sinkronkan Excel** satu kali.

## Validasi lokal

Sebelum merge atau deploy:

```bash
npm run typecheck
npm run lint
npm run build
```

## Koleksi Firestore

Operasional:

- `leads`
- `leads/{leadId}/activities`
- `tasks`
- `prospects`
- `socialProfiles`
- `researchQueue`
- `researchSources`
- `dailyKpis`
- `messageTemplates`

Acuan/audit:

- `referenceData`
- `excelSheets`
- `meta`

## Dokumentasi

- [Panduan pengguna](docs/USER_GUIDE.md)
- [Arsitektur](docs/ARCHITECTURE.md)
- [Engineering standard](docs/ENGINEERING_STANDARD.md)

Panduan pengguna juga tersedia langsung di aplikasi melalui menu **Panduan**.
