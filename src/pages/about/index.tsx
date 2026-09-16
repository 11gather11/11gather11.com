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
					<article className='py-16'>
						<h1 className='text-3xl font-bold tracking-tight'>About</h1>
						<p className='mt-2 text-muted-foreground'>
							Ryusei Igarashi <span lang='ja'>(五十嵐 隆晟)</span>
						</p>

						<p className='mt-8'>I'm a software engineer.</p>

						<h2 className='mt-12 text-xl font-semibold tracking-tight'>Outside of work</h2>
						<p className='mt-4'>I love cooking and playing games, and I stream my gameplay on Twitch and YouTube.</p>
						<ul className='mt-4 flex flex-col gap-2'>
							<li>
								<a
									href='https://www.twitch.tv/igara4ryusei'
									className='inline-flex items-center gap-2 underline underline-offset-4'
								>
									<span className='iconify simple-icons--twitch size-5' aria-hidden='true' />
									Twitch
								</a>
							</li>
							<li>
								<a
									href='https://www.youtube.com/@igara4ryusei'
									className='inline-flex items-center gap-2 underline underline-offset-4'
								>
									<span className='iconify simple-icons--youtube size-5' aria-hidden='true' />
									YouTube
								</a>
							</li>
						</ul>
					</article>
				</SiteLayout>
			),
	},
]
