import { modus } from '@ox-content/theme-color-modus'

/**
 * Syntax colours for highlighted code blocks.
 *
 * Modus is built for WCAG AAA on its own white and black backgrounds, but code here sits on the
 * site's code-surface tokens (#eae7df light, #273657 dark). Measured against those, three token
 * colours fell below AA's 4.5:1 and are replaced; every other token already clears it:
 *
 * - light comment: 4.19:1 -> #5c5c55, 5.45:1
 * - dark comment: 3.85:1 -> #b3b8c6, 6.05:1
 * - dark parameter: 4.02:1 -> #ff8a85, 5.27:1
 *
 * The block's own background and default text use the site's code-surface and foreground colours,
 * so highlighted blocks match the rest of the article instead of Modus's grey and black.
 *
 * The lowest remaining ratios are the dark string colour at 4.87:1 and the light function colour at
 * 5.70:1.
 */
export const syntaxTheme = {
	...modus,
	tokens: {
		...modus.tokens,
		'syntax-background': '#eae7df',
		'syntax-foreground': '#15264a',
		'syntax-token-comment': '#5c5c55',
	},
	darkTokens: {
		...modus.darkTokens,
		'syntax-background': '#273657',
		'syntax-foreground': '#f8f3e8',
		'syntax-token-comment': '#b3b8c6',
		'syntax-token-parameter': '#ff8a85',
	},
}
