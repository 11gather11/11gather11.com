import { readFileSync } from 'node:fs'
import path from 'node:path'

/** A font file for the Open Graph image renderer, in the shape Ox Content's Satori options take. */
export type OgFont = {
	path: string
	name: string
	weight: 400 | 700
}

const GEIST_DIR = 'node_modules/geist/dist/fonts/geist-sans'
const NOTO_JP_DIR = 'node_modules/@fontsource/noto-sans-jp'

/**
 * Parses a CSS `unicode-range` value into inclusive code point ranges.
 *
 * @param value - Comma-separated `U+XXXX` or `U+XXXX-YYYY` entries.
 * @returns `[start, end]` pairs.
 * @example
 * parseUnicodeRange('U+3000-303f,U+ff01') // [[0x3000, 0x303f], [0xff01, 0xff01]]
 */
export function parseUnicodeRange(value: string): Array<[number, number]> {
	return value.split(',').map((entry) => {
		const [start, end] = entry.trim().replace(/^U\+/i, '').split('-')
		const first = Number.parseInt(start ?? '', 16)
		return [first, end === undefined ? first : Number.parseInt(end, 16)]
	})
}

/**
 * Picks the Noto Sans JP subset files that contain the characters of some text.
 *
 * Fontsource splits Noto Sans JP into about 120 numbered subsets by unicode range. Satori needs a
 * font for every glyph it draws, and cannot read woff2, so loading only the woff subsets a title
 * actually uses keeps each Japanese image from reading the whole family.
 *
 * @param text - Text the image will draw.
 * @param ranges - Subset name to unicode-range, as in Fontsource's unicode.json.
 * @returns Subset names, in the order `ranges` lists them.
 * @example
 * pickSubsets('日本語', { '[0]': 'U+65e5,U+672c', '[1]': 'U+8a9e', latin: 'U+0000-00ff' }) // ['[0]', '[1]']
 */
export function pickSubsets(text: string, ranges: Record<string, string>): string[] {
	// Iterating a string yields whole code points, which is the unit unicode-range describes.
	const codePoints = new Set<number>()
	for (const char of text) {
		codePoints.add(char.codePointAt(0) ?? 0)
	}
	return Object.entries(ranges)
		.filter(([, value]) => {
			const parsed = parseUnicodeRange(value)
			return [...codePoints].some((point) => parsed.some(([start, end]) => point >= start && point <= end))
		})
		.map(([name]) => name)
}

/**
 * Lists the fonts an Open Graph image needs for its text.
 *
 * Geist comes first so Latin text keeps the site's typeface; Satori falls back to later fonts only
 * for glyphs Geist lacks, which is where the Japanese subsets are used.
 *
 * @param root - Project root.
 * @param text - Every string the image draws.
 * @returns Regular and bold fonts for Geist, plus the Noto Sans JP subsets the text needs.
 */
export function ogFonts(root: string, text: string): OgFont[] {
	const ranges = JSON.parse(readFileSync(path.join(root, NOTO_JP_DIR, 'unicode.json'), 'utf8')) as Record<
		string,
		string
	>
	// Numbered subsets hold the CJK characters; the named ones (latin, cyrillic…) are covered by Geist.
	const japanese = pickSubsets(text, ranges)
		.filter((name) => name.startsWith('['))
		.map((name) => name.slice(1, -1))
	return [
		{ path: path.join(root, GEIST_DIR, 'Geist-Regular.ttf'), name: 'Geist', weight: 400 },
		{ path: path.join(root, GEIST_DIR, 'Geist-Bold.ttf'), name: 'Geist', weight: 700 },
		// Each subset gets its own family name: Satori keeps one font per name and weight, so subsets sharing
		// "Noto Sans JP" replaced one another and most characters rendered as missing glyphs. With distinct
		// names every subset stays loaded, and Satori's per-glyph fallback finds the one holding each character.
		...japanese.flatMap((subset): OgFont[] => [
			{
				path: path.join(root, NOTO_JP_DIR, `files/noto-sans-jp-${subset}-400-normal.woff`),
				name: `Noto Sans JP ${subset}`,
				weight: 400,
			},
			{
				path: path.join(root, NOTO_JP_DIR, `files/noto-sans-jp-${subset}-700-normal.woff`),
				name: `Noto Sans JP ${subset}`,
				weight: 700,
			},
		]),
	]
}

if (import.meta.vitest) {
	const { describe, expect, test } = import.meta.vitest

	describe('parseUnicodeRange', () => {
		test('reads single code points and ranges', () => {
			expect(parseUnicodeRange('U+3000-303f, U+ff01')).toEqual([
				[0x3000, 0x303f],
				[0xff01, 0xff01],
			])
		})
	})

	describe('pickSubsets', () => {
		const ranges = { '[0]': 'U+65e5,U+672c', '[1]': 'U+8a9e', '[2]': 'U+4e00', latin: 'U+0000-00ff' }

		test('selects only the subsets holding the text', () => {
			expect(pickSubsets('日本語', ranges)).toEqual(['[0]', '[1]'])
		})

		test('selects nothing for text no subset covers', () => {
			expect(pickSubsets('😀', ranges)).toEqual([])
		})
	})
}
