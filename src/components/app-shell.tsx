"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MessageSquareText,
  Search,
  Settings,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/modules/auth/auth-context";

const primaryNav = [
  { href: "/dashboard", label: "Hari ini", icon: LayoutDashboard },
  { href: "/leads", label: "Daftar calon klien", icon: UsersRound },
  { href: "/research", label: "Cari calon klien", icon: Search },
  { href: "/tasks", label: "Tindak lanjut", icon: ListTodo },
  { href: "/templates", label: "Contoh pesan", icon: MessageSquareText },
  { href: "/growth", label: "Rencana pertumbuhan", icon: TrendingUp },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
];

function getInitials(email?: string | null) {
  const value = (email || "TM").trim();
  const name = value.split("@")[0] || "TM";
  const parts = name.split(/[._-]+/).filter(Boolean);
  return (parts[0]?.[0] || "T") + (parts[1]?.[0] || "M");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link href="/dashboard" className="sidebar-brand" aria-label="Buka halaman Hari ini">
          <div className="brand-mark brand-mark-small">N</div>
          <div>
            <strong className="brand-wordmark">Nexty<span>Leads</span></strong>
            <span>by NextyLabs</span>
          </div>
        </Link>

        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx("nav-link", isActive(item.href) && "active")}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <Link href="/guide" className={clsx("nav-link", isActive("/guide") && "active")}>
            <BookOpen size={17} strokeWidth={1.8} />
            <span>Panduan</span>
          </Link>
          <Link href="/settings" className={clsx("nav-link", isActive("/settings") && "active")}>
            <Settings size={17} strokeWidth={1.8} />
            <span>Pengaturan</span>
          </Link>

          <div className="sidebar-account">
            <div className="sidebar-avatar">{getInitials(user?.email).toUpperCase()}</div>
            <div className="sidebar-account-copy">
              <strong>Tim Marketing</strong>
              <span title={user?.email ?? ""}>{user?.email ?? "NextyLabs"}</span>
            </div>
            <button className="sidebar-logout" onClick={() => logout()} aria-label="Keluar">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
