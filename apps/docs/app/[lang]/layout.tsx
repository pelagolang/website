import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import '../global.css';
import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { i18n, rtlLanguages } from '@/lib/i18n';
import { translations } from '@/lib/layout.shared';

const outfit = localFont({
  src: '../fonts/Outfit-Variable.woff2',
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

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  const dir = rtlLanguages.includes(lang) ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir} className={outfit.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider dir={dir} i18n={i18nProvider(translations, lang)}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
