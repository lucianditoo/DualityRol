import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Duality Rol — Panel de Administración",
  description: "Panel privado de gestión comercial, inventario y retiros para Duality Rol",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-obsidian-900 text-celestial-ivory font-sans antialiased selection:bg-gold-500 selection:text-obsidian-950">
        {children}
      </body>
    </html>
  );
}
