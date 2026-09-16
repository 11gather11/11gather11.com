import { ComingSoon } from '../../components/ComingSoon.tsx'
import { SiteLayout } from '../../components/SiteLayout.tsx'
import { renderHtml } from '../../ssg/html.ts'
import type { PageRoutes } from '../../ssg/route.ts'

/** Works page; a placeholder until the section is written. */
export const routes: PageRoutes = () => [
	{
		path: '/works/',
		render: ({ assets }) =>
			renderHtml(
				<SiteLayout title='Works' description='Works of 11gather11.' pathname='/works/' assets={assets}>
					<ComingSoon title='Works' />
				</SiteLayout>
			),
	},
]
