"use client";

import { useState } from "react";
import { MapPin, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/modules/auth/auth-context";
import {
  DISCOVERY_AREAS,
  DISCOVERY_CATEGORIES,
  type DiscoveryArea,
  type DiscoveryCategory,
} from "@/modules/discovery/discovery.constants";
import { requestTargetDiscovery } from "@/modules/discovery/discovery.client";
import type { DiscoveryRunResult } from "@/modules/discovery/discovery.types";

export function TargetDiscoveryPanel() {
  const { user } = useAuth();
  const [area, setArea] = useState<DiscoveryArea>("Solo Raya");
  const [category, setCategory] = useState<DiscoveryCategory>("Semua kategori potensial");
  const [maxCandidates, setMaxCandidates] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DiscoveryRunResult | null>(null);

  async function runDiscovery() {
    if (!user || busy) return;
    setBusy(true);
    setError("");

    try {
      const idToken = await user.getIdToken();
      setResult(await requestTargetDiscovery({ area, category, maxCandidates }, idToken));
    } catch (discoveryError) {
      setError(discoveryError instanceof Error ? discoveryError.message : "AI Target Discovery gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel discovery-panel">
      <div className="discovery-panel-head">
        <div>
          <p className="eyebrow">AI Target Discovery</p>
          <h2>Temukan calon klien baru dari pasar lokal</h2>
          <p className="panel-description">
            Cari bisnis publik, cek jejak digitalnya, dan simpan hasilnya ke ruang audit sebelum kandidat dipilih masuk ke daftar calon klien.
          </p>
        </div>
        <span className="discovery-ai-pill"><Sparkles size={13} />AI #2</span>
      </div>

      <div className="discovery-controls">
        <label>
          <span>Wilayah</span>
          <div className="discovery-select-wrap">
            <MapPin size={14} />
            <select value={area} onChange={(event) => setArea(event.target.value as DiscoveryArea)}>
              {DISCOVERY_AREAS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </label>

        <label>
          <span>Kategori target</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as DiscoveryCategory)}>
            {DISCOVERY_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          <span>Maks. kandidat</span>
          <select value={maxCandidates} onChange={(event) => setMaxCandidates(Number(event.target.value))}>
            <option value={5}>5 bisnis</option>
            <option value={10}>10 bisnis</option>
            <option value={15}>15 bisnis</option>
          </select>
        </label>

        <button className="button discovery-run-button" disabled={busy || !user} onClick={runDiscovery}>
          {busy ? <span className="discovery-spinner" /> : <Search size={16} />}
          {busy ? "Sedang mencari…" : "Cari target dengan AI"}
        </button>
      </div>

      <p className="discovery-note">
        Discovery bekerja per batch dari sumber publik. Hasil bukan daftar seluruh
        bisnis yang ada di wilayah tersebut. Semua hasil disimpan dulu di tab Hasil discovery untuk diaudit.
      </p>

      {error ? <div className="discovery-error">{error}</div> : null}

      {result ? (
        <div className="discovery-summary">
          <div><strong>{result.inserted}</strong><span>Hasil baru</span></div>
          <div><strong>{result.duplicates}</strong><span>Duplikat dilewati</span></div>
          <div><strong>{result.searchedSources}</strong><span>Sumber diperiksa</span></div>
          <div><strong>{result.analyzedCandidates}</strong><span>Kandidat dianalisis</span></div>
          <p>
            Hasil baru disimpan di tab <strong>Hasil discovery</strong>. Audit dulu datanya,
            lalu pilih <strong>Masukkan ke daftar</strong> hanya untuk bisnis yang benar-benar ingin diprospek.
          </p>
        </div>
      ) : null}
    </section>
  );
}
