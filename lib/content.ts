import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { readingTime } from './utils';

export type Collection = 'medicare-basics' | 'blog';

export type ArticleFrontmatter = {
  title: string;
  /** The hook. Used as the meta description and the OG image subtitle. */
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  updated?: string;
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

function collectionDir(collection: Collection) {
  return path.join(CONTENT_ROOT, collection);
}

function parseFile(collection: Collection, filename: string): Article {
  const slug = filename.replace(/\.mdx?$/, '');
  const raw = fs.readFileSync(path.join(collectionDir(collection), filename), 'utf8');
  const { data, content } = matter(raw);
  const fm = data as ArticleFrontmatter;

  if (!fm.title || !fm.description || !fm.date || !fm.category) {
    throw new Error(
      `content/${collection}/${filename}: frontmatter must include title, description, date and category.`,
    );
  }

  return {
    ...fm,
    slug,
    collection,
    body: content,
    minutes: readingTime(content),
    href: collection === 'blog' ? `/blog/${slug}` : `/medicare-basics/${slug}`,
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
      return b.date.localeCompare(a.date);
    });
}

export function getArticle(collection: Collection, slug: string): Article | undefined {
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(collectionDir(collection), file))) return undefined;
  return parseFile(collection, file);
}

export function getAllArticles(): Article[] {
  return [...getArticles('medicare-basics'), ...getArticles('blog')];
}

/** Up to `limit` other articles, preferring the same collection. */
export function getRelated(article: Article, limit = 3): Article[] {
  const pool = getAllArticles().filter((a) => a.href !== article.href);
  pool.sort((a, b) => {
    const sameA = a.collection === article.collection ? 0 : 1;
    const sameB = b.collection === article.collection ? 0 : 1;
    return sameA - sameB || b.date.localeCompare(a.date);
  });
  return pool.slice(0, limit);
}
