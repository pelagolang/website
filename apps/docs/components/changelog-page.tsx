import { githubReleases } from '@fumadocs/changelog/github';
import { ChangelogPagination, ChangelogTimeline } from '@/components/changelog';
import { i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

interface Props {
  owner: string;
  repo: string;
  /** path of this changelog without the language prefix, e.g. `/changelog` */
  basePath: string;
  title: string;
  intro: string;
  lang: string;
  segments?: string[];
}

/** One page of a project's GitHub releases. The page shows an empty state while the project has none. */
export async function ChangelogPage({ owner, repo, basePath, title, intro, lang, segments = [] }: Props) {
  const page = Number(segments[0] ?? 1);
  if (segments.length > 1 || !Number.isInteger(page) || page < 1) notFound();

  const prefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;
  const href = (n: number) => `${prefix}${basePath}${n === 1 ? '' : `/${n}`}`;

  let result: Awaited<ReturnType<typeof githubReleases>> | undefined;
  try {
    // GitHub allows 60 unauthenticated requests an hour; the page is cached for an hour, and GITHUB_TOKEN raises the limit.
    result = await githubReleases({ owner, repo, token: process.env.GITHUB_TOKEN, page });
  } catch {
    result = undefined;
  }
  if (result && result.entries.length === 0 && page > 1) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-fd-muted-foreground mb-8">{intro}</p>
      {result && result.entries.length > 0 ? (
        <>
          <ChangelogTimeline entries={result.entries} />
          <ChangelogPagination
            newer={page > 1 ? href(page - 1) : undefined}
            older={result.nextPage ? href(result.nextPage) : undefined}
          />
        </>
      ) : (
        <p className="rounded-lg border p-4">
          {result
            ? 'There are no releases yet.'
            : 'The releases could not be loaded right now.'}{' '}
          <a className="underline" href={`https://github.com/${owner}/${repo}/releases`}>
            See them on GitHub
          </a>
          .
        </p>
      )}
    </main>
  );
}
