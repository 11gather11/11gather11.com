// A task item as Ox Content renders it: `<li><input type="checkbox" …> text`, where the text runs up to
// the end of the line, a nested list, or the end of the item.
const TASK_ITEM = /<li>(<input type="checkbox"[^>]*>)([^<\n]*(?:<(?!\/li>|ul>|ol>|li>)[^<\n]*)*)/g

/**
 * Wraps each GFM task-list checkbox and its text in a `<label>`.
 *
 * Markdown renders task items as bare disabled checkboxes, which Lighthouse's accessibility audit
 * reports as form controls without labels. Wrapping the checkbox with the item's own text gives each
 * one an accessible name without changing how the list looks.
 *
 * @param html - Rendered post body.
 * @returns The body with labelled task items.
 * @example
 * labelTaskListItems('<li><input type="checkbox" disabled> Write tests</li>')
 * // '<li><label><input type="checkbox" disabled> Write tests</label></li>'
 */
export function labelTaskListItems(html: string): string {
	return html.replace(TASK_ITEM, (_, checkbox: string, text: string) => `<li><label>${checkbox}${text}</label>`)
}

if (import.meta.vitest) {
	const { describe, expect, test } = import.meta.vitest

	describe('labelTaskListItems', () => {
		test('labels checked and unchecked items', () => {
			expect(
				labelTaskListItems(
					'<ul>\n<li><input type="checkbox" checked disabled> Done</li>\n<li><input type="checkbox" disabled> Open</li>\n</ul>'
				)
			).toBe(
				'<ul>\n<li><label><input type="checkbox" checked disabled> Done</label></li>\n<li><label><input type="checkbox" disabled> Open</label></li>\n</ul>'
			)
		})

		test('keeps inline markup inside the label', () => {
			expect(labelTaskListItems('<li><input type="checkbox" disabled> Ship <code>v1</code> now</li>')).toBe(
				'<li><label><input type="checkbox" disabled> Ship <code>v1</code> now</label></li>'
			)
		})

		test('stops before a nested list', () => {
			expect(
				labelTaskListItems('<li><input type="checkbox" disabled> Parent\n<ul>\n<li>Child</li>\n</ul>\n</li>')
			).toBe('<li><label><input type="checkbox" disabled> Parent</label>\n<ul>\n<li>Child</li>\n</ul>\n</li>')
		})

		test('leaves ordinary list items alone', () => {
			expect(labelTaskListItems('<li>Plain</li>')).toBe('<li>Plain</li>')
		})
	})
}
