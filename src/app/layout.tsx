import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/modules/auth/auth-context";

export const metadata: Metadata = {
  title: "NextyLeads",
  description: "Marketing workspace NextyLabs",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
