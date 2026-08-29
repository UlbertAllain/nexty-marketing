import { metrics } from "@/lib/business";
import type { Lead } from "@/lib/types";
import { Title } from "./dashboard-view";

export function AnalyticsView({ leads }: { leads: Lead[] }) {
  const m = metrics(leads);
  const categories = Object.entries(
    leads.reduce<Record<string, number>>((all, lead) => {
      all[lead.category] = (all[lead.category] || 0) + 1;
      return all;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <div className="hero-row compact analytics-hero">
        <div>
          <span className="eyebrow">HASIL MARKETING</span>
          <h2>Lihat hasil tanpa tenggelam di angka.</h2>
          <p>
            Ringkasan sederhana untuk melihat apakah outreach bergerak ke arah
            yang benar.
          </p>
        </div>
      </div>

      <div className="stats analytics">
        <Stat
          label="Sudah dihubungi"
          value={m.contacted}
          note="pesan ditandai terkirim"
        />
        <Stat
          label="Tingkat balasan"
          value={m.responseRate}
          note="berdasarkan progres yang dicatat"
          percent
        />
        <Stat
          label="Konversi"
          value={m.conversionRate}
          note="dari seluruh calon klien"
          percent
        />
        <Stat
          label="Berhasil jadi klien"
          value={m.deal}
          note="hasil akhir yang dicatat"
        />
      </div>

      <section className="panel analytics-panel">
        <Title title="Calon klien menurut jenis usaha" />
        <div className="category-bars">
          {categories.map(([category, count]) => (
            <div key={category}>
              <span>{category}</span>
              <i>
                <b
                  style={{
                    width: `${(count / Math.max(1, leads.length)) * 100}%`,
                  }}
                />
              </i>
              <strong>{count}</strong>
            </div>
          ))}
          {!categories.length && (
            <p className="empty-inline">Belum ada data untuk diringkas.</p>
          )}
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  note,
  percent,
}: {
  label: string;
  value: number;
  note: string;
  percent?: boolean;
}) {
  return (
    <article className="stat">
      <p>{label}</p>
      <b>
        {value}
        {percent && "%"}
      </b>
      <small>{note}</small>
    </article>
  );
}
