import type { ReactNode } from 'react'

/** Props for {@link ExternalLink}. */
export type ExternalLinkProps = {
	href: string
	className?: string
	children: ReactNode
}

/**
 * A link from the site's own pages to another site, opened in a new tab like the http(s) links in posts,
 * which Ox Content's Markdown renderer opens in a new tab by default.
 *
 * `noopener` keeps the new tab from reaching back into this page through `window.opener`, and
 * `noreferrer` sends no Referer. Screen readers hear that the link opens a new tab, since a tab that
 * appears without warning is disorienting; sighted readers get no extra mark, because these links
 * already show the destination's brand icon.
 *
 * @example
 * <ExternalLink href='https://github.com/11gather11'>GitHub</ExternalLink>
 */
export function ExternalLink({ href, className, children }: ExternalLinkProps) {
	return (
		<a href={href} target='_blank' rel='noopener noreferrer' className={className}>
			{children}
			<span className='sr-only'> (opens in a new tab)</span>
		</a>
	)
}
