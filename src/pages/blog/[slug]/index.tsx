import { loadPosts } from '../../../blog/posts.ts'
import { SiteLayout } from '../../../components/SiteLayout.tsx'
import { renderHtml } from '../../../ssg/html.ts'
import type { PageRoutes } from '../../../ssg/route.ts'

/**
 * One page per published post at `/blog/<slug>/`. The `[slug]` directory name only documents the
 * dynamic segment; the URLs come from the posts in src/content/blog.
 */
export const routes: PageRoutes = async () =>
	(await loadPosts()).map((post) => ({
		path: `/blog/${post.slug}/`,
		render: ({ assets }) =>
			renderHtml(
				<SiteLayout
					title={post.title}
					description={post.description}
					pathname={`/blog/${post.slug}/`}
					ogType='article'
					publishedTime={post.date}
					assets={assets}
				>
					<article lang={post.lang}>
						<p className='font-mono text-sm text-muted-foreground'>
							<time dateTime={post.date}>{post.date}</time> · {post.minutes} min read
						</p>
						<h1 className='mt-3 text-4xl font-bold tracking-tight sm:text-5xl'>{post.title}</h1>
						<p className='mt-6 text-xl text-muted-foreground'>{post.description}</p>
						{/* The HTML comes from the post's own Markdown, rendered at build time with raw HTML dropped. */}
						{/* oxlint-disable-next-line react/no-danger */}
						<div className='article-body mt-12' dangerouslySetInnerHTML={{ __html: post.html }} />
					</article>
				</SiteLayout>
			),
	}))
