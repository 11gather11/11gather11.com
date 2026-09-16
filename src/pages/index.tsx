import { Document } from '../components/Document.tsx'
import { SITE } from '../config/site.ts'
import { renderHtml } from '../ssg/html.ts'
import type { PageRoutes } from '../ssg/route.ts'

const DESCRIPTION = 'Personal website of 11gather11'

/** Home page. */
export const routes: PageRoutes = () => [
	{
		path: '/',
		render: ({ assets }) =>
			renderHtml(
				<Document description={DESCRIPTION} pathname='/' assets={assets}>
					<main>
						<h1>{SITE.name}</h1>
					</main>
				</Document>
			),
	},
]
