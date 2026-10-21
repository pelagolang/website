import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { generateOGImage } from 'fumadocs-ui/og';
import { i18n } from '@/lib/i18n';
import { appName, getPageImageUrl } from '@/lib/shared';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/[lang]/og/docs/[...slug]'>) {
  const { slug } = await params;
  // The card font has no Arabic, Chinese or Cyrillic glyphs (Arabic even fails the build), so every language shows
  // the English title.
  const page = source.getPage(slug.slice(0, -1), i18n.defaultLanguage);
  if (!page) notFound();

  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: appName,
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}
