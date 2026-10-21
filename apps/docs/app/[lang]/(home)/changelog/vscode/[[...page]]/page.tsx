import { ChangelogPage } from '@/components/changelog-page';

export const revalidate = 3600;

export default async function Page(props: PageProps<'/[lang]/changelog/vscode/[[...page]]'>) {
  const { lang, page } = await props.params;
  return (
    <ChangelogPage
      owner="pelagolang"
      repo="vscode-pelago"
      basePath="/changelog/vscode"
      title="Pelago for VS Code changelog"
      intro="Releases of the VS Code extension, from GitHub."
      lang={lang}
      segments={page}
    />
  );
}
