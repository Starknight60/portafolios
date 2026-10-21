import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenuPulse Enterprise • Radar de Inflación Oculta y Precios Delivery",
  description:
    "Plataforma B2B de inteligencia de precios gastronómicos. Audita la brecha entre el menú físico y las apps de delivery (PedidosYa, UberEats, Yummy), sobreprecios fantasma y márgenes óptimos.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍕</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-[#070A13] text-slate-100 min-h-screen selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
