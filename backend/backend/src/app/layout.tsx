import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IFSlot — Calendário',
  description: 'Sistema de reservas de laboratórios do Instituto Federal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ height: '100%' }}>
      <body style={{ height: '100%', margin: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
