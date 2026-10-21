import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdRadar — Inteligencia Competitiva de Anuncios Publicitarios",
  description:
    "Plataforma empresarial para rastrear, analizar e inspirarse en las campañas, ofertas y anuncios de tu competencia directa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-[#070B14] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
