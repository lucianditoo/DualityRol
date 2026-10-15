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
  title: "Duality Rol — Accesorios Celestiales para Juegos de Rol",
  description:
    "Tienda online boutique de accesorios de rol, dados artesanales y creaciones impresas en 3D bajo una estética de fantasía cósmica. Retiro acordado en Argentina.",
  icons: {
    icon: "/brand/logo_only.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-obsidian-900 text-celestial-ivory font-sans selection:bg-gold-500 selection:text-obsidian-950">
        {children}
      </body>
    </html>
  );
}
