import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { statusBadgesPlugin } from 'fumadocs-core/source/plugins/status-badges';
import { createElement } from 'react';
import { z } from 'zod';
import { StatusBadge } from '@/components/status-badge';
import { i18n } from './i18n';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import pelagoGrammar from './pelago.tmLanguage.json';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // `status: experimental` (or new, beta, deprecated) in the front matter puts a badge in the sidebar, the page header and the table of contents.
    schema: pageSchema.extend({ status: z.string().optional() }),
    // Code blocks marked `pelago` are coloured with the same TextMate grammar the editors use (copied from
    // pelagolang/pelago, editors/textmate). `sh` and `text` blocks use Shiki's built-in languages.
    mdxOptions: applyMdxPreset({
      rehypeCodeOptions: {
        themes: { light: 'github-light', dark: 'github-dark' },
        langs: [{ ...(pelagoGrammar as object), name: 'pelago' } as never],
      },
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  i18n,
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [
    lucideIconsPlugin(),
    statusBadgesPlugin({
      renderBadge: (status) => createElement(StatusBadge, { status, className: 'ms-2 align-middle' }),
    }),
  ],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
