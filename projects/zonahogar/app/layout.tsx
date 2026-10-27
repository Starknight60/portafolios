import type { Metadata, Viewport } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';

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
    <html lang="es" className="dark">
      <body className="bg-[#080D1A] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
