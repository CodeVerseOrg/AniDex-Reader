import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { Navbar, Footer } from '@/components/layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AniDex Reader - Read Manga Online Free',
  description: 'A modern manga reading website powered by Comick and AniList. Read your favorite manga for free with a clean, modern interface.',
  keywords: ['manga', 'read manga', 'manga online', 'free manga', 'anime', 'manhwa', 'manhua'],
  authors: [{ name: 'AniDex Reader' }],
  openGraph: {
    title: 'AniDex Reader',
    description: 'Read manga online for free',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AniDex Reader',
    description: 'Read manga online for free',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-dark-950 text-white min-h-screen`} suppressHydrationWarning>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
