import { data } from 'react-router';
import { publicLibrary } from '../../public/content.server';
import { headTags, trailPage } from '../../public/pages';
import { publicLocaleOf } from '../../public/paths';
import { PublicLayout, usePublicT } from '../../public/PublicLayout';
import type { Route } from './+types/trail';

/** A prerendered trail page (§7.1): its lessons in order, and a way to start it in the app. */
export function loader({ params, request }: Route.LoaderArgs) {
  const locale = publicLocaleOf(new URL(request.url).pathname) ?? 'pt-BR';
  const page = trailPage(publicLibrary(), locale, params.slug);
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router's idiom for a 404 response
  if (!page) throw data(null, { status: 404 });
  return page;
}

export const meta: Route.MetaFunction = ({ loaderData }) => headTags(loaderData.head);

export default function TrailPage({ loaderData: page }: Route.ComponentProps) {
  const t = usePublicT(page.head.locale);
  return (
    <PublicLayout head={page.head}>
      <article className="pub-article" data-topic={page.topic.id}>
        <p className="pub-kicker">
          <a href={page.topic.path}>{page.topic.name}</a>
        </p>
        <h1 className="pub-title">{page.title}</h1>
        <p className="pub-lead">{page.hook}</p>
        <p className="pub-meta">{t('public.lessonCount', { count: page.lessons.length })}</p>
        <ol className="pub-list">
          {page.lessons.map((l) => (
            <li key={l.path}>
              <a href={l.path}>{l.title}</a>
              <p>{l.summary}</p>
            </li>
          ))}
        </ol>
        <section className="pub-cta">
          <h2>{t('public.ctaTitle')}</h2>
          <p>{t('public.ctaBody')}</p>
          <a className="pub-btn" href={page.appHref}>
            {t('public.startTrail')}
          </a>
        </section>
      </article>
    </PublicLayout>
  );
}
