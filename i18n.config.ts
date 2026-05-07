import type { I18nConfig } from 'next-i18next/middleware'

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'th'],
  fallbackLng: 'en',
  defaultNS: 'guide-page',
  ns: ['components/graphSetting', 'components/setting', 'components/navbar', 'guide-page'],
  // Recommended: works on all platforms including Vercel/serverless
  resourceLoader: (language, namespace) =>
    import(`./src/app/i18n/locales/${language}/${namespace}.json`),
}

export default i18nConfig 