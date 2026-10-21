import { ChangelogPage } from '@/components/changelog-page';

export const revalidate = 3600;

export default async function Page(props: PageProps<'/[lang]/changelog/[[...page]]'>) {
  const { lang, page } = await props.params;
  return (
    <ChangelogPage
      owner="pelagolang"
      repo="pelago"
      basePath="/changelog"
      title="Pelago changelog"
      intro="Releases of the Pelago compiler and tool, from GitHub."
      lang={lang}
      segments={page}
    />
  );
}
