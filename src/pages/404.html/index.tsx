import { SiteLayout } from '../../components/SiteLayout.tsx'
import { renderHtml } from '../../ssg/html.ts'
import type { PageRoutes } from '../../ssg/route.ts'

/** Not-found page; wrangler.jsonc serves it for unknown paths through `not_found_handling`. */
export const routes: PageRoutes = () => [
	{
		path: '/404.html',
		render: ({ assets }) =>
			renderHtml(
				<SiteLayout title='404' description='Page not found' assets={assets}>
					<section className='py-16'>
						<h1 className='text-3xl font-bold tracking-tight'>404</h1>
						<p className='mt-2 text-muted-foreground'>This page could not be found.</p>
						<p className='mt-6'>
							<a href='/' className='underline underline-offset-4'>
								Back to home
							</a>
						</p>
					</section>
				</SiteLayout>
			),
	},
]
