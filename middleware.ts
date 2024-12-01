import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

// The middleware captures requests to all routes by default
// The matcher allows us to disable the middleware for specific routes
export default createMiddleware({
  locales: locales,
  defaultLocale: 'en'
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};