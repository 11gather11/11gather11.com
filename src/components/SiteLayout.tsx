import type { ReactNode } from 'react'

import { NAV, SITE } from '../config/site.ts'
import { Document, type DocumentProps } from './Document.tsx'

/** Props for {@link SiteLayout}. */
export type SiteLayoutProps = Omit<DocumentProps, 'children'> & {
	children: ReactNode
}

/**
 * Page chrome shared by every page: the header with navigation, the main landmark and the footer.
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
			<header className='flex items-center justify-between gap-4 py-6'>
				<a href='/' className='font-semibold tracking-tight'>
					{SITE.name}
				</a>
				<nav aria-label='Main'>
					<ul className='flex gap-6'>
						{NAV.map(({ label, href }) => (
							<li key={href}>
								<a
									href={href}
									aria-current={pathname === href ? 'page' : undefined}
									className='text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground'
								>
									{label}
								</a>
							</li>
						))}
					</ul>
				</nav>
			</header>
			<main>{children}</main>
			<footer className='border-t border-border py-6 text-sm text-muted-foreground'>
				<p>
					© {new Date().getFullYear()} {SITE.name}
				</p>
			</footer>
		</Document>
	)
}
