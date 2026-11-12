import { createI18n } from '../../i18n';
import { publicLibrary } from '../../public/content.server';
import { creditsPage, headTags, type PhotoCredit } from '../../public/pages';
import { publicLocaleOf } from '../../public/paths';
import { PublicLayout, usePublicT } from '../../public/PublicLayout';
import type { Route } from './+types/credits';

/** Credits (§14): the lesson text license, every licensed photo with its source, and fonts. */
export function loader({ request }: Route.LoaderArgs) {
  const locale = publicLocaleOf(new URL(request.url).pathname) ?? 'pt-BR';
  const t = createI18n(locale).t;
  return creditsPage(publicLibrary(), locale, t('credits.title'), t('credits.description'));
}

export const meta: Route.MetaFunction = ({ loaderData }) => headTags(loaderData.head);

function Credit({ photo }: { photo: PhotoCredit }) {
  return (
    <>
      <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
        {photo.creator}
      </a>
      <span>
        {photo.platform ? ` · ${photo.platform}` : ''} · {photo.license}
      </span>
    </>
  );
}

export default function CreditsPage({ loaderData: page }: Route.ComponentProps) {
  const t = usePublicT(page.head.locale);
  return (
    <PublicLayout head={page.head}>
      <article className="pub-article">
        <h1 className="pub-title">{t('credits.title')}</h1>
        <p className="pub-lead">{t('credits.description')}</p>

        <section className="pub-sec">
          <h2 className="pub-h2">{t('credits.textTitle')}</h2>
          <p className="pub-p">{t('credits.textBody')}</p>
        </section>

        <section className="pub-sec">
          <h2 className="pub-h2">{t('credits.photosTitle')}</h2>
          <p className="pub-p">{t('credits.photosBody')}</p>
          <ul className="pub-credits">
            {page.lessons.map((l) => (
              <li key={l.path}>
                <a href={l.path} className="pub-credits-lesson">
                  {l.title}
                </a>
                {l.photos.map((p) => (
                  <p key={p.sourceUrl}>
                    <Credit photo={p} />
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </section>

        {page.topics.length > 0 && (
          <section className="pub-sec">
            <h2 className="pub-h2">{t('credits.topicsTitle')}</h2>
            <ul className="pub-credits">
              {page.topics.map((tp) => (
                <li key={tp.path}>
                  <a href={tp.path} className="pub-credits-lesson">
                    {tp.name}
                  </a>
                  <p>
                    <Credit photo={tp.photo} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="pub-sec">
          <h2 className="pub-h2">{t('credits.fontsTitle')}</h2>
          <p className="pub-p">{t('credits.fontsBody')}</p>
        </section>
      </article>
    </PublicLayout>
  );
}
