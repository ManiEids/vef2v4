import './globals.css';
import type { Metadata } from 'next';
import { BackendWaker } from '@/components/BackendWaker';
import { StarsBackground } from '@/components/StarsBackground';
// Removed ApiDiagnostics import that was causing the build error

export const metadata: Metadata = {
  title: 'verkefni 4 - vefforritun 2 - mani - quiz',
  description: 'React framendi fyrir spurningakerfi með geimþema',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="is">
      <body className="space-container">
        <StarsBackground />
        <main className="min-h-screen p-6 max-w-5xl mx-auto relative z-10">
          {children}
        </main>
        <BackendWaker />
        {/* Removed ApiDiagnostics component causing the build error */}
      </body>
    </html>
  );
}
