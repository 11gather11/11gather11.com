import { Document } from '../components/Document.tsx'
import { Logo } from '../components/Logo.tsx'
import { SocialLinks } from '../components/SocialLinks.tsx'
import { NAV, SITE } from '../config/site.ts'
import { renderHtml } from '../ssg/html.ts'
import type { PageRoutes } from '../ssg/route.ts'

const DESCRIPTION = `${SITE.name} ${SITE.tagline}.`

/**
 * Home page: the viewport splits into a background half (name and tagline) and a band half
 * (navigation, social links, footer), with the logo tile straddling the seam.
 *
 * Desktop splits left and right; below the `md` breakpoint the halves stack, so the seam turns
 * horizontal. Both halves are equal, which puts the seam at the centre of the page in either
 * direction, so the tile is simply centred on the page.
 */
export const routes: PageRoutes = () => [
	{
		path: '/',
		render: ({ assets }) =>
			renderHtml(
				<Document description={DESCRIPTION} pathname='/' assets={assets}>
					<div className='relative grid min-h-dvh grid-rows-2 md:grid-cols-2 md:grid-rows-1'>
						<main className='flex flex-col justify-center px-8 pb-16 md:px-16 md:pr-24 md:pb-0 lg:px-24 lg:pr-32'>
							<h1 className='text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl'>{SITE.name}</h1>
							<p className='mt-3 text-xl text-muted-foreground sm:text-2xl'>{SITE.tagline}</p>
						</main>

						<div className='flex flex-col justify-center bg-band px-8 pt-16 text-band-foreground md:px-16 md:pt-0 md:pl-24 lg:px-24 lg:pl-32'>
							<nav aria-label='Main'>
								<ul className='flex gap-8 text-xl sm:text-2xl'>
									{NAV.map(({ label, href }) => (
										<li key={href}>
											<a href={href} className='decoration-2 underline-offset-8 hover:underline'>
												{label}
											</a>
										</li>
									))}
								</ul>
							</nav>
							<SocialLinks
								className='mt-8 flex gap-6'
								linkClassName='inline-flex items-center gap-2 text-band-muted-foreground hover:text-band-foreground'
							/>
							<footer className='mt-12 text-sm text-band-muted-foreground md:absolute md:right-16 md:bottom-8 md:mt-0 lg:right-24'>
								<p>
									© {new Date().getFullYear()} {SITE.name}
								</p>
							</footer>
						</div>

						{/* The navy tile reads as a square on the ivory half and merges into the navy half. */}
						<a
							href='/'
							aria-label={`${SITE.name} home`}
							className='absolute top-1/2 left-1/2 flex size-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-band text-band-foreground md:size-32'
						>
							<Logo className='size-18 md:size-24' />
						</a>
					</div>
				</Document>
			),
	},
]
