import { SiteLayout } from '../../components/SiteLayout.tsx'
import { SITE } from '../../config/site.ts'
import { renderHtml } from '../../ssg/html.ts'
import type { PageRoutes } from '../../ssg/route.ts'

/** Blog index: every published post, newest first. */
export const routes: PageRoutes = ({ posts }) => [
	{
		path: '/blog/',
		render: ({ assets }) => {
			const listed = posts.filter((post) => post.listed)
			return renderHtml(
				<SiteLayout title='Blog' description={`Posts by ${SITE.name}.`} pathname='/blog/' assets={assets}>
					<h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>Blog</h1>
					{listed.length === 0 ? (
						<p className='mt-4 text-lg text-muted-foreground'>No posts yet.</p>
					) : (
						<ul className='mt-12'>
							{listed.map((post) => (
								<li
									key={post.slug}
									lang={post.lang}
									className='flex flex-col gap-1 border-b border-border py-6 sm:flex-row sm:gap-8'
								>
									<time
										dateTime={post.date}
										className='shrink-0 font-mono text-sm text-muted-foreground sm:w-28 sm:pt-1'
									>
										{post.date}
									</time>
									<div>
										<a
											href={`/blog/${post.slug}/`}
											className='text-xl font-semibold tracking-tight underline-offset-4 hover:underline'
										>
											{post.title}
										</a>
										<p className='mt-1 text-muted-foreground'>{post.description}</p>
									</div>
								</li>
							))}
						</ul>
					)}
				</SiteLayout>
			)
		},
	},
]
