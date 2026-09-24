"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { createLead } from "@/modules/leads/repository";

export default function NewLeadPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ business: "", niche: "", phone: "", area: "", recommendedOffer: "Business Digital Audit" });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const id = await createLead(form);
      router.push(`/leads/${id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Lead baru" title="Tambah lead secara manual" description="Isi yang penting dulu. Research detail bisa dilengkapi dari halaman lead." />
      <form className="panel form-card" onSubmit={submit}>
        <div className="form-grid two">
          <label className="field"><span>Nama bisnis</span><input required value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} /></label>
          <label className="field"><span>Kategori / niche</span><input required value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="Rental / Transport" /></label>
          <label className="field"><span>Nomor WhatsApp</span><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62…" /></label>
          <label className="field"><span>Area</span><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Surakarta" /></label>
          <label className="field full"><span>Offer awal</span><input value={form.recommendedOffer} onChange={(e) => setForm({ ...form, recommendedOffer: e.target.value })} /></label>
        </div>
        <div className="form-actions"><Button type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Simpan lead"}</Button></div>
      </form>
    </>
  );
}
