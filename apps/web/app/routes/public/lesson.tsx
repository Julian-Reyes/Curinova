import { data } from 'react-router';
import { ChevronDownIcon } from '../../components/icons';
import { publicLibrary } from '../../public/content.server';
import { headTags, lessonPage } from '../../public/pages';
import { publicLocaleOf } from '../../public/paths';
import { PublicLayout, usePublicT } from '../../public/PublicLayout';
import type { Route } from './+types/lesson';

/** A prerendered lesson page (§7.1), readable without JavaScript, with a way into the app. */
export function loader({ params, request }: Route.LoaderArgs) {
  const locale = publicLocaleOf(new URL(request.url).pathname) ?? 'pt-BR';
  const page = lessonPage(publicLibrary(), locale, params.slug);
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router's idiom for a 404 response
  if (!page) throw data(null, { status: 404 });
  return page;
}

export const meta: Route.MetaFunction = ({ loaderData }) => headTags(loaderData.head);

export default function LessonPage({ loaderData: page }: Route.ComponentProps) {
  const t = usePublicT(page.head.locale);
  return (
    <PublicLayout head={page.head}>
      <article className="pub-article" data-topic={page.topic.id}>
        <p className="pub-kicker">
          <a href={page.topic.path}>{page.topic.name}</a>
          <span aria-hidden="true"> · </span>
          <a href={page.trail.path}>{page.trail.title}</a>
        </p>
        <h1 className="pub-title">{page.title}</h1>
        <p className="pub-lead">{page.hook}</p>
        <p className="pub-meta">
          {t('public.readingTime', { minutes: page.readingMinutes })}
          <span aria-hidden="true"> · </span>
          {t('public.trailStep', { step: page.trail.step, total: page.trail.lessons.length })}
        </p>

        {page.hero && (
          <figure className="pub-hero">
            <img
              src={page.hero.src}
              width={page.hero.width}
              height={page.hero.height}
              alt={page.hero.alt}
              fetchPriority="high"
            />
          </figure>
        )}

        {page.paragraphs.map((text) => (
          <p key={text} className="pub-p">
            {text}
          </p>
        ))}
        {page.takeaway && (
          <aside className="pub-take">
            <h2>{t('deeper.keyTakeaways')}</h2>
            <p>{page.takeaway}</p>
          </aside>
        )}

        {page.diagram && (
          <section className="pub-sec">
            <h2 className="pub-h2">{t('deeper.howItWorks')}</h2>
            <img
              className="pub-diagram"
              src={page.diagram.src}
              width={page.diagram.width}
              height={page.diagram.height}
              alt={page.diagram.alt}
              loading="lazy"
            />
          </section>
        )}
        {page.sections.map((s) => (
          <section key={s.title ?? s.paragraphs[0]} className="pub-sec">
            {s.title && <h2 className="pub-h2">{s.title}</h2>}
            {s.paragraphs.map((text) => (
              <p key={text} className="pub-p">
                {text}
              </p>
            ))}
          </section>
        ))}

        <section className="pub-cta">
          <h2>{t('public.ctaTitle')}</h2>
          <p>{t('public.ctaBody')}</p>
          <a className="pub-btn" href={page.appHref}>
            {t('public.continueInApp')}
          </a>
        </section>

        <section className="pub-sec">
          <h2 className="pub-h2">{t('public.inThisTrail', { trail: page.trail.title })}</h2>
          <ol className="pub-trail">
            {page.trail.lessons.map((l, i) => (
              <li key={l.path} aria-current={i + 1 === page.trail.step ? 'page' : undefined}>
                {i + 1 === page.trail.step ? (
                  <span>{l.title}</span>
                ) : (
                  <a href={l.path}>{l.title}</a>
                )}
              </li>
            ))}
          </ol>
          {page.next && (
            <p className="pub-next">
              {t('deeper.nextInTrail')}: <a href={page.next.path}>{page.next.title}</a>
            </p>
          )}
        </section>

        {page.related.length > 0 && (
          <section className="pub-sec">
            <h2 className="pub-h2">{t('deeper.relatedLabel')}</h2>
            <ul className="pub-links">
              {page.related.map((r) => (
                <li key={r.path}>
                  <a href={r.path}>{r.title}</a>
                  <span>{r.reason}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="pub-sec">
          {/* Sources fold away, as in the app (D24); <details> works without JavaScript. */}
          {page.sources.length > 0 && (
            <details className="deeper-sources">
              <summary>
                {t('deeper.sources')}
                <ChevronDownIcon size={14} />
              </summary>
              <ul className="pub-sources">
                {page.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                    <span> · {s.publisher}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
          {page.credits.length > 0 && (
            <p className="pub-credit">
              {t('deeper.photoCredit', { credit: page.credits.join(' · ') })}
            </p>
          )}
        </section>
      </article>
    </PublicLayout>
  );
}
