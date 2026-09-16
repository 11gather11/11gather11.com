import { ComingSoon } from '../../components/ComingSoon.tsx'
import { SiteLayout } from '../../components/SiteLayout.tsx'
import { renderHtml } from '../../ssg/html.ts'
import type { PageRoutes } from '../../ssg/route.ts'

/** Blog page; a placeholder until the section is written. */
export const routes: PageRoutes = () => [
	{
		path: '/blog/',
		render: ({ assets }) =>
			renderHtml(
				<SiteLayout title='Blog' description='Blog of 11gather11.' pathname='/blog/' assets={assets}>
					<ComingSoon title='Blog' />
				</SiteLayout>
			),
	},
]
