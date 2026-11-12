import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';
import { PUBLIC_LOCALES, publicRoutePattern, type PublicKind } from './public/paths';

/**
 * The content review tool (D20) is a dev-server route only: production builds never contain
 * it (the service worker also denies /_review).
 */
const includeReviewTool = process.env.NODE_ENV !== 'production';

/** Prerendered public pages (§7.1): one route per language, e.g. pt/licao/:slug and en/lesson/:slug. */
const publicPages = (['lesson', 'topic', 'trail'] as const satisfies readonly PublicKind[]).flatMap(
  (kind) =>
    PUBLIC_LOCALES.map((locale) =>
      route(publicRoutePattern(locale, kind), `routes/public/${kind}.tsx`, {
        id: `public-${kind}-${locale}`,
      }),
    ),
);

export default [
  index('routes/index.tsx'),
  layout('routes/app-layout.tsx', [
    route('app/welcome', 'routes/welcome.tsx'),
    layout('routes/tabs-layout.tsx', [
      route('app/discover', 'routes/discover.tsx'),
      route('app/trail/:slug', 'routes/trail.tsx'),
      route('app/explore', 'routes/explore.tsx'),
      route('app/topic/:slug', 'routes/topic.tsx'),
      route('app/review', 'routes/review.tsx'),
      route('app/library', 'routes/library.tsx'),
      route('app/you', 'routes/you.tsx'),
      route('app/settings', 'routes/settings.tsx'),
    ]),
  ]),
  ...publicPages,
  ...(includeReviewTool ? [route('_review', 'dev/review/route.tsx')] : []),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
