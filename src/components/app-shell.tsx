"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MessageSquareText,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/features/auth/auth-context";

const primary = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: UsersRound },
  { href: "/tasks", label: "Follow-up", icon: ListTodo },
  { href: "/research", label: "Research", icon: Search },
  { href: "/templates", label: "Templates", icon: MessageSquareText },
  { href: "/growth", label: "Growth", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark brand-mark-small">N</div>
          <div>
            <strong>NextyLeads</strong>
            <span>Marketing workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {primary.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link key={item.href} href={item.href} className={clsx("nav-link", active && "active")}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-footer">
          <Link href="/settings" className={clsx("nav-link", pathname === "/settings" && "active")}>
            <Settings size={18} strokeWidth={1.8} />
            <span>Settings</span>
          </Link>
          <button className="nav-link nav-button" onClick={() => logout()}>
            <LogOut size={18} strokeWidth={1.8} />
            <span>Keluar</span>
          </button>
          <div className="sidebar-user" title={user?.email ?? ""}>
            <span className="user-dot" />
            <span>{user?.email ?? "Marketing"}</span>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
