"use client";

import {
  BarChart3,
  CalendarClock,
  CircleGauge,
  LayoutTemplate,
  LogOut,
  Settings,
  UsersRound,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebase";

const items = [
  { id: "dashboard", href: "/dashboard", label: "Beranda kerja", icon: CircleGauge },
  { id: "leads", href: "/leads", label: "Calon klien", icon: UsersRound },
  { id: "follow-up", href: "/follow-up", label: "Pengingat", icon: CalendarClock },
  { id: "templates", href: "/templates", label: "Pesan siap pakai", icon: LayoutTemplate },
  { id: "analytics", href: "/analytics", label: "Hasil marketing", icon: BarChart3 },
];

export function Sidebar({
  view,
  open,
  onClose,
}: {
  view: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <aside className={open ? "sidebar open" : "sidebar"}>
      <div className="sidebar-brand">
        <span>N</span>
        <div>
          <b>NEXTY LABS</b>
          <small>Marketing Desk</small>
        </div>
        <button aria-label="Tutup menu" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-label">WORKSPACE</div>
      <nav>
        {items.map((item) => (
          <a
            key={item.id}
            className={view === item.id ? "active" : ""}
            href={item.href}
          >
            <item.icon size={18} />
            {item.label}
          </a>
        ))}
      </nav>

      <div className="sidebar-note">
        <span>WORKFLOW RINGAN</span>
        <p>Catat seperlunya, lalu kembali fokus menghubungi calon klien.</p>
      </div>

      <div className="sidebar-bottom">
        <a href="/settings">
          <Settings size={18} />
          Pengaturan
        </a>
        <button onClick={() => auth && auth.signOut()}>
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}

export const viewTitle = (view: string) =>
  items.find((item) => item.id === view)?.label || "Marketing Workspace";
