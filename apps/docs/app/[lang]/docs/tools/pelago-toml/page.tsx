import { i18n } from '@/lib/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

// `pelago.toml` became `pelago.yaml`, so the page moved from /tools/pelago-toml/ to /tools/pelago-yaml/. A static export has
// no server redirects, so the old address is a small page that sends the browser on. The link is relative, so it works
// below a base path too.
export default function Page() {
  const to = '../pelago-yaml/';
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <link rel="canonical" href={to} />
      <p>
        This page moved to <a href={to}>pelago.yaml</a>.
      </p>
    </>
  );
}
