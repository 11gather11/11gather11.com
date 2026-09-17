import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { generateOgImages, resolveOgImageOptions } from '@ox-content/vite-plugin'

import { ogFonts } from './fonts.ts'

/** What an Open Graph image shows. */
export type OgImageContent = {
	title: string
	description?: string
	/** Publication date, `YYYY-MM-DD`. */
	date?: string
}

// Ox Content bundles the template to one fixed file under .cache/og-images on every call, so two
// renders running at once could load each other's half-written bundle. Calls are chained instead.
let queue: Promise<unknown> = Promise.resolve()

/**
 * Renders a 1200x630 Open Graph PNG with Ox Content's Satori renderer and src/og/template.ts.
 *
 * Satori draws HTML without a browser, so builds need no Chromium. Ox Content caches each image by
 * its props, template and fonts under .cache/og-images, so unchanged posts are not redrawn.
 *
 * @param root - Project root.
 * @param content - Title, description and date to draw.
 * @returns PNG bytes.
 * @throws If rendering fails, so a broken image fails the build instead of shipping.
 */
export function renderOgImage(root: string, content: OgImageContent): Promise<Uint8Array> {
	const run = queue.then(async () => {
		const text = [content.title, content.description ?? '', content.date ?? '', '11gather11'].join('')
		const options = resolveOgImageOptions({
			renderer: 'satori',
			template: 'src/og/template.ts',
			width: 1200,
			height: 630,
			cache: true,
			concurrency: 1,
			satori: { fonts: ogFonts(root, text), systemFontFallback: false },
		})
		// generateOgImages writes to disk; a name derived from the content keeps concurrent posts apart.
		const key = createHash('sha256').update(JSON.stringify(content)).digest('hex').slice(0, 16)
		const outputPath = path.join(root, '.cache', 'og-render', `${key}.png`)
		const [result] = await generateOgImages(
			[{ props: { ...content, siteName: '11gather11' }, outputPath }],
			options,
			root
		)
		if (result === undefined || result.error !== undefined) {
			throw new Error(`Open Graph image for "${content.title}" failed: ${result?.error ?? 'no result'}`)
		}
		return new Uint8Array(await readFile(outputPath))
	})
	// Keep the chain alive after a failure; the caller still sees the rejection through `run`.
	queue = run.catch(() => undefined)
	return run
}
