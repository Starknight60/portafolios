import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZonaHogar • Radar de Alquileres, Habitaciones y Anexos en Venezuela',
  description: 'Encuentra habitaciones, anexos independientes y residencias estudiantiles con tanque de agua, fibra óptica y trato directo con dueños.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-[#080D1A] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
