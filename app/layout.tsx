import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlackJack Counter Pro',
  description: '3D Blackjack with Hi-Lo card counting training',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
