import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import localFont from 'next/font/local';
import type { Metadata } from 'next';

const outfit = localFont({
  src: './fonts/Outfit-Variable.woff2',
  weight: '100 900',
  display: 'swap',
});

// No domain is hard-coded: SITE_URL, or Vercel's production URL, or localhost.
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: 'Pelago docs', template: '%s | Pelago docs' },
  description: 'Documentation for Pelago, a self-hosting systems language. Native code. No GC. No runtime.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
