declare module 'virtual:lumen-content' {
  const library: {
    channel: 'production' | 'preview' | 'fixtures';
    topics: unknown[];
    clusters: unknown[];
    concepts: unknown[];
    variants: unknown[];
    questions: unknown[];
    sources: unknown[];
  };
  export default library;
}
