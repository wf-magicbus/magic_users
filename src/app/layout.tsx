import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magic Users - Admin Dashboard",
  description: "User management admin dashboard",
  icons: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:," />
      </head>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
