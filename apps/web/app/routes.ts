import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

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
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
