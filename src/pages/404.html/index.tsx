import { Document } from '../../components/Document.tsx'
import { renderHtml } from '../../ssg/html.ts'
import type { PageRoutes } from '../../ssg/route.ts'

/** Not-found page; wrangler.jsonc serves it for unknown paths through `not_found_handling`. */
export const routes: PageRoutes = () => [
	{
		path: '/404.html',
		render: ({ assets }) =>
			renderHtml(
				<Document title='404' description='Page not found' assets={assets}>
					<main>
						<h1>404</h1>
						<p>This page could not be found.</p>
						<p>
							<a href='/'>Back to home</a>
						</p>
					</main>
				</Document>
			),
	},
]
