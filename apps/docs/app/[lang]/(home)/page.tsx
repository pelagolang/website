import { redirect } from 'next/navigation';
import { i18n } from '@/lib/i18n';

// The docs are the whole site; the marketing site is a separate project.
export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  redirect(lang === i18n.defaultLanguage ? '/docs' : `/${lang}/docs`);
}
