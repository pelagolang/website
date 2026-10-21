import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred } from 'fumadocs-core/negotiation';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { docsContentRoute, docsRoute } from '@/lib/shared';
import { i18n } from '@/lib/i18n';

const i18nMiddleware = createI18nMiddleware(i18n);

// /docs/x, /docs/x.md, /ar/docs/x, /ar/docs/x.md -> the Markdown route of the same page (the locale prefix is
// explicit there, because this rewrite runs instead of the i18n middleware).
const docsPath = new RegExp(`^(?:/(${i18n.languages.join('|')}))?${docsRoute}((?:/.*?)?)(\\.md)?/?$`);

function markdownTarget(pathname: string, suffixOnly: boolean): string | undefined {
  const m = docsPath.exec(pathname);
  if (!m || (suffixOnly && !m[3])) return;
  const [, lang = i18n.defaultLanguage, rest] = m;
  return `/${lang}${docsContentRoute}${rest}/content.md`;
}

export default function proxy(request: NextRequest, event: Parameters<typeof i18nMiddleware>[1]) {
  const { pathname } = request.nextUrl;

  const bySuffix = markdownTarget(pathname, true);
  if (bySuffix) return NextResponse.rewrite(new URL(bySuffix, request.nextUrl));

  if (isMarkdownPreferred(request)) {
    const byAccept = markdownTarget(pathname, false);
    if (byAccept) {
      return NextResponse.rewrite(new URL(byAccept, request.nextUrl), {
        // this URL has two representations, selected by `Accept`
        headers: { Vary: 'Accept' },
      });
    }
  }

  return i18nMiddleware(request, event);
}

export const config = {
  // Not API routes, Next.js internals, or files served as they are (llms.txt, icons, logos).
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|brand|llms.txt|llms-full.txt).*)'],
};
