import type { Metadata, Viewport } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: 'ChambaCerca | Radar de Oportunidades Laborales por Proximidad',
  description: 'Descubre comercios, empresas y vacantes reales que buscan personal cerca de ti. Sin registros obligatorios, enfocado en empleo local y de proximidad.',
  keywords: ['empleo cerca', 'chamba', 'trabajo por proximidad', 'vacantes locales', 'radar de empleo', 'Caracas', 'empleo sin intermediarios'],
  authors: [{ name: 'ChambaCerca' }],
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
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22%20width=%2232%22%20height=%2232%22><circle%20cx=%2216%22%20cy=%2216%22%20r=%2214%22%20fill=%22%2310B981%22/><text%20x=%2216%22%20y=%2222%22%20font-size=%2216%22%20text-anchor=%22middle%22%20fill=%22white%22%20font-family=%22sans-serif%22%20font-weight=%22bold%22>C</text></svg>" />
      </head>
      <body className="min-h-screen bg-[#080D15] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
