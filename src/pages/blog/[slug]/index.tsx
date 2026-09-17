import { loadPosts } from '../../../blog/posts.ts'
import { renderOgImage } from '../../../og/render.ts'
import { blogPostingStructuredData } from '../../../seo/structured-data.ts'
import { SiteLayout } from '../../../components/SiteLayout.tsx'
import { renderHtml } from '../../../ssg/html.ts'
import type { PageRoutes } from '../../../ssg/route.ts'

/**
 * One page per published post at `/blog/<slug>/`, plus its Open Graph image at `/og/blog/<slug>.png`.
 * The `[slug]` directory name only documents the dynamic segment; the URLs come from the posts in
 * src/content/blog.
 */
export const routes: PageRoutes = ({ includeDrafts }) =>
	loadPosts(includeDrafts).flatMap((post) => [
		{
			path: `/og/blog/${post.slug}.png`,
			render: ({ root }) => renderOgImage(root, { title: post.title, description: post.description, date: post.date }),
		},
		{
			path: `/blog/${post.slug}/`,
			inputPath: post.file,
			render: async ({ assets, renderMarkdown }) =>
				renderHtml(
					<SiteLayout
						title={post.title}
						description={post.description}
						pathname={`/blog/${post.slug}/`}
						ogType='article'
						publishedTime={post.date}
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
							<div
								className='article-body mt-12'
								dangerouslySetInnerHTML={{ __html: await renderMarkdown(post.body, post.file) }}
							/>
						</article>
					</SiteLayout>
				),
		},
	])
