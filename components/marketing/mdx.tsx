import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Callout, KeyPoints, PullQuote, VideoEmbed } from './prose';
import { GlossaryTerm } from './glossary-term';
import { ContactActions } from './contact-actions';
import { Button } from '@/components/ui/button';

/**
 * Components available inside article MDX. Anything an article needs must be
 * registered here — MDX files cannot import.
 *
 * `G` is the glossary shorthand, kept short because it appears constantly in
 * the copy: <G k="irmaa" />.
 */
const components = {
  Callout,
  PullQuote,
  KeyPoints,
  VideoEmbed,
  G: GlossaryTerm,
  ContactActions,

  /** In-article CTA. Kept generic so articles never restate compliance copy. */
  AskMe: ({ children }: { children?: React.ReactNode }) => (
    <aside className="my-10 rounded-2xl border-2 border-navy/20 bg-navy-soft p-6 sm:p-7">
      <p className="font-display text-xl font-semibold text-navy-deep">
        {children ?? 'Not sure how this applies to you?'}
      </p>
      <ContactActions where="article-inline" className="mt-5" size="md" includeEmail={false} />
    </aside>
  ),

  /** Internal links go through next/link; external ones open safely. */
  a: ({ href = '', children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href.startsWith('/')) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },

  Button,
};

export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      }}
    />
  );
}
