import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { readingTime } from './utils';

export type Collection = 'medicare-basics' | 'blog' | 'news';

export type ArticleFrontmatter = {
  title: string;
  /** The hook. Used as the meta description and the OG image subtitle. */
  description: string;
  /** Who wrote it. Required — see lib/content-guard.ts. */
  author: string;
  /**
   * ISO date, YYYY-MM-DD. Renamed from `date`.
   *
   * The field is `published` so the frontmatter, the editorial guard in
   * lib/content-guard.ts and the `updated` field it is compared against all
   * use one vocabulary. Nothing reads `date` any more.
   */
  published: string;
  /**
   * ISO date, YYYY-MM-DD. Required, and never earlier than `published`.
   *
   * Equal to `published` means "never revised" — renderers must treat that
   * case as unrevised and suppress the "Updated" byline, because printing it
   * would assert a revision that did not happen.
   */
  updated: string;
  /** Who checked it for compliance before it went live. */
  reviewed_by: string;
  /** Only "approved" may ship. Anything else fails the build. */
  status: string;
  /** ISO date, YYYY-MM-DD. A date in the past fails the build. */
  expires_on: string;
  /**
   * Whether the piece makes a plan-specific claim — a premium, a benefit, a
   * star rating, a named carrier or an enrollment figure.
   *
   * Declaring `true` makes BOTH `source_url` and `review_date` mandatory,
   * per the compliance invariant in CLAUDE.md. See lib/content-guard.ts.
   */
  makes_plan_claim?: boolean;
  /** Single http(s) citation backing a plan-specific claim. */
  source_url?: string;
  /** ISO date, YYYY-MM-DD. When a human last checked the claim. Never future. */
  review_date?: string;
  /** Short kicker rendered above the title and on the OG image. */
  category: string;
  /** Ordering within the Medicare Basics hub. Lower comes first. */
  order?: number;
  featured?: boolean;
};

export type Article = ArticleFrontmatter & {
  slug: string;
  collection: Collection;
  body: string;
  minutes: number;
  href: string;
};

const CONTENT_ROOT = path.join(process.cwd(), 'content');

const HREF_PREFIX: Record<Collection, string> = {
  'medicare-basics': '/medicare-basics/',
  blog: '/blog/',
  news: '/news/',
};

function collectionDir(collection: Collection) {
  return path.join(CONTENT_ROOT, collection);
}

function parseFile(collection: Collection, filename: string): Article {
  const slug = filename.replace(/\.mdx?$/, '');
  const raw = fs.readFileSync(path.join(collectionDir(collection), filename), 'utf8');
  const { data, content } = matter(raw);
  const fm = data as ArticleFrontmatter;

  /*
    A minimal shape check so a malformed file fails here rather than rendering
    an article with an empty <h1>. The full editorial contract — author,
    reviewer, status, expiry, source citations — is enforced separately in
    lib/content-guard.ts, which reports EVERY offending file in one pass
    instead of throwing on the first one it meets.
  */
  if (!fm.title || !fm.description || !fm.published || !fm.category) {
    throw new Error(
      `content/${collection}/${filename}: frontmatter must include title, description, published and category.`,
    );
  }

  return {
    ...fm,
    slug,
    collection,
    body: content,
    minutes: readingTime(content),
    href: HREF_PREFIX[collection] + slug,
  };
}

export function getArticles(collection: Collection): Article[] {
  const dir = collectionDir(collection);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => parseFile(collection, f))
    .sort((a, b) => {
      if (collection === 'medicare-basics') {
        const byOrder = (a.order ?? 99) - (b.order ?? 99);
        if (byOrder !== 0) return byOrder;
      }
      return b.published.localeCompare(a.published);
    });
}

export function getArticle(collection: Collection, slug: string): Article | undefined {
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(collectionDir(collection), file))) return undefined;
  return parseFile(collection, file);
}

export function getAllArticles(): Article[] {
  return [
    ...getArticles('medicare-basics'),
    ...getArticles('blog'),
    ...getArticles('news'),
  ];
}

/** Most recent news items, newest first. */
export function getLatestNews(limit = 3): Article[] {
  return getArticles('news').slice(0, limit);
}

/** Up to `limit` other articles, preferring the same collection. */
export function getRelated(article: Article, limit = 3): Article[] {
  const pool = getAllArticles().filter(
    (a) => a.href !== article.href && a.collection !== 'news',
  );
  pool.sort((a, b) => {
    const sameA = a.collection === article.collection ? 0 : 1;
    const sameB = b.collection === article.collection ? 0 : 1;
    return sameA - sameB || b.published.localeCompare(a.published);
  });
  return pool.slice(0, limit);
}
