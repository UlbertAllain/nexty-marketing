import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nexty Leads",
    template: "%s - Nexty Leads",
  },
  description:
    "Ruang kerja sederhana untuk menyiapkan pesan WhatsApp, menandai calon klien yang sudah dihubungi, dan membuat pengingat.",
  icons: {
    icon: "/brand/nexty-leads-logo.png",
    shortcut: "/brand/nexty-leads-logo.png",
    apple: "/brand/nexty-leads-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
