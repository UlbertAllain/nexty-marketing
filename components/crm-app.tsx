"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Menu } from "lucide-react";
import { useAuth } from "./auth-provider";
import { listOwned, listOwnedByField } from "@/lib/repository";
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
  const [menu, setMenu] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  async function refresh() {
    if (!user) return;

    try {
      setBusy(true);
      setError("");

      const loadLeads = () => listOwned<Lead>("leads", user.uid, 5000);
      const loadTemplates = () =>
        listOwned<Template>("templates", user.uid, 250);
      const loadDraftMessages = () =>
        listOwnedByField<Message>("messages", user.uid, "status", "DRAFT", 5000);
      const loadActiveFollowups = () =>
        listOwnedByField<FollowUp>(
          "followups",
          user.uid,
          "status",
          "ACTIVE",
          5000,
        );

      if (view === "dashboard") {
        const [nextLeads, nextFollowups, nextMessages, nextActivities] =
          await Promise.all([
            loadLeads(),
            loadActiveFollowups(),
            loadDraftMessages(),
            listOwned<Activity>("activities", user.uid, 100),
          ]);
        setLeads(nextLeads);
        setFollowups(nextFollowups);
        setMessages(nextMessages);
        setActivities(nextActivities);
      } else if (view === "leads") {
        const [nextLeads, nextTemplates, nextMessages] = await Promise.all([
          loadLeads(),
          loadTemplates(),
          loadDraftMessages(),
        ]);
        setLeads(nextLeads);
        setTemplates(nextTemplates);
        setMessages(nextMessages);
      } else if (view === "follow-up") {
        const [nextLeads, nextFollowups] = await Promise.all([
          loadLeads(),
          loadActiveFollowups(),
        ]);
        setLeads(nextLeads);
        setFollowups(nextFollowups);
      } else if (view === "templates") {
        setTemplates(await loadTemplates());
      } else if (view === "analytics") {
        setLeads(await loadLeads());
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Data belum bisa dimuat.",
      );
    } finally {
      setBusy(false);
      setReady(true);
    }
  }

  function notify(text: string) {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    setToast(text);
    toastTimer.current = window.setTimeout(() => {
      setToast("");
      toastTimer.current = null;
    }, 5000);
  }

  useEffect(() => {
    if (!loading && configured && !user) location.href = "/login";
    if (user) refresh();
  }, [user, loading, configured, view]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  if (loading) {
    return (
      <main className="center-state">
        <div className="loading-state" role="status" aria-live="polite">
          <LoaderCircle className="loading-spinner" size={25} />
          <div>
            <b>Menyiapkan ruang kerja</b>
            <p>Menghubungkan akun dan data marketing...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!configured) {
    return (
      <main className="center-state">
        <div className="state-card">
          <span className="eyebrow">KONFIGURASI</span>
          <h2>Firebase belum tersambung</h2>
          <p>
            Lengkapi file <code>.env.local</code>, lalu jalankan kembali
            aplikasi.
          </p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  if (!ready) {
    return (
      <main className="center-state">
        <div className="loading-state" role="status" aria-live="polite">
          <LoaderCircle className="loading-spinner" size={25} />
          <div>
            <b>Memuat data marketing</b>
            <p>Menyiapkan calon klien, pengingat, dan aktivitas terbaru...</p>
          </div>
        </div>
      </main>
    );
  }

  const common = { onRefresh: refresh, notify };

  return (
    <div className="app-shell">
      <Sidebar view={view} open={menu} onClose={() => setMenu(false)} />
      <main className="workspace">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenu(true)}
            aria-label="Buka menu"
          >
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
            {busy && (
              <span className="sync-state" role="status" aria-live="polite">
                <LoaderCircle size={13} />
                Menyinkronkan
              </span>
            )}
            <div className="avatar" aria-label="Akun Nexty">
              N
            </div>
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
          )}

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
          )}

          {view === "follow-up" && (
            <FollowupsView
              ownerId={user.uid}
              items={followups}
              leads={leads}
              {...common}
            />
          )}

          {view === "templates" && (
            <TemplatesView
              ownerId={user.uid}
              templates={templates}
              onAdd={() => setDialog("template")}
              {...common}
            />
          )}

          {view === "analytics" && <AnalyticsView leads={leads} />}
          {view === "settings" && <SettingsView email={user.email || "-"} />}
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
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
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
            menekan Send di WhatsApp, kembali ke sistem dan pilih <b>Sudah dikirim</b>.
          </p>
        </div>
      </section>
    </div>
  );
}
