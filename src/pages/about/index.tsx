import { SiteLayout } from '../../components/SiteLayout.tsx'
import { OWNER, SOCIALS } from '../../config/site.ts'
import { profileStructuredData } from '../../seo/structured-data.ts'
import { renderHtml } from '../../ssg/html.ts'
import type { PageRoutes } from '../../ssg/route.ts'

const DESCRIPTION = 'About Ryusei Igarashi (11gather11), a software engineer who enjoys cooking, games and streaming.'

/** About page. */
export const routes: PageRoutes = () => [
	{
		path: '/about/',
		render: ({ assets }) =>
			renderHtml(
				<SiteLayout
					title='About'
					description={DESCRIPTION}
					pathname='/about/'
					structuredData={profileStructuredData('/about/')}
					assets={assets}
				>
					<article>
						<h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>About</h1>
						<p className='mt-8 text-2xl font-semibold tracking-tight sm:text-3xl'>
							{OWNER.name} <span lang='ja'>({OWNER.japaneseName})</span>
						</p>
						<p className='mt-2 text-lg text-muted-foreground'>I'm a software engineer.</p>

						<h2 className='mt-16 text-2xl font-bold tracking-tight sm:text-3xl'>Outside of work</h2>
						<p className='mt-4 text-lg'>
							I love cooking and playing games, and I stream my gameplay on Twitch and YouTube.
						</p>
						<ul className='mt-6 flex flex-col gap-4 text-lg sm:flex-row sm:gap-10'>
							<li>
								<a href={SOCIALS.twitch} className='inline-flex items-center gap-3 underline-offset-4 hover:underline'>
									<span className='iconify simple-icons--twitch size-7' aria-hidden='true' />
									Twitch
								</a>
							</li>
							<li>
								<a href={SOCIALS.youtube} className='inline-flex items-center gap-3 underline-offset-4 hover:underline'>
									<span className='iconify simple-icons--youtube size-7' aria-hidden='true' />
									YouTube
								</a>
							</li>
						</ul>
					</article>
				</SiteLayout>
			),
	},
]
