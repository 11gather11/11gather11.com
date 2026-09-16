import { SITE } from '../../config/site.ts'
import { renderSitemap } from '../../seo/sitemap.ts'
import type { PageRoutes } from '../../ssg/route.ts'

/** Sitemap of every HTML page, referenced from public/robots.txt. */
export const routes: PageRoutes = () => [
	{
		path: '/sitemap.xml',
		render: ({ paths }) => renderSitemap(SITE.origin, paths),
	},
]
