import { ComingSoon } from '../../components/ComingSoon.tsx'
import { SiteLayout } from '../../components/SiteLayout.tsx'
import { renderHtml } from '../../ssg/html.ts'
import type { PageRoutes } from '../../ssg/route.ts'

/** About page; a placeholder until the section is written. */
export const routes: PageRoutes = () => [
	{
		path: '/about/',
		render: ({ assets }) =>
			renderHtml(
				<SiteLayout title='About' description='About of 11gather11.' pathname='/about/' assets={assets}>
					<ComingSoon title='About' />
				</SiteLayout>
			),
	},
]
