import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { dirname } from 'node:path';
import { i18n } from '@/lib/i18n';
import { StatusBadge } from '@/components/status-badge';
import { basePath, getPageImageUrl, getPageMarkdownUrl } from '@/lib/shared';

export default async function Page(props: PageProps<'/[lang]/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  const status = page.data.status;
  const MDX = page.data.body;
  // A relative link must name the Markdown file it points at (`[Ownership](./ownership.md)`): a bare `./ownership` is
  // resolved by the browser against the page URL, which is a folder, and gives a 404. The file is looked up in US English
  // (the language every page exists in) and the link goes to the same page in the reader's language, which falls back to
  // English until it is translated. A link to a file that does not exist stops the build.
  const resolveDocLink = (href: string) => {
    // a page that falls back to English reports its path with the language folder in front of it
    const folder = i18n.languages.find((l) => page.path.startsWith(`${l}/`));
    const path = folder ? page.path.slice(folder.length + 1) : page.path;
    const target = source.getPageByHref(href, { dir: dirname(path), language: i18n.defaultLanguage });
    if (!target) throw new Error(`${page.path}: the link "${href}" does not point at a docs page; link to the file, such as ./name.md`);
    const there = source.getPage(target.page.slugs, params.lang) ?? target.page;
    return target.hash ? `${there.url}#${target.hash}` : there.url;
  };
  const markdownUrl = `${basePath}${getPageMarkdownUrl(page).url}`;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{ header: status ? <StatusBadge status={status} className="mb-3 w-fit" /> : undefined }}
      tableOfContentPopover={{ header: status ? <StatusBadge status={status} className="mb-3 w-fit" /> : undefined }}
    >
      <DocsTitle>
        {page.data.title}
        {status ? <StatusBadge status={status} className="ms-3 align-middle" /> : null}
      </DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/pelagolang/website/blob/main/apps/docs/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            // pages link to each other as /docs/...; the language prefix is added here
            a: (props) => {
              const href = props.href;
              const Link = defaultMdxComponents.a;
              // `/docs/...` is a docs page in the reader's language; any other `/path` is a page of the marketing site
              // (for example `/benchmarks/`), which is not part of this app, so it gets a plain link under the base path.
              if (href?.startsWith('/docs')) return <Link {...props} href={`/${params.lang}${href}`} />;
              if (href?.startsWith('/') && !href.startsWith('//')) return <a {...props} href={`${basePath}${href}`} />;
              if (href?.startsWith('./') || href?.startsWith('../')) return <Link {...props} href={resolveDocLink(href)} />;
              return <Link {...props} />;
            },
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/[lang]/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: `${basePath}${getPageImageUrl(page).url}`,
    },
  };
}
