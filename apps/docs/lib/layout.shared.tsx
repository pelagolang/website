import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { uiTranslations } from 'fumadocs-ui/i18n';
import { zhCN } from '@fumadocs/language/zh-cn';
import { appName, gitConfig } from './shared';
import { i18n } from './i18n';

// UI text per language. Anything missing in a language shows in English. zh-CN comes from the official language
// pack; the others cover the visible strings (search, table of contents, page actions, pagination, switchers).
export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .preset('zh-CN', zhCN())
  .add({
    'en-US': { displayName: 'English (US)' },
    'en-GB': { displayName: 'English (UK)' },
    es: {
      displayName: 'Español',
      'Search(search trigger)': 'Buscar',
      'Search(search dialog)': 'Buscar',
      'No results found(search dialog)': 'No se encontraron resultados',
      'On this page(table of contents)': 'En esta página',
      'Next Page(pagination)': 'Página siguiente',
      'Previous Page(pagination)': 'Página anterior',
      'Copy Markdown(page actions)': 'Copiar Markdown',
      'Copied Markdown(page actions)': 'Markdown copiado',
      'Open(page actions)': 'Abrir',
      'Choose a language(language switcher)': 'Elegir idioma',
      'Language(language switcher)': 'Idioma',
      'Theme(site menu)': 'Tema',
      'Light(theme switcher)(aria-label)': 'Claro',
      'Dark(theme switcher)(aria-label)': 'Oscuro',
      'System(theme switcher)(aria-label)': 'Sistema',
      'Page Not Found(404 not found page)': 'Página no encontrada',
      'Back to Home(404 not found page)': 'Volver al inicio',
    },
    ru: {
      displayName: 'Русский',
      'Search(search trigger)': 'Поиск',
      'Search(search dialog)': 'Поиск',
      'No results found(search dialog)': 'Ничего не найдено',
      'On this page(table of contents)': 'На этой странице',
      'Next Page(pagination)': 'Следующая страница',
      'Previous Page(pagination)': 'Предыдущая страница',
      'Copy Markdown(page actions)': 'Копировать Markdown',
      'Copied Markdown(page actions)': 'Markdown скопирован',
      'Open(page actions)': 'Открыть',
      'Choose a language(language switcher)': 'Выберите язык',
      'Language(language switcher)': 'Язык',
      'Theme(site menu)': 'Тема',
      'Light(theme switcher)(aria-label)': 'Светлая',
      'Dark(theme switcher)(aria-label)': 'Тёмная',
      'System(theme switcher)(aria-label)': 'Системная',
      'Page Not Found(404 not found page)': 'Страница не найдена',
      'Back to Home(404 not found page)': 'На главную',
    },
    ar: {
      displayName: 'العربية',
      'Search(search trigger)': 'بحث',
      'Search(search dialog)': 'بحث',
      'No results found(search dialog)': 'لم يتم العثور على نتائج',
      'On this page(table of contents)': 'في هذه الصفحة',
      'Next Page(pagination)': 'الصفحة التالية',
      'Previous Page(pagination)': 'الصفحة السابقة',
      'Copy Markdown(page actions)': 'نسخ Markdown',
      'Copied Markdown(page actions)': 'تم نسخ Markdown',
      'Open(page actions)': 'فتح',
      'Choose a language(language switcher)': 'اختر اللغة',
      'Language(language switcher)': 'اللغة',
      'Theme(site menu)': 'المظهر',
      'Light(theme switcher)(aria-label)': 'فاتح',
      'Dark(theme switcher)(aria-label)': 'داكن',
      'System(theme switcher)(aria-label)': 'النظام',
      'Page Not Found(404 not found page)': 'الصفحة غير موجودة',
      'Back to Home(404 not found page)': 'العودة إلى الرئيسية',
    },
    fr: {
      displayName: 'Français',
      'Search(search trigger)': 'Rechercher',
      'Search(search dialog)': 'Rechercher',
      'No results found(search dialog)': 'Aucun résultat',
      'On this page(table of contents)': 'Sur cette page',
      'Next Page(pagination)': 'Page suivante',
      'Previous Page(pagination)': 'Page précédente',
      'Copy Markdown(page actions)': 'Copier le Markdown',
      'Copied Markdown(page actions)': 'Markdown copié',
      'Open(page actions)': 'Ouvrir',
      'Choose a language(language switcher)': 'Choisir une langue',
      'Language(language switcher)': 'Langue',
      'Theme(site menu)': 'Thème',
      'Light(theme switcher)(aria-label)': 'Clair',
      'Dark(theme switcher)(aria-label)': 'Sombre',
      'System(theme switcher)(aria-label)': 'Système',
      'Page Not Found(404 not found page)': 'Page introuvable',
      'Back to Home(404 not found page)': "Retour à l'accueil",
    },
    de: {
      displayName: 'Deutsch',
      'Search(search trigger)': 'Suchen',
      'Search(search dialog)': 'Suchen',
      'No results found(search dialog)': 'Keine Ergebnisse gefunden',
      'On this page(table of contents)': 'Auf dieser Seite',
      'Next Page(pagination)': 'Nächste Seite',
      'Previous Page(pagination)': 'Vorherige Seite',
      'Copy Markdown(page actions)': 'Markdown kopieren',
      'Copied Markdown(page actions)': 'Markdown kopiert',
      'Open(page actions)': 'Öffnen',
      'Choose a language(language switcher)': 'Sprache wählen',
      'Language(language switcher)': 'Sprache',
      'Theme(site menu)': 'Design',
      'Light(theme switcher)(aria-label)': 'Hell',
      'Dark(theme switcher)(aria-label)': 'Dunkel',
      'System(theme switcher)(aria-label)': 'System',
      'Page Not Found(404 not found page)': 'Seite nicht gefunden',
      'Back to Home(404 not found page)': 'Zur Startseite',
    },
  });

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    i18n: true,
    nav: {
      title: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/pelago-horizontal.svg" alt={appName} height={26} className="block h-[26px] w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/pelago-horizontal-dark.svg" alt="" height={26} className="hidden h-[26px] w-auto dark:block" />
        </>
      ),
      url: locale === i18n.defaultLanguage ? '/docs' : `/${locale}/docs`,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      { text: 'Changelog', url: `${locale === i18n.defaultLanguage ? '' : `/${locale}`}/changelog`, active: 'nested-url' },
      { text: 'Roadmap', url: `${locale === i18n.defaultLanguage ? '' : `/${locale}`}/docs/project/roadmap`, active: 'nested-url' },
      { text: 'Compiler repository', url: `https://github.com/${gitConfig.user}/${gitConfig.repo}`, external: true },
      { text: 'Examples', url: 'https://github.com/pelagolang/examples', external: true },
    ],
  };
}
