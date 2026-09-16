import { Logo } from '../components/Logo.tsx'
import { SiteLayout } from '../components/SiteLayout.tsx'
import { SITE } from '../config/site.ts'
import { renderHtml } from '../ssg/html.ts'
import type { PageRoutes } from '../ssg/route.ts'

const DESCRIPTION = `${SITE.name} ${SITE.tagline}.`

/** Home page. */
export const routes: PageRoutes = () => [
	{
		path: '/',
		render: ({ assets }) =>
			renderHtml(
				<SiteLayout description={DESCRIPTION} pathname='/' assets={assets}>
					<section className='flex flex-col items-center gap-6 py-24 text-center'>
						<Logo className='size-28' />
						<div>
							<h1 className='text-4xl font-bold tracking-tight'>{SITE.name}</h1>
							<p className='mt-2 text-lg text-muted-foreground'>{SITE.tagline}</p>
						</div>
						<ul className='flex gap-2'>
							<li>
								<a
									href='https://github.com/11gather11'
									aria-label='GitHub'
									className='flex p-2 text-muted-foreground hover:text-foreground'
								>
									<span className='iconify simple-icons--github size-6' aria-hidden='true' />
								</a>
							</li>
						</ul>
					</section>
				</SiteLayout>
			),
	},
]
