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
	/** Open Graph object type: `article` for blog posts, `website` for everything else. */
	ogType?: 'website' | 'article'
	/** Publication date of an article, `YYYY-MM-DD`. */
	publishedTime?: string
	/** Link the syntax colour stylesheet, for pages that render highlighted code. */
	highlightsCode?: boolean
	assets: SiteAssets
	children: ReactNode
}

/**
 * The `<html>` shell shared by every page: metadata, stylesheets and the body.
 *
 * Every page carries Open Graph and Twitter card tags pointing at one shared image, so links shared
 * anywhere preview with the site's two-tone mark. The two `theme-color` values follow the colour
 * scheme so browser chrome matches the page background.
 *
 * @example
 * <Document description='...' pathname='/' assets={assets}>
 *   <main>...</main>
 * </Document>
 */
export function Document({
	title,
	description,
	pathname,
	lang = SITE.defaultLang,
	ogType = 'website',
	publishedTime,
	highlightsCode = false,
	assets,
	children,
}: DocumentProps) {
	const fullTitle = title === undefined ? SITE.name : `${title} | ${SITE.name}`
	const url = pathname === undefined ? undefined : new URL(pathname, SITE.origin).href
	return (
		<html lang={lang}>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<title>{fullTitle}</title>
				<meta name='description' content={description} />
				<meta name='theme-color' media='(prefers-color-scheme: light)' content='#f8f3e8' />
				<meta name='theme-color' media='(prefers-color-scheme: dark)' content='#15264a' />
				{/* ICO for browsers without SVG favicons; the SVG switches colour with the OS theme. */}
				<link rel='icon' href='/favicon.ico' sizes='32x32' />
				<link rel='icon' href='/icon.svg' type='image/svg+xml' />
				<link rel='apple-touch-icon' href='/apple-touch-icon.png' />
				{url !== undefined && <link rel='canonical' href={url} />}
				<link rel='alternate' type='application/rss+xml' title={`Blog | ${SITE.name}`} href='/blog/feed.xml' />

				<meta property='og:site_name' content={SITE.name} />
				<meta property='og:title' content={fullTitle} />
				<meta property='og:description' content={description} />
				<meta property='og:type' content={ogType} />
				{url !== undefined && <meta property='og:url' content={url} />}
				<meta property='og:image' content={new URL('/og.png', SITE.origin).href} />
				<meta property='og:image:width' content='1200' />
				<meta property='og:image:height' content='630' />
				<meta property='og:image:alt' content={`${SITE.name} logo on an ivory and navy background`} />
				{publishedTime !== undefined && <meta property='article:published_time' content={publishedTime} />}
				<meta name='twitter:card' content='summary_large_image' />

				{assets.stylesheets.map((href) => (
					<link key={href} rel='stylesheet' href={href} />
				))}
				{highlightsCode && assets.syntaxStylesheet !== undefined && (
					<link rel='stylesheet' href={assets.syntaxStylesheet} />
				)}
			</head>
			<body className='bg-background font-sans leading-7 text-foreground antialiased'>{children}</body>
		</html>
	)
}
