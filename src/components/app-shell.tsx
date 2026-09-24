"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
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

const navGroups = [
  {
    label: "Kerja harian",
    items: [
      { href: "/dashboard", label: "Hari ini", icon: LayoutDashboard },
      { href: "/leads", label: "Daftar lead", icon: UsersRound },
      { href: "/tasks", label: "Follow-up", icon: ListTodo },
    ],
  },
  {
    label: "Persiapan",
    items: [
      { href: "/research", label: "Cari prospect", icon: Search },
      { href: "/templates", label: "Template pesan", icon: MessageSquareText },
    ],
  },
  {
    label: "Analisis",
    items: [
      { href: "/growth", label: "Growth plan", icon: TrendingUp },
      { href: "/reports", label: "Laporan", icon: BarChart3 },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link href="/dashboard" className="sidebar-brand" aria-label="Buka halaman Hari ini">
          <div className="brand-mark brand-mark-small">N</div>
          <div>
            <strong>NextyLeads</strong>
            <span>Tim Marketing NextyLabs</span>
          </div>
        </Link>

        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link key={item.href} href={item.href} className={clsx("nav-link", active && "active")}>
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <Link href="/settings" className={clsx("nav-link", pathname === "/settings" && "active")}>
            <Settings size={18} strokeWidth={1.8} />
            <span>Pengaturan</span>
          </Link>
          <button className="nav-link nav-button" onClick={() => logout()}>
            <LogOut size={18} strokeWidth={1.8} />
            <span>Keluar</span>
          </button>
          <div className="sidebar-user" title={user?.email ?? ""}>
            <span className="user-dot" />
            <span>{user?.email ?? "Tim Marketing"}</span>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
