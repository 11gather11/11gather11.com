import type { ReaderChromeOptions } from '@ox-content/vite-plugin'

/**
 * Ox Content reader chrome on blog posts, shared by the Markdown transform in vite.config.ts and the
 * post page, which must mark its article with the same controls for the browser script to find them.
 *
 * - `copy`: a Copy button on code blocks.
 * - `backToTop`: a Back to top button once the reader has scrolled.
 * - `externalLinks` is off. In Ox Content 3.2.6 it also marks every link inside embed cards, putting an
 *   icon after each X action and card title, and it opens every outbound link in a new tab.
 */
export const READER_CHROME = {
	copy: true,
	externalLinks: false,
	backToTop: true,
} as const satisfies Required<ReaderChromeOptions>
