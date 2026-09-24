# Panduan Pengguna NextyLeads

Dokumen ini ditujukan untuk tim pemasaran NextyLabs. Tujuannya adalah menjelaskan cara memakai NextyLeads dengan benar tanpa harus memahami kode.

## Tujuan sistem

NextyLeads digunakan untuk:

- mengelola calon klien;
- menentukan prioritas;
- melakukan riset sebelum menghubungi bisnis;
- menyiapkan contoh pesan;
- menyimpan pesan kustom tim;
- mencatat pesan yang sudah dikirim;
- membuat jadwal tindak lanjut;
- melihat perkembangan pemasaran;
- menyimpan data acuan dari Excel.

## Alur kerja harian

1. Buka **Hari ini**.
2. Selesaikan **Tindak lanjut terlambat**.
3. Selesaikan tindak lanjut yang jatuh tempo **hari ini**.
4. Hubungi calon klien **Prioritas A** yang belum dikontak.
5. Kalau daftar mulai menipis, buka **Cari calon klien**.
6. Sebelum selesai kerja, pastikan status dan langkah berikutnya sudah diperbarui.

Jangan memulai hari dengan mencari calon klien baru kalau tindak lanjut yang tertinggal masih banyak.

## Fungsi menu

### Hari ini

Pusat pekerjaan harian. Gunakan halaman ini untuk menentukan apa yang harus dikerjakan terlebih dahulu.

### Daftar calon klien

Menampilkan semua calon klien beserta prioritas, status, penawaran, dan langkah berikutnya.

Klik nama bisnis untuk membuka detail.

### Tindak lanjut

Dibagi menjadi:

- **Terlambat** — prioritas pertama;
- **Hari ini** — harus diselesaikan hari itu;
- **Berikutnya** — belum perlu dikerjakan sekarang.

### Cari calon klien

Dipakai untuk melihat calon bisnis hasil riset, antrean riset, akun media sosial, dan sumber informasi.

Data publik adalah bahan pembuka. Jangan menganggap data publik sebagai kepastian tentang proses internal.

### Contoh pesan

Terdiri dari:

- **Contoh bawaan** — referensi sistem, tidak diedit langsung;
- **Pesan kustom** — pesan milik tim yang bisa ditambah, diedit, dihapus, dan disalin.

### Rencana pertumbuhan

Untuk perencanaan mingguan atau bulanan.

### Laporan

Untuk evaluasi perkembangan calon klien, tindak lanjut, target, evaluasi mingguan, dan arus kas.

### Pengaturan

Untuk administrator atau pengelola sistem. Bukan menu kerja harian.

### Panduan

Dokumentasi pengguna yang tersedia langsung di aplikasi.

## Mengelola calon klien

Sebelum menghubungi:

- cek informasi bisnis terbaru;
- cek situs web dan media sosial;
- cari satu observasi yang benar-benar terlihat;
- sesuaikan pesan dengan konteks.

Jangan:

- mengklaim proses internal tanpa validasi;
- menyimpulkan dari satu ulasan;
- langsung mengirim harga tanpa memahami kebutuhan;
- mengirim pesan yang terasa generik jika informasi spesifik tersedia.

## Prioritas

- **A** — dikerjakan paling awal;
- **B** — prioritas menengah;
- **C** — prioritas lebih rendah atau perlu validasi.

Prioritas adalah alat untuk mengatur urutan kerja, bukan prediksi penjualan.

## Status calon klien

| Status | Arti |
|---|---|
| Baru | Belum diproses |
| Siap dihubungi | Data cukup dan siap dikontak |
| Sudah dihubungi | Pesan pertama sudah dikirim |
| Sudah membalas | Sudah ada respons |
| Tertarik | Ada minat untuk lanjut |
| Pertemuan | Tahap pertemuan/penggalian kebutuhan |
| Proposal | Proposal sedang diproses atau sudah dikirim |
| Berhasil | Menjadi klien |
| Tidak lanjut | Proses berhenti |
| Tindak lanjut nanti | Perlu dihubungi kembali di waktu lain |
| Tidak cocok | Tidak sesuai target |

## Prinsip pesan bawaan

Pesan bawaan NextyLeads tidak mengambil kalimat riset mentah untuk ditempel ke calon klien.

Contoh data seperti jumlah kelas per hari, jumlah ulasan, hipotesis kebutuhan sistem, atau catatan audit hanya digunakan sebagai konteks internal tim.

Pesan bawaan dibuat berdasarkan jenis bisnis dan berfokus pada pertanyaan yang natural, misalnya:

- studio kebugaran: booking, jadwal, dan data member;
- arsitektur/interior: alur calon klien, survei, dan penawaran;
- restoran: reservasi dan pesanan;
- bengkel: booking servis, status pekerjaan, dan riwayat kendaraan;
- pendidikan: jadwal, siswa, dan paket belajar.

Sebelum dikirim, pengguna tetap harus membaca ulang dan menyesuaikan pesan jika konteks calon klien berbeda.

## Mengirim WhatsApp

1. Buka detail calon klien.
2. Pilih pesan.
3. Sesuaikan isi.
4. Klik **Buka di WhatsApp**.
5. Kirim pesan di WhatsApp.
6. Kembali ke NextyLeads.
7. Klik **Tandai terkirim**.

Membuka WhatsApp tidak otomatis berarti pesan sudah dikirim.

Setelah **Tandai terkirim**, NextyLeads mencatat aktivitas dan membuat tindak lanjut berikutnya jika diperlukan.

## CRUD pesan kustom

Buka **Contoh pesan → Pesan kustom**.

### Tambah

1. Klik **Tambah pesan**.
2. Isi judul.
3. Pilih kategori.
4. Isi kapan pesan digunakan.
5. Tulis isi pesan.
6. Klik **Simpan pesan**.

### Edit

1. Klik ikon edit.
2. Ubah isian.
3. Klik **Simpan perubahan**.

### Hapus

1. Klik ikon hapus.
2. Konfirmasi penghapusan.

Penghapusan bersifat permanen.

### Kategori

- Pesan awal
- Tindak lanjut
- Balasan
- Penawaran
- Lainnya

Pesan kustom disimpan di Firestore koleksi `messageTemplates` dan tidak ditimpa sinkronisasi Excel.

## Membaca ringkasan riset

Pada detail calon klien terdapat bagian **Ringkasan riset**. Bagian ini bukan data pasti tentang proses internal perusahaan. Isinya adalah ringkasan informasi publik dan hipotesis awal untuk membantu tim menentukan prioritas dan cara membuka percakapan.

### Arti skor

- **Potensi kebutuhan** — seberapa besar kemungkinan bisnis membutuhkan solusi digital atau sistem.
- **Celah digital** — seberapa jelas ruang perbaikan pada aset digital atau alur pelanggan.
- **Kompleksitas operasional** — seberapa kompleks aktivitas bisnis yang mungkin terbantu oleh sistem.
- **Potensi nilai proyek** — perkiraan skala pekerjaan jika kebutuhan benar-benar tervalidasi.
- **Kemudahan keputusan** — seberapa mudah menjangkau pengambil keputusan dan melanjutkan pembicaraan.

Nilai **/100 adalah skor prioritas internal, bukan persentase peluang closing**.

### Arti kotak ringkasan

- **Aset digital yang terlihat** — aset publik yang ditemukan saat riset.
- **Yang sudah dimiliki** — aset/proses yang sudah terlihat berjalan.
- **Peluang perbaikan** — ruang perbaikan yang masih perlu divalidasi.
- **Masalah yang terlihat** — hambatan atau keluhan yang benar-benar terlihat dari sumber publik.
- **Status data** — tingkat keyakinan hasil riset dan apa yang belum diketahui.
- **Penawaran yang cocok** — layanan NextyLabs yang mungkin relevan sebagai hipotesis awal.
- **Ide solusi** — gambaran awal solusi.
- **Sudut pembuka pesan** — topik aman untuk membuka percakapan.

Raw source tetap dipertahankan pada Data Sumber untuk audit, sedangkan data operasional yang dibaca tim dinormalisasi ke Bahasa Indonesia.

## Riset

Gunakan riset untuk memahami bisnis sebelum menghubungi.

- fakta publik harus dapat ditelusuri;
- dugaan tetap diperlakukan sebagai dugaan;
- jangan menuduh bisnis punya masalah tertentu tanpa konfirmasi;
- periksa informasi terbaru sebelum menghubungi;
- masukkan bisnis ke daftar calon klien ketika datanya sudah cukup.

## Sinkronisasi Excel

Menu: **Pengaturan → Sinkronkan Excel**.

Sinkronisasi memperbarui data sumber dan data acuan.

Untuk calon klien yang sudah berjalan, sinkronisasi tidak mereset:

- status;
- langkah berikutnya;
- catatan tim;
- kontak pertama;
- kontak terakhir;
- jadwal tindak lanjut.

Pesan kustom tidak disentuh oleh sinkronisasi.

Sinkronisasi bukan pekerjaan harian. Jalankan hanya saat data sumber memang berubah.

## Data sumber

Halaman Data Sumber berfungsi untuk audit salinan workbook. Tim pemasaran tidak perlu memakai halaman ini untuk pekerjaan harian.

## Troubleshooting

### Data tidak muncul

- pastikan sudah login;
- muat ulang halaman;
- periksa internet;
- pada instalasi baru, administrator perlu melakukan sinkronisasi awal.

### Pesan kustom gagal disimpan

Periksa:

- judul minimal 2 karakter;
- isi minimal 5 karakter;
- isi maksimal 3000 karakter;
- koneksi Firestore tersedia.

### WhatsApp tidak terbuka

Pastikan nomor WhatsApp calon klien valid.

### Tindak lanjut tidak muncul

Pastikan setelah mengirim pesan di WhatsApp pengguna kembali ke NextyLeads dan menekan **Tandai terkirim**.

## Checklist kerja harian

Sebelum mulai:

- [ ] buka Hari ini;
- [ ] cek tindak lanjut terlambat;
- [ ] cek tindak lanjut hari ini.

Saat menghubungi:

- [ ] cek informasi publik terbaru;
- [ ] sesuaikan pesan;
- [ ] kirim melalui WhatsApp;
- [ ] klik Tandai terkirim;
- [ ] tambahkan catatan jika ada informasi penting.

Sebelum selesai:

- [ ] tidak ada tindak lanjut penting yang tertinggal;
- [ ] status calon klien sudah sesuai;
- [ ] langkah berikutnya jelas.

## Catatan administrator

- autentikasi: Firebase Authentication;
- database runtime: Cloud Firestore;
- pesan kustom: `messageTemplates`;
- data acuan: `referenceData`;
- snapshot workbook: `excelSheets`.

Dokumentasi teknis tersedia di [ARCHITECTURE.md](./ARCHITECTURE.md).
