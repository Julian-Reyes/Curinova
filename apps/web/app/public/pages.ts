import {
  BRAND,
  SITE_URL,
  isPublishedVariant,
  lessonImageUrl,
  ogImageUrl,
  topicImageUrl,
  type Concept,
  type LessonImage,
  type LessonVariant,
  type MediaSlot,
} from '@lumen/domain';
import type { Library } from '../data/library';
import { imageCredits } from '../components/LessonArt';
import { OG_LOCALE, PUBLIC_LOCALES, publicPagePath, publicPath, type PublicLocale } from './paths';

/*
 * Data for the prerendered public pages (§7.1), built from the content library. Plain,
 * serialisable objects: loaders return them and the pages render them without the app.
 */

export interface PageImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface LessonLink {
  title: string;
  summary: string;
  path: string;
}

export interface PageHead {
  locale: PublicLocale;
  title: string;
  description: string;
  path: string;
  alternates: Partial<Record<PublicLocale, string>>;
  image?: string | undefined;
  type: 'article' | 'website';
  jsonLd?: Record<string, unknown> | undefined;
}

export interface LessonPageData {
  head: PageHead;
  title: string;
  hook: string;
  paragraphs: string[];
  takeaway?: string | undefined;
  sections: { title: string | null; paragraphs: string[] }[];
  hero?: PageImage | undefined;
  diagram?: PageImage | undefined;
  topic: { name: string; path: string; id: string };
  trail: { title: string; path: string; step: number; lessons: LessonLink[] };
  next?: LessonLink | undefined;
  related: (LessonLink & { reason: string })[];
  sources: { title: string; publisher: string; url: string }[];
  credits: string[];
  appHref: string;
  readingMinutes: number;
}

export interface TrailPageData {
  head: PageHead;
  title: string;
  hook: string;
  topic: { name: string; path: string; id: string };
  lessons: LessonLink[];
  appHref: string;
}

export interface TopicPageData {
  head: PageHead;
  name: string;
  description: string;
  id: string;
  image?: PageImage | undefined;
  trails: { title: string; hook: string; path: string; lessons: LessonLink[] }[];
}

const absolute = (path: string) => (path.startsWith('http') ? path : SITE_URL + path);

/** A published variant in exactly this language (no fallback to the other one). */
function published(lib: Library, conceptId: string, locale: PublicLocale) {
  const v = lib.variant(conceptId, locale);
  return v && v.locale === locale && isPublishedVariant(v) ? v : undefined;
}

function lessonLink(v: LessonVariant): LessonLink {
  return { title: v.title, summary: v.summary, path: publicPath(v.locale, 'lesson', v.slug) };
}

function image(concept: Concept, slot: MediaSlot, locale: PublicLocale): PageImage | undefined {
  const img: LessonImage | undefined = concept.media?.[slot];
  if (!img) return undefined;
  return {
    src: lessonImageUrl(concept.id, slot, 'full', img.hash),
    width: img.width,
    height: img.height,
    alt: img.alt[locale] ?? '',
  };
}

export function lessonPage(
  lib: Library,
  locale: PublicLocale,
  slug: string,
): LessonPageData | null {
  const variant = lib.concepts
    .map((c) => published(lib, c.id, locale))
    .find((v) => v?.slug === slug);
  const concept = variant && lib.concept(variant.conceptId);
  const cluster = concept && lib.cluster(concept.clusterId);
  const topic = concept && lib.topic(concept.topicId);
  if (!variant || !concept || !cluster || !topic) return null;

  const alternates: Partial<Record<PublicLocale, string>> = {};
  for (const l of PUBLIC_LOCALES) {
    const v = published(lib, concept.id, l);
    if (v) alternates[l] = publicPath(l, 'lesson', v.slug);
  }
  const trailLessons = lib.conceptsInCluster(cluster.id).flatMap((c) => {
    const v = published(lib, c.id, locale);
    return v ? [{ id: c.id, link: lessonLink(v) }] : [];
  });
  const step = trailLessons.findIndex((l) => l.id === concept.id);
  const sections: LessonPageData['sections'] = [];
  for (const b of variant.deepDiveBlocks) {
    if (b.type === 'heading') sections.push({ title: b.text, paragraphs: [] });
    else if (sections.length === 0) sections.push({ title: null, paragraphs: [b.text] });
    else sections.at(-1)?.paragraphs.push(b.text);
  }
  const sources = lib
    .sources(variant)
    .map((s) => ({ title: s.title, publisher: s.publisher, url: s.url }));
  const hero = image(concept, 'deeper', locale) ?? image(concept, 'discover', locale);
  const path = publicPath(locale, 'lesson', slug);
  const trailPath = publicPath(locale, 'trail', cluster.slug[locale]);
  const topicPath = publicPath(locale, 'topic', topic.slug[locale]);

  return {
    head: {
      locale,
      title: variant.title,
      description: variant.summary,
      path,
      alternates,
      image: absolute(ogImageUrl(locale, 'lesson', slug)),
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: variant.title,
        headline: variant.title,
        description: variant.summary,
        inLanguage: locale,
        url: absolute(path),
        ...(hero ? { image: absolute(hero.src) } : {}),
        learningResourceType: 'lesson',
        educationalLevel: concept.difficulty,
        about: topic.name[locale],
        isPartOf: { '@type': 'Course', name: cluster.title[locale], url: absolute(trailPath) },
        ...(variant.publishedAt ? { datePublished: variant.publishedAt } : {}),
        ...(variant.updatedAt ? { dateModified: variant.updatedAt } : {}),
        publisher: { '@type': 'Organization', name: BRAND.name, url: SITE_URL },
        isBasedOn: sources.map((s) => ({
          '@type': 'CreativeWork',
          name: s.title,
          url: s.url,
          publisher: { '@type': 'Organization', name: s.publisher },
        })),
      },
    },
    title: variant.title,
    hook: variant.hook,
    paragraphs: variant.cardBlocks.filter((b) => b.type === 'paragraph').map((b) => b.text),
    takeaway: variant.cardBlocks.find((b) => b.type === 'takeaway')?.text,
    sections,
    hero,
    diagram: image(concept, 'diagram', locale),
    topic: { name: topic.name[locale], path: topicPath, id: topic.id },
    trail: {
      title: cluster.title[locale],
      path: trailPath,
      step: step + 1,
      lessons: trailLessons.map((l) => l.link),
    },
    next: trailLessons[step + 1]?.link,
    related: concept.related.flatMap((r) => {
      const v = published(lib, r.conceptId, locale);
      return v ? [{ ...lessonLink(v), reason: r.reason[locale] ?? '' }] : [];
    }),
    sources,
    credits: imageCredits(concept),
    appHref: `/app/trail/${cluster.slug[locale]}?start=${encodeURIComponent(concept.id)}`,
    readingMinutes: Math.max(1, Math.round(lib.readingSeconds(variant) / 60)),
  };
}

export function trailPage(lib: Library, locale: PublicLocale, slug: string): TrailPageData | null {
  const cluster = lib.clusters.find((c) => c.slug[locale] === slug);
  const topic = cluster && lib.topic(cluster.topicId);
  if (!cluster || !topic) return null;
  const lessons = lib.conceptsInCluster(cluster.id).flatMap((c) => {
    const v = published(lib, c.id, locale);
    return v ? [lessonLink(v)] : [];
  });
  if (lessons.length === 0) return null;
  const alternates: Partial<Record<PublicLocale, string>> = {};
  for (const l of PUBLIC_LOCALES)
    if (lib.conceptsInCluster(cluster.id).some((c) => published(lib, c.id, l)))
      alternates[l] = publicPath(l, 'trail', cluster.slug[l]);
  return {
    head: {
      locale,
      title: cluster.title[locale],
      description: cluster.hook[locale],
      path: publicPath(locale, 'trail', slug),
      alternates,
      image: absolute(ogImageUrl(locale, 'trail', slug)),
      type: 'website',
    },
    title: cluster.title[locale],
    hook: cluster.hook[locale],
    topic: {
      name: topic.name[locale],
      path: publicPath(locale, 'topic', topic.slug[locale]),
      id: topic.id,
    },
    lessons,
    appHref: `/app/trail/${cluster.slug[locale]}`,
  };
}

export function topicPage(lib: Library, locale: PublicLocale, slug: string): TopicPageData | null {
  const topic = lib.topics.find((t) => t.slug[locale] === slug);
  if (!topic) return null;
  const trails = lib.clustersInTopic(topic.id).flatMap((cluster) => {
    const lessons = lib.conceptsInCluster(cluster.id).flatMap((c) => {
      const v = published(lib, c.id, locale);
      return v ? [lessonLink(v)] : [];
    });
    return lessons.length > 0
      ? [
          {
            title: cluster.title[locale],
            hook: cluster.hook[locale],
            path: publicPath(locale, 'trail', cluster.slug[locale]),
            lessons,
          },
        ]
      : [];
  });
  if (trails.length === 0) return null;
  const alternates: Partial<Record<PublicLocale, string>> = {};
  for (const l of PUBLIC_LOCALES)
    if (lib.conceptsInTopic(topic.id).some((c) => published(lib, c.id, l)))
      alternates[l] = publicPath(l, 'topic', topic.slug[l]);
  const picture = topic.image && {
    src: topicImageUrl(topic.id, 'full', topic.image.hash),
    width: topic.image.width,
    height: topic.image.height,
    alt: topic.image.alt[locale] ?? '',
  };
  return {
    head: {
      locale,
      title: topic.name[locale],
      description: topic.description[locale],
      path: publicPath(locale, 'topic', slug),
      alternates,
      image: absolute(ogImageUrl(locale, 'topic', slug)),
      type: 'website',
    },
    name: topic.name[locale],
    description: topic.description[locale],
    id: topic.id,
    image: picture,
    trails,
  };
}

/** Title, description, canonical, hreflang, Open Graph and JSON-LD tags (§7.1). */
export function headTags(head: PageHead) {
  const url = absolute(head.path);
  const title = `${head.title} · ${BRAND.name}`;
  const other = PUBLIC_LOCALES.filter((l) => l !== head.locale && head.alternates[l]);
  return [
    { title },
    { name: 'description', content: head.description },
    { tagName: 'link', rel: 'canonical', href: url },
    ...PUBLIC_LOCALES.flatMap((l) => {
      const href = head.alternates[l];
      return href ? [{ tagName: 'link', rel: 'alternate', hrefLang: l, href: absolute(href) }] : [];
    }),
    ...(head.alternates['pt-BR']
      ? [
          {
            tagName: 'link',
            rel: 'alternate',
            hrefLang: 'x-default',
            href: absolute(head.alternates['pt-BR']),
          },
        ]
      : []),
    { property: 'og:type', content: head.type },
    { property: 'og:site_name', content: BRAND.name },
    { property: 'og:title', content: head.title },
    { property: 'og:description', content: head.description },
    { property: 'og:url', content: url },
    { property: 'og:locale', content: OG_LOCALE[head.locale] },
    ...other.map((l) => ({ property: 'og:locale:alternate', content: OG_LOCALE[l] })),
    ...(head.image
      ? [
          { property: 'og:image', content: head.image },
          { property: 'og:image:width', content: '1200' },
          { property: 'og:image:height', content: '630' },
          { property: 'og:image:alt', content: head.title },
          { name: 'twitter:card', content: 'summary_large_image' },
        ]
      : [{ name: 'twitter:card', content: 'summary' }]),
    ...(head.jsonLd ? [{ 'script:ld+json': head.jsonLd }] : []),
  ];
}

export interface PhotoCredit {
  creator: string;
  platform: string | undefined;
  license: string;
  sourceUrl: string;
}

export interface CreditsPageData {
  head: PageHead;
  lessons: { title: string; path: string; photos: PhotoCredit[] }[];
  topics: { name: string; path: string; photo: PhotoCredit }[];
}

function photoCredit(img: LessonImage | undefined): PhotoCredit | undefined {
  const o = img?.origin;
  return o?.kind === 'licensed'
    ? { creator: o.creator, platform: o.platform, license: o.license, sourceUrl: o.sourceUrl }
    : undefined;
}

/** Every licensed photo on the public site, by lesson and topic (§14 Credits). */
export function creditsPage(
  lib: Library,
  locale: PublicLocale,
  title: string,
  description: string,
): CreditsPageData {
  const lessons = lib.concepts.flatMap((c) => {
    const v = published(lib, c.id, locale);
    if (!v) return [];
    const seen = new Set<string>();
    const photos = Object.values(c.media ?? {}).flatMap((img) => {
      const credit = photoCredit(img);
      if (!credit || seen.has(credit.sourceUrl)) return [];
      seen.add(credit.sourceUrl);
      return [credit];
    });
    return photos.length > 0
      ? [{ title: v.title, path: publicPath(locale, 'lesson', v.slug), photos }]
      : [];
  });
  const topics = lib.topics.flatMap((t) => {
    const photo = photoCredit(t.image);
    return photo
      ? [{ name: t.name[locale], path: publicPath(locale, 'topic', t.slug[locale]), photo }]
      : [];
  });
  const alternates = {
    'pt-BR': publicPagePath('pt-BR', 'credits'),
    en: publicPagePath('en', 'credits'),
  };
  return {
    head: {
      locale,
      title,
      description,
      path: alternates[locale],
      alternates,
      image: absolute(ogImageUrl(locale, 'page', locale === 'pt-BR' ? 'creditos' : 'credits')),
      type: 'website',
    },
    lessons,
    topics,
  };
}
