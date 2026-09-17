import { hasEmbeds } from '../../../blog/embeds.ts'
import { READER_CHROME } from '../../../config/reader-chrome.ts'
import { renderOgImage } from '../../../og/render.ts'
import { postDateTime } from '../../../seo/date-time.ts'
import { blogPostingStructuredData } from '../../../seo/structured-data.ts'
import { SiteLayout } from '../../../components/SiteLayout.tsx'
import { renderHtml } from '../../../ssg/html.ts'
import type { PageRoutes } from '../../../ssg/route.ts'

/**
 * One page per published post at `/blog/<slug>/`, plus its Open Graph image at `/og/blog/<slug>.png`.
 * The `[slug]` directory name only documents the dynamic segment; the URLs come from the posts in
 * src/content/blog.
 */
export const routes: PageRoutes = ({ posts }) =>
	posts.flatMap((post) => [
		{
			path: `/og/blog/${post.slug}.png`,
			unlisted: !post.listed,
			render: ({ root }) => renderOgImage(root, { title: post.title, description: post.description, date: post.date }),
		},
		{
			path: `/blog/${post.slug}/`,
			inputPath: post.file,
			unlisted: !post.listed,
			render: async ({ assets, renderMarkdown }) => {
				const html = await renderMarkdown(post.body, post.file)
				return renderHtml(
					<SiteLayout
						title={post.title}
						description={post.description}
						pathname={`/blog/${post.slug}/`}
						ogType='article'
						publishedTime={postDateTime(post.date)}
						ogImage={`/og/blog/${post.slug}.png`}
						structuredData={blogPostingStructuredData({
							title: post.title,
							description: post.description,
							pathname: `/blog/${post.slug}/`,
							image: `/og/blog/${post.slug}.png`,
							date: post.date,
							updated: post.updated,
							lang: post.lang,
						})}
						highlightsCode
						rendersEmbeds={hasEmbeds(html)}
						readerChrome
						assets={assets}
					>
						<article lang={post.lang}>
							<p className='font-mono text-sm text-muted-foreground'>
								<time dateTime={post.date}>{post.date}</time> · {post.minutes} min read
							</p>
							<h1 className='mt-3 text-4xl font-bold tracking-tight sm:text-5xl'>{post.title}</h1>
							<p className='mt-6 text-xl text-muted-foreground'>{post.description}</p>
							{/* The HTML comes from the post's own Markdown in this repository, rendered at build time by Ox Content. */}
							{/* oxlint-disable-next-line react/no-danger */}
							<div className='article-body mt-12' dangerouslySetInnerHTML={{ __html: html }} />
						</article>
						{/*
						 * The Back to top control of Ox Content's reader chrome (src/config/reader-chrome.ts). Its
						 * built-in theme renders this exact markup; src/client/reader-chrome.ts shows it once the
						 * page is scrolled, and global.css styles it.
						 */}
						{READER_CHROME.backToTop && (
							// The class is Ox Content's, styled by its reader-chrome.css rather than by Tailwind.
							// oxlint-disable-next-line shadcn/no-unknown-classes
							<button type='button' className='ox-back-to-top' data-ox-back-to-top='' hidden aria-label='Back to top'>
								Back to top
							</button>
						)}
					</SiteLayout>
				)
			},
		},
	])
