import { defineI18n } from 'fumadocs-core/i18n';

// One folder per language under content/docs. Pages missing in a language fall back to US English,
// so a language can be translated page by page.
export const i18n = defineI18n({
  defaultLanguage: 'en-US',
  languages: ['en-US', 'en-GB', 'es', 'zh-CN', 'ru', 'ar', 'fr', 'de'],
  parser: 'dir',
  // The site is a static export (GitHub Pages), which has no middleware to redirect, so every language,
  // US English included, lives under its own prefix: /en-US/docs/...
  hideLocale: 'never',
});

/** Right-to-left languages. */
export const rtlLanguages = ['ar'];
