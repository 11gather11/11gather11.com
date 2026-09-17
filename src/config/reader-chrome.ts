import type { ReaderChromeOptions } from '@ox-content/vite-plugin'

/**
 * Ox Content reader chrome on blog posts, shared by the Markdown transform in vite.config.ts and the
 * post page, which must mark its article with the same controls for the browser script to find them.
 *
 * - `copy`: a Copy button on code blocks.
 * - `backToTop`: a Back to top button once the reader has scrolled.
 * - `externalLinks`, which adds an outbound icon, is off. Links in posts already open in a new tab
 *   without it: Ox Content's Markdown renderer adds `target="_blank" rel="noopener noreferrer"` to http(s)
 *   links by default (`linkTargetBlank`). In 3.2.6 the option rewrites every outbound link, including
 *   those inside embed cards: it drops their aria-label, so X's icon-only links lose their names, and the
 *   rewritten tags no longer match hideTweetAvatarLinks. Lighthouse accessibility fell from 100 to 97.
 */
export const READER_CHROME = {
	copy: true,
	externalLinks: false,
	backToTop: true,
} as const satisfies Required<ReaderChromeOptions>
