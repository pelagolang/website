import { i18n } from '@/lib/i18n';

export const dynamic = 'force-static';

// The site root has no language yet (a static export has no middleware): send it to the default one. The link is
// relative, so it works below a base path too.
export function GET() {
  const to = `./${i18n.defaultLanguage}/docs/`;
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Pelago docs</title><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><a href="${to}">Pelago docs</a>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}
