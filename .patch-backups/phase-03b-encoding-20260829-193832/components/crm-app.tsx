"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "./auth-provider";
import { listOwned } from "@/lib/repository";
import type { Activity, FollowUp, Lead, Message, Template } from "@/lib/types";
import { Sidebar, viewTitle } from "./workspace/sidebar";
import { DashboardView } from "./workspace/dashboard-view";
import { LeadsView } from "./workspace/leads-view";
import { FollowupsView } from "./workspace/followups-view";
import { TemplatesView } from "./workspace/templates-view";
import { AnalyticsView } from "./workspace/analytics-view";
import { LeadDialog } from "./workspace/lead-dialog";
import { TemplateDialog } from "./workspace/template-dialog";
import { ImportDialog } from "./workspace/import-dialog";

export function CrmApp({ view }: { view: string }) {
  const { user, loading, configured } = useAuth();
  const [menu, setMenu] = useState(false),
    [dialog, setDialog] = useState<string | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]),
    [templates, setTemplates] = useState<Template[]>([]),
    [messages, setMessages] = useState<Message[]>([]),
    [followups, setFollowups] = useState<FollowUp[]>([]),
    [activities, setActivities] = useState<Activity[]>([]);
  async function refresh() {
    if (!user) return;
    try {
      setBusy(true);
      setError("");
      const data = await Promise.all([
        listOwned<Lead>("leads", user.uid),
        listOwned<Template>("templates", user.uid),
        listOwned<Message>("messages", user.uid),
        listOwned<FollowUp>("followups", user.uid),
        listOwned<Activity>("activities", user.uid),
      ]);
      setLeads(data[0]);
      setTemplates(data[1]);
      setMessages(data[2]);
      setFollowups(data[3]);
      setActivities(data[4]);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Data belum bisa dimuat.",
      );
    } finally {
      setBusy(false);
    }
  }
  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 5000);
  }
  useEffect(() => {
    if (!loading && !user) location.href = "/login";
    if (user) refresh();
  }, [user, loading]);
  if (loading || (busy && !user))
    return <main className="center-state">Menyiapkan ruang kerjaâ€¦</main>;
  if (!configured)
    return (
      <main className="center-state">
        <div>
          <h2>Firebase belum tersambung</h2>
          <p>
            Lengkapi file <code>.env.local</code>, lalu jalankan kembali
            aplikasi.
          </p>
        </div>
      </main>
    );
  if (!user) return null;
  const common = { onRefresh: refresh, notify };
  return (
    <div className="app-shell">
      <Sidebar view={view} open={menu} onClose={() => setMenu(false)} />
      <main className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div>
            <p>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1>{viewTitle(view)}</h1>
          </div>
          <div className="top-actions">
            <div className="avatar">N</div>
          </div>
        </header>
        {error && <div className="banner error-box">{error}</div>}
        <section className="content">
          {view === "dashboard" && (
            <DashboardView
              leads={leads}
              followups={followups}
              activities={activities}
              messages={messages}
              onAdd={() => setDialog("lead")}
            />
          )}{" "}
          {view === "leads" && (
            <LeadsView
              ownerId={user.uid}
              leads={leads}
              templates={templates}
              messages={messages}
              onAdd={() => setDialog("lead")}
              onImport={() => setDialog("import")}
              {...common}
            />
          )}{" "}
          {view === "follow-up" && (
            <FollowupsView
              ownerId={user.uid}
              items={followups}
              leads={leads}
              {...common}
            />
          )}{" "}
          {view === "templates" && (
            <TemplatesView
              ownerId={user.uid}
              templates={templates}
              onAdd={() => setDialog("template")}
              {...common}
            />
          )}{" "}
          {view === "analytics" && <AnalyticsView leads={leads} />}{" "}
          {view === "settings" && <SettingsView email={user.email || "â€”"} />}
        </section>
      </main>
      {dialog === "lead" && (
        <LeadDialog
          ownerId={user.uid}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            notify("Calon klien baru sudah masuk ke daftar.");
            refresh();
          }}
        />
      )}
      {dialog === "template" && (
        <TemplateDialog
          ownerId={user.uid}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            notify("Pesan siap pakai sudah disimpan.");
            refresh();
          }}
        />
      )}
      {dialog === "import" && (
        <ImportDialog
          ownerId={user.uid}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            refresh();
          }}
          notify={notify}
        />
      )}{" "}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function SettingsView({ email }: { email: string }) {
  return (
    <div className="dashboard-grid">
      <section className="panel">
        <div className="panel-title">
          <h3>Akun masuk</h3>
        </div>
        <dl className="settings-list">
          <div>
            <dt>Email</dt>
            <dd>{email}</dd>
          </div>
          <div>
            <dt>Akses</dt>
            <dd>1 akun marketing</dd>
          </div>
        </dl>
      </section>
      <section className="panel">
        <div className="panel-title">
          <h3>Cara pengiriman WhatsApp</h3>
        </div>
        <div className="connection ok">
          <b>Tanpa Meta API</b>
          <p>
            Tombol kirim membuka WhatsApp Web atau aplikasi WhatsApp dengan
            pesan yang sudah terisi. Pesan dikirim dari akun yang sedang aktif
            di perangkat, jadi pastikan perangkat login menggunakan WhatsApp
            Nexty.
          </p>
          <p>
            Sistem tidak dapat membaca status kirim atau balasan. Setelah
            menekan Send di WhatsApp, kembali ke sistem dan pilih{" "}
            <b>Sudah dikirim</b>.
          </p>
        </div>
      </section>
    </div>
  );
}
