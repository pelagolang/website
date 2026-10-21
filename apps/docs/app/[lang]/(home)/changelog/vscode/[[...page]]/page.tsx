import { ChangelogPage, changelogParams } from '@/components/changelog-page';

export const dynamicParams = false;

export function generateStaticParams() {
  return changelogParams('pelagolang', 'vscode-pelago');
}

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
