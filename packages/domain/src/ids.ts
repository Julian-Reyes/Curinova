/** Lowercase ASCII kebab-case, e.g. "por-que-a-lua-mostra-sempre-o-mesmo-lado". */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 80;

/** Every fixture ID starts with this prefix so leaks into real content are easy to detect. */
export const FIXTURE_ID_PREFIX = 'fixture_';

const SNAKE = '[a-z0-9]+(?:_[a-z0-9]+)*';

export function idPattern(prefix: string): RegExp {
  return new RegExp(`^(?:${FIXTURE_ID_PREFIX})?${prefix}_${SNAKE}$`);
}

export const TOPIC_ID_PATTERN = new RegExp(`^(?:${FIXTURE_ID_PREFIX})?${SNAKE}$`);
export const CONCEPT_ID_PATTERN = idPattern('concept');
export const CLUSTER_ID_PATTERN = idPattern('cluster');
export const SOURCE_ID_PATTERN = idPattern('src');
export const QUESTION_GROUP_ID_PATTERN = idPattern('qg');
/** Variant and question IDs carry their locale: lesson_x__pt-BR, q_x_1__en. */
export const VARIANT_ID_PATTERN = new RegExp(
  `^(?:${FIXTURE_ID_PREFIX})?lesson_${SNAKE}__(?:pt-BR|en)$`,
);
export const QUESTION_ID_PATTERN = new RegExp(
  `^(?:${FIXTURE_ID_PREFIX})?q_${SNAKE}__(?:pt-BR|en)$`,
);

export function isFixtureId(id: string): boolean {
  return id.startsWith(FIXTURE_ID_PREFIX);
}
