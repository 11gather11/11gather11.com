import type { ReactNode } from 'react'

import { NAV, SITE } from '../config/site.ts'
import { Document, type DocumentProps } from './Document.tsx'
import { Logo } from './Logo.tsx'
import { SocialLinks } from './SocialLinks.tsx'

/** Props for {@link SiteLayout}. */
export type SiteLayoutProps = Omit<DocumentProps, 'children'> & {
	children: ReactNode
}

/**
 * Chrome for every page except home: slim header and footer bands around one reading column.
 *
 * The bands use the inverted colour pair (navy on the light scheme, ivory on the dark one) so inner
 * pages carry the home page's two-tone identity without splitting the text, which stays in a single
 * centred column sized for reading.
 *
 * @example
 * <SiteLayout title='About' description='...' pathname='/about/' assets={assets}>
 *   <h1>About</h1>
 * </SiteLayout>
 */
export function SiteLayout({ children, ...documentProps }: SiteLayoutProps) {
	const { pathname } = documentProps
	return (
		<Document {...documentProps}>
			<div className='flex min-h-dvh flex-col'>
				<header className='bg-band text-band-foreground'>
					<div className='mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-8'>
						<a href='/' className='flex items-center gap-3 font-semibold tracking-tight sm:text-lg'>
							{/* The ivory tile on the navy band is the home page's seam motif at header size. */}
							<span className='flex size-9 items-center justify-center bg-band-foreground text-band'>
								<Logo className='size-7' />
							</span>
							{SITE.name}
						</a>
						<nav aria-label='Main'>
							<ul className='flex gap-4 text-sm sm:gap-8 sm:text-base'>
								{NAV.map(({ label, href }) => (
									<li key={href}>
										<a
											href={href}
											aria-current={pathname === href ? 'page' : undefined}
											className='decoration-2 underline-offset-8 hover:underline aria-[current=page]:underline'
										>
											{label}
										</a>
									</li>
								))}
							</ul>
						</nav>
					</div>
				</header>

				<main className='mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-8 sm:py-24'>{children}</main>

				<footer className='bg-band text-band-muted-foreground'>
					<div className='mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-6 text-sm sm:flex-row sm:justify-between sm:px-8'>
						<SocialLinks
							className='flex gap-6'
							linkClassName='inline-flex items-center gap-2 hover:text-band-foreground'
						/>
						<p>
							© {new Date().getFullYear()} {SITE.name}
						</p>
					</div>
				</footer>
			</div>
		</Document>
	)
}
