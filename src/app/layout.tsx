import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AmpX Portal',
  description: 'Elite LinkedIn Command Center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Forcing absolute dark mode at the root level */}
      <body className="bg-[#09090B] text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}