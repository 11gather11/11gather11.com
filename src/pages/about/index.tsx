import { SiteLayout } from '../../components/SiteLayout.tsx'
import { renderHtml } from '../../ssg/html.ts'
import type { PageRoutes } from '../../ssg/route.ts'

const DESCRIPTION = 'About Ryusei Igarashi (11gather11), a software engineer who enjoys cooking, games and streaming.'

/** About page. */
export const routes: PageRoutes = () => [
	{
		path: '/about/',
		render: ({ assets }) =>
			renderHtml(
				<SiteLayout title='About' description={DESCRIPTION} pathname='/about/' assets={assets}>
					<article>
						<h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>About</h1>
						<p className='mt-8 text-2xl font-semibold tracking-tight sm:text-3xl'>
							Ryusei Igarashi <span lang='ja'>(五十嵐 隆晟)</span>
						</p>
						<p className='mt-2 text-lg text-muted-foreground'>I'm a software engineer.</p>

						<h2 className='mt-16 text-2xl font-bold tracking-tight sm:text-3xl'>Outside of work</h2>
						<p className='mt-4 text-lg'>
							I love cooking and playing games, and I stream my gameplay on Twitch and YouTube.
						</p>
						<ul className='mt-6 flex flex-col gap-4 text-lg sm:flex-row sm:gap-10'>
							<li>
								<a
									href='https://www.twitch.tv/igara4ryusei'
									className='inline-flex items-center gap-3 underline-offset-4 hover:underline'
								>
									<span className='iconify simple-icons--twitch size-7' aria-hidden='true' />
									Twitch
								</a>
							</li>
							<li>
								<a
									href='https://www.youtube.com/@igara4ryusei'
									className='inline-flex items-center gap-3 underline-offset-4 hover:underline'
								>
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
