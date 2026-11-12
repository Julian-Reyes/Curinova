import { data } from 'react-router';
import { publicLibrary } from '../../public/content.server';
import { headTags, topicPage } from '../../public/pages';
import { publicLocaleOf } from '../../public/paths';
import { PublicLayout, usePublicT } from '../../public/PublicLayout';
import type { Route } from './+types/topic';

/** A prerendered topic page (§7.1): its trails and their lessons. */
export function loader({ params, request }: Route.LoaderArgs) {
  const locale = publicLocaleOf(new URL(request.url).pathname) ?? 'pt-BR';
  const page = topicPage(publicLibrary(), locale, params.slug);
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router's idiom for a 404 response
  if (!page) throw data(null, { status: 404 });
  return page;
}

export const meta: Route.MetaFunction = ({ loaderData }) => headTags(loaderData.head);

export default function TopicPage({ loaderData: page }: Route.ComponentProps) {
  const t = usePublicT(page.head.locale);
  return (
    <PublicLayout head={page.head}>
      <article className="pub-article" data-topic={page.id}>
        <h1 className="pub-title">{page.name}</h1>
        <p className="pub-lead">{page.description}</p>
        {page.image && (
          <figure className="pub-hero">
            <img
              src={page.image.src}
              width={page.image.width}
              height={page.image.height}
              alt={page.image.alt}
              fetchPriority="high"
            />
          </figure>
        )}
        {page.trails.map((trail) => (
          <section key={trail.path} className="pub-sec">
            <h2 className="pub-h2">
              <a href={trail.path}>{trail.title}</a>
            </h2>
            <p className="pub-p">{trail.hook}</p>
            <ol className="pub-list">
              {trail.lessons.map((l) => (
                <li key={l.path}>
                  <a href={l.path}>{l.title}</a>
                </li>
              ))}
            </ol>
          </section>
        ))}
        <section className="pub-cta">
          <h2>{t('public.ctaTitle')}</h2>
          <p>{t('public.ctaBody')}</p>
          <a className="pub-btn" href="/">
            {t('public.openApp')}
          </a>
        </section>
      </article>
    </PublicLayout>
  );
}
