import { redirect } from 'next/navigation';

// The docs are the whole site; the marketing site is a separate project.
export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  redirect(`/${lang}/docs`);
}
