import { createMiddleware } from 'next-i18next/middleware';
import i18nConfig from '../i18n.config';

export const middleware = createMiddleware(i18nConfig);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)'],
}