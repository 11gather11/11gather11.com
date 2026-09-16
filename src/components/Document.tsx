import type { ReactNode } from 'react'

import { SITE } from '../config/site.ts'
import type { SiteAssets } from '../ssg/route.ts'

/** Props for {@link Document}. */
export type DocumentProps = {
	/** Page title; omit on the home page to show the site name alone. */
	title?: string
	description: string
	/** Public URL path of the page, used for the canonical URL; omit for pages served at many URLs, such as 404. */
	pathname?: string
	lang?: string
	assets: SiteAssets
	children: ReactNode
}

/**
 * The `<html>` shell shared by every page: metadata, stylesheets and the body.
 *
 * @example
 * <Document description='...' pathname='/' assets={assets}>
 *   <main>...</main>
 * </Document>
 */
export function Document({ title, description, pathname, lang = SITE.defaultLang, assets, children }: DocumentProps) {
	return (
		<html lang={lang}>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<title>{title === undefined ? SITE.name : `${title} | ${SITE.name}`}</title>
				<meta name='description' content={description} />
				{pathname !== undefined && <link rel='canonical' href={new URL(pathname, SITE.origin).href} />}
				{assets.stylesheets.map((href) => (
					<link key={href} rel='stylesheet' href={href} />
				))}
			</head>
			<body>{children}</body>
		</html>
	)
}
