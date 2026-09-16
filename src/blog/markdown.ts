import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

// Built once: the processor is stateless between runs, and freezing it avoids re-resolving plugins
// for every post. Raw HTML in Markdown is dropped rather than passed through, so a post cannot
// smuggle in scripts or inline styles.
const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype)
	.use(rehypeSlug)
	.use(rehypeStringify)
	.freeze()

/**
 * Converts a post's Markdown body to HTML at build time.
 *
 * Supports GitHub Flavored Markdown (tables, task lists, strikethrough, autolinks). Headings get
 * `id` attributes so sections can be linked to. Code blocks stay unhighlighted; the article styles
 * render them in one colour so their contrast is guaranteed in both schemes.
 *
 * @param markdown - Post body without frontmatter.
 * @returns HTML for the article body.
 * @example
 * await renderMarkdown('## Setup') // '<h2 id="setup">Setup</h2>'
 */
export async function renderMarkdown(markdown: string): Promise<string> {
	return String(await processor.process(markdown))
}

if (import.meta.vitest) {
	const { describe, expect, test } = import.meta.vitest

	describe('renderMarkdown', () => {
		test('gives headings ids for anchor links', async () => {
			expect(await renderMarkdown('## Getting started')).toBe('<h2 id="getting-started">Getting started</h2>')
		})

		test('renders GFM tables', async () => {
			const html = await renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |')
			expect(html).toContain('<table>')
			expect(html).toContain('<td>1</td>')
		})

		test('keeps code blocks as plain text with their language class', async () => {
			expect(await renderMarkdown('```ts\nconst a = 1 < 2\n```')).toBe(
				'<pre><code class="language-ts">const a = 1 &#x3C; 2\n</code></pre>'
			)
		})

		test('drops raw HTML', async () => {
			const html = await renderMarkdown('<script>alert(1)</script>\n\nText')
			expect(html).not.toContain('<script>')
			expect(html).toContain('<p>Text</p>')
		})
	})
}
