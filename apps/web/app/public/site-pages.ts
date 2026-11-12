import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PUBLIC_LOCALES,
  publicPagePath,
  publicPath,
  type PublicKind,
  type PublicLocale,
} from './paths.ts';

/*
 * Lists the public pages of the built content bundle (public/content, D16) for prerendering,
 * the sitemaps and the build check. Node-only and free of package imports, because
 * react-router.config.ts loads it directly (see the note in vite.config.ts).
 */

interface RawVariant {
  conceptId: string;
  locale: PublicLocale;
  slug: string;
  reviewStatus: string;
  publicationStatus: string;
  fixture?: true;
  updatedAt?: string;
}

interface RawIndex {
  topics: { id: string; slug: Record<PublicLocale, string> }[];
  clusters: {
    id: string;
    topicId: string;
    slug: Record<PublicLocale, string>;
    conceptIds: string[];
  }[];
}

export interface SitePage {
  kind: PublicKind | 'credits';
  locale: PublicLocale;
  path: string;
  /** The same page in each language it exists in (hreflang), this one included. */
  alternates: Partial<Record<PublicLocale, string>>;
  lastModified?: string | undefined;
}

function readJson(dir: string, name: string): unknown {
  return JSON.parse(readFileSync(join(dir, name), 'utf8'));
}

/** Every public page: published lessons, and the topics and trails that contain them. */
export function listSitePages(contentDir: string): SitePage[] {
  const manifest = readJson(contentDir, 'manifest.json') as {
    index: string;
    topics: Record<string, Partial<Record<PublicLocale, string>>>;
  };
  const index = readJson(contentDir, manifest.index) as RawIndex;
  const variants = Object.values(manifest.topics)
    .flatMap((files) => Object.values(files))
    .flatMap((file) => (readJson(contentDir, file) as { variants: RawVariant[] }).variants)
    .filter(
      (v) =>
        v.fixture !== true && v.reviewStatus === 'reviewed' && v.publicationStatus === 'published',
    );

  const byConcept = new Map<string, Partial<Record<PublicLocale, RawVariant>>>();
  for (const v of variants)
    byConcept.set(v.conceptId, { ...byConcept.get(v.conceptId), [v.locale]: v });

  const pages: SitePage[] = [];
  for (const locales of byConcept.values()) {
    const alternates: Partial<Record<PublicLocale, string>> = {};
    for (const l of PUBLIC_LOCALES) {
      const v = locales[l];
      if (v) alternates[l] = publicPath(l, 'lesson', v.slug);
    }
    for (const l of PUBLIC_LOCALES) {
      const v = locales[l];
      if (v)
        pages.push({
          kind: 'lesson',
          locale: l,
          path: publicPath(l, 'lesson', v.slug),
          alternates,
          lastModified: v.updatedAt,
        });
    }
  }

  const hasLesson = (conceptIds: string[], l: PublicLocale) =>
    conceptIds.some((id) => byConcept.get(id)?.[l] !== undefined);
  const groups: { kind: PublicKind; slug: Record<PublicLocale, string>; conceptIds: string[] }[] = [
    ...index.clusters.map((c) => ({
      kind: 'trail' as const,
      slug: c.slug,
      conceptIds: c.conceptIds,
    })),
    ...index.topics.map((t) => ({
      kind: 'topic' as const,
      slug: t.slug,
      conceptIds: index.clusters.filter((c) => c.topicId === t.id).flatMap((c) => c.conceptIds),
    })),
  ];
  for (const g of groups) {
    const alternates: Partial<Record<PublicLocale, string>> = {};
    for (const l of PUBLIC_LOCALES)
      if (hasLesson(g.conceptIds, l)) alternates[l] = publicPath(l, g.kind, g.slug[l]);
    for (const l of PUBLIC_LOCALES) {
      const path = alternates[l];
      if (path) pages.push({ kind: g.kind, locale: l, path, alternates });
    }
  }
  const credits = {
    'pt-BR': publicPagePath('pt-BR', 'credits'),
    en: publicPagePath('en', 'credits'),
  };
  for (const l of PUBLIC_LOCALES)
    pages.push({ kind: 'credits', locale: l, path: credits[l], alternates: credits });
  return pages;
}
