import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ListTodo,
  MessageSquareText,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

const statusItems = [
  ["Baru", "Calon klien baru yang belum diproses."],
  ["Siap dihubungi", "Data sudah cukup dan calon klien siap dikontak."],
  ["Sudah dihubungi", "Pesan pertama sudah dikirim."],
  ["Sudah membalas", "Calon klien sudah memberi respons."],
  ["Tertarik", "Ada minat dan pembicaraan bisa dilanjutkan."],
  ["Pertemuan", "Sudah masuk tahap pertemuan atau penggalian kebutuhan."],
  ["Proposal", "Proposal sudah disiapkan atau dikirim."],
  ["Berhasil", "Calon klien sudah menjadi klien."],
  ["Tidak lanjut", "Proses berhenti dan tidak dilanjutkan."],
  ["Tindak lanjut nanti", "Belum sekarang, tetapi perlu dihubungi kembali."],
];

export default function GuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Panduan pengguna"
        title="Cara menggunakan NextyLeads"
        description="Panduan praktis untuk tim pemasaran. Mulai dari pekerjaan harian, mengelola calon klien, menindaklanjuti pesan, sampai membaca laporan."
      />

      <section className="guide-start">
        <div>
          <p className="eyebrow">Mulai cepat</p>
          <h2>Kalau baru pertama kali buka, cukup ikuti 3 langkah ini</h2>
        </div>
        <div className="guide-step-grid">
          <Link href="/tasks" className="guide-step-card">
            <span>1</span>
            <div><strong>Bereskan tindak lanjut</strong><p>Utamakan yang terlambat, lalu yang jatuh tempo hari ini.</p></div>
            <ArrowRight size={16} />
          </Link>
          <Link href="/leads" className="guide-step-card">
            <span>2</span>
            <div><strong>Hubungi calon klien prioritas</strong><p>Mulai dari Prioritas A dan cek langkah berikutnya.</p></div>
            <ArrowRight size={16} />
          </Link>
          <Link href="/research" className="guide-step-card">
            <span>3</span>
            <div><strong>Cari calon klien baru</strong><p>Lakukan setelah pekerjaan yang punya tenggat selesai.</p></div>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <nav className="guide-toc" aria-label="Daftar isi panduan">
        <a href="#alur-harian">Alur harian</a>
        <a href="#menu">Fungsi menu</a>
        <a href="#calon-klien">Calon klien</a>
        <a href="#pesan">Contoh pesan</a>
        <a href="#tindak-lanjut">Tindak lanjut</a>
        <a href="#riset">Riset</a>
        <a href="#laporan">Laporan</a>
        <a href="#sinkronisasi">Sinkronisasi</a>
        <a href="#status">Status</a>
        <a href="#faq">FAQ</a>
      </nav>

      <section className="panel guide-section" id="alur-harian">
        <p className="eyebrow">Alur harian</p>
        <h2>Urutan kerja yang disarankan</h2>
        <div className="guide-numbered-list">
          <div><span>1</span><p>Buka <strong>Hari ini</strong> untuk melihat pekerjaan yang paling mendesak.</p></div>
          <div><span>2</span><p>Selesaikan <strong>Tindak lanjut terlambat</strong> terlebih dahulu.</p></div>
          <div><span>3</span><p>Selesaikan tindak lanjut yang jatuh tempo <strong>hari ini</strong>.</p></div>
          <div><span>4</span><p>Hubungi <strong>calon klien Prioritas A</strong> yang belum pernah dikontak.</p></div>
          <div><span>5</span><p>Kalau daftar mulai menipis, buka <strong>Cari calon klien</strong> untuk menambah target baru.</p></div>
          <div><span>6</span><p>Sebelum selesai kerja, pastikan tidak ada tindak lanjut penting yang tertinggal.</p></div>
        </div>
      </section>

      <section className="guide-section" id="menu">
        <p className="eyebrow">Fungsi menu</p>
        <h2>Menu mana dipakai untuk apa?</h2>
        <div className="guide-menu-grid">
          <GuideMenu icon={<CheckCircle2 size={18} />} title="Hari ini" text="Pusat pekerjaan harian dan urutan prioritas." />
          <GuideMenu icon={<UsersRound size={18} />} title="Daftar calon klien" text="Melihat semua calon klien, status, prioritas, dan langkah berikutnya." />
          <GuideMenu icon={<ListTodo size={18} />} title="Tindak lanjut" text="Melihat siapa yang terlambat, harus dihubungi hari ini, dan jadwal berikutnya." />
          <GuideMenu icon={<Search size={18} />} title="Cari calon klien" text="Riset calon bisnis baru, media sosial, dan sumber informasi." />
          <GuideMenu icon={<MessageSquareText size={18} />} title="Contoh pesan" text="Contoh bawaan serta pesan kustom milik tim." />
          <GuideMenu icon={<BarChart3 size={18} />} title="Laporan" text="Melihat perkembangan pemasaran dan evaluasi berkala." />
          <GuideMenu icon={<Settings size={18} />} title="Pengaturan" text="Untuk administrator: sinkronisasi data dan pengecekan sumber." />
        </div>
      </section>

      <section className="panel guide-section" id="calon-klien">
        <p className="eyebrow">Daftar calon klien</p>
        <h2>Cara mengelola satu calon klien</h2>
        <p>Buka nama bisnis untuk melihat informasi lengkap. Di halaman detail, lakukan pekerjaan berikut:</p>
        <div className="guide-check-list">
          <p>Periksa situs web, media sosial, dan informasi publik sebelum mengirim pesan.</p>
          <p>Baca ringkasan riset untuk memahami konteks bisnis.</p>
          <p>Sesuaikan pesan sebelum membuka WhatsApp.</p>
          <p>Setelah pesan benar-benar terkirim, klik <strong>Tandai terkirim</strong>.</p>
          <p>Perbarui status, langkah berikutnya, dan catatan tim kalau ada perubahan penting.</p>
        </div>
        <div className="guide-note">
          <strong>Prioritas:</strong> A adalah yang paling layak dikerjakan lebih dulu, B menengah, C lebih rendah. Prioritas membantu menentukan urutan kerja, bukan jaminan calon klien akan membeli.
        </div>
      </section>

      <section className="panel guide-section" id="pesan">
        <p className="eyebrow">Contoh pesan</p>
        <h2>Contoh bawaan dan pesan kustom</h2>
        <p><strong>Contoh bawaan</strong> adalah referensi dari sistem dan tidak diedit langsung. <strong>Pesan kustom</strong> adalah milik tim dan bisa dibuat, diedit, disalin, atau dihapus kapan saja.</p>
        <div className="guide-numbered-list">
          <div><span>1</span><p>Buka <strong>Contoh pesan → Pesan kustom</strong>.</p></div>
          <div><span>2</span><p>Klik <strong>Tambah pesan</strong>.</p></div>
          <div><span>3</span><p>Isi judul, kategori, kapan pesan dipakai, dan isi pesan.</p></div>
          <div><span>4</span><p>Klik <strong>Simpan pesan</strong>. Data langsung tersimpan di Firestore.</p></div>
          <div><span>5</span><p>Gunakan tombol edit untuk memperbarui dan tombol hapus untuk menghapus pesan.</p></div>
        </div>
        <div className="guide-note">
          Pesan kustom tidak tertimpa saat administrator menekan <strong>Sinkronkan Excel</strong>.
        </div>
      </section>

      <section className="panel guide-section" id="tindak-lanjut">
        <p className="eyebrow">Tindak lanjut</p>
        <h2>Jangan kehilangan calon klien karena lupa menghubungi</h2>
        <p>Setelah pesan pertama ditandai terkirim, NextyLeads otomatis membuat jadwal tindak lanjut berikutnya. Halaman Tindak lanjut dibagi menjadi tiga bagian: terlambat, hari ini, dan jadwal berikutnya.</p>
        <div className="guide-note">
          Membuka WhatsApp tidak berarti pesan sudah terkirim. Klik <strong>Tandai terkirim</strong> hanya setelah pesan benar-benar dikirim.
        </div>
      </section>

      <section className="panel guide-section" id="riset">
        <p className="eyebrow">Riset</p>
        <h2>Cara menggunakan data riset dengan benar</h2>
        <p>Data publik dipakai sebagai bahan pembuka, bukan sebagai kepastian tentang proses internal perusahaan.</p>
        <div className="guide-check-list">
          <p>Gunakan informasi yang benar-benar terlihat dari sumber publik.</p>
          <p>Jangan menyimpulkan bahwa proses mereka manual hanya karena sistemnya tidak terlihat di internet.</p>
          <p>Periksa kembali informasi terbaru sebelum menghubungi.</p>
          <p>Kalau datanya sudah cukup, masukkan bisnis ke daftar calon klien.</p>
        </div>
      </section>

      <section className="panel guide-section" id="laporan">
        <p className="eyebrow">Laporan</p>
        <h2>Gunakan untuk evaluasi, bukan untuk pekerjaan harian</h2>
        <p>Halaman laporan membantu melihat jumlah calon klien per status, tindak lanjut yang tertinggal, target 30 hari, evaluasi mingguan, dan arus kas. Untuk pekerjaan harian tetap mulai dari menu Hari ini.</p>
      </section>

      <section className="panel guide-section" id="sinkronisasi">
        <p className="eyebrow">Untuk administrator</p>
        <h2>Sinkronisasi data Excel</h2>
        <p>Menu <strong>Pengaturan → Sinkronkan Excel</strong> digunakan untuk memperbarui data riset dan data acuan dari sumber Excel.</p>
        <div className="guide-check-list">
          <p>Status calon klien yang sedang berjalan tidak direset.</p>
          <p>Catatan tim dan riwayat kontak tidak dihapus.</p>
          <p>Pesan kustom tidak disentuh oleh sinkronisasi.</p>
          <p>Data sumber asli tetap tersedia untuk audit.</p>
        </div>
        <div className="guide-warning">
          Sinkronisasi bukan pekerjaan harian. Jalankan hanya saat memang ada pembaruan sumber data.
        </div>
      </section>

      <section className="panel guide-section" id="status">
        <p className="eyebrow">Status calon klien</p>
        <h2>Arti setiap status</h2>
        <div className="guide-status-grid">
          {statusItems.map(([title, text]) => (
            <div key={title}><strong>{title}</strong><p>{text}</p></div>
          ))}
        </div>
      </section>

      <section className="panel guide-section" id="faq">
        <p className="eyebrow">FAQ</p>
        <h2>Pertanyaan yang sering muncul</h2>
        <div className="guide-faq">
          <details><summary>Kenapa pesan WhatsApp tidak dianggap terkirim otomatis?</summary><p>Karena sistem hanya membuka WhatsApp. NextyLeads tidak bisa memastikan tombol Kirim di WhatsApp benar-benar ditekan. Setelah mengirim, kembali dan klik Tandai terkirim.</p></details>
          <details><summary>Apakah contoh pesan harus dikirim persis seperti yang ada?</summary><p>Tidak. Sesuaikan dengan konteks bisnis. Pesan yang terasa personal lebih baik daripada menyalin template mentah.</p></details>
          <details><summary>Apakah pesan kustom akan hilang saat sinkronisasi?</summary><p>Tidak. Pesan kustom disimpan di koleksi terpisah dan tidak ditimpa data Excel.</p></details>
          <details><summary>Kapan harus mencari calon klien baru?</summary><p>Setelah tindak lanjut yang terlambat dan pekerjaan hari ini selesai, atau saat jumlah calon klien aktif mulai menipis.</p></details>
          <details><summary>Siapa yang boleh membuka Pengaturan?</summary><p>Sebaiknya administrator atau pengelola sistem. Tim pemasaran tidak perlu menjalankan sinkronisasi untuk pekerjaan harian.</p></details>
        </div>
      </section>
    </>
  );
}

function GuideMenu({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="guide-menu-card">
      <div>{icon}</div>
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}
