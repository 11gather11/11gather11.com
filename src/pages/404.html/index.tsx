import { Document } from '../../components/Document.tsx'
import { renderHtml } from '../../ssg/html.ts'
import type { PageRoutes } from '../../ssg/route.ts'

/** Not-found page; wrangler.jsonc serves it for unknown paths through `not_found_handling`. */
export const routes: PageRoutes = () => [
	{
		path: '/404.html',
		render: ({ assets }) =>
			renderHtml(
				<Document title='404' description='ページが見つかりませんでした' assets={assets}>
					<main>
						<h1>404</h1>
						<p>ページが見つかりませんでした。</p>
						<p>
							<a href='/'>トップへ戻る</a>
						</p>
					</main>
				</Document>
			),
	},
]
