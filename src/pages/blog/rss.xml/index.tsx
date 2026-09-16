import { loadPosts } from '../../../blog/posts.ts'
import { renderRss } from '../../../blog/rss.ts'
import { SITE } from '../../../config/site.ts'
import type { PageRoutes } from '../../../ssg/route.ts'

/** RSS feed of published posts, linked from every page's head. */
export const routes: PageRoutes = () => [
	{
		path: '/blog/rss.xml',
		render: async () =>
			renderRss(
				{
					title: `Blog | ${SITE.name}`,
					description: `Posts by ${SITE.name}.`,
					siteUrl: `${SITE.origin}/`,
					feedUrl: `${SITE.origin}/blog/rss.xml`,
					lang: SITE.defaultLang,
				},
				await loadPosts()
			),
	},
]
