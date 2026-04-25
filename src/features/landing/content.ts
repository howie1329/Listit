export const FEATURES = [
  {
    title: 'Instant capture',
    description:
      'Save a URL in seconds. It appears immediately while extraction runs in the background.',
  },
  {
    title: 'Dedup + organization',
    description:
      'Canonical URL dedup, manual tags, and collections. Keep your library clean and browsable.',
  },
  {
    title: 'Reader + notes',
    description:
      'Reader view with extracted text and per-bookmark notes you can edit and keep.',
  },
  {
    title: 'Ask my bookmarks',
    description:
      'Get grounded answers with citations to the exact bookmarks (and notes) that support them.',
  },
] as const

export const STEPS = [
  {
    n: '01',
    title: 'Save',
    description:
      'Paste a link, hit enter. The bookmark shows up instantly as pending extraction.',
  },
  {
    n: '02',
    title: 'Enrich',
    description:
      'Background extraction pulls text; AI suggests tags/topics and collections—nothing forced.',
  },
  {
    n: '03',
    title: 'Ask',
    description:
      'Ask questions across your saved links and get answers grounded in retrieved chunks with citations.',
  },
] as const

export const FAQS = [
  {
    q: 'Who is this for?',
    a: 'Solo users who want a keyboard-driven bookmarking system with trustworthy retrieval later.',
  },
  {
    q: 'Do I need AI features turned on?',
    a: 'No. You can save and organize manually. Auto-organization and auto notes are optional enhancements.',
  },
  {
    q: 'What’s in scope for MVP?',
    a: 'URL capture with dedup, tags/collections, background extraction, reader view + notes, and “Ask my bookmarks” with citations.',
  },
] as const

export const AUDIENCES = [
  'Researchers',
  'Students',
  'Founders',
  'Indie builders',
] as const
