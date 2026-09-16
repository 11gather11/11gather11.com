import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

/**
 * Renders a React document to a complete HTML string.
 *
 * Uses `renderToStaticMarkup` because the pages are never hydrated: it omits the markers
 * hydration needs, which keeps the HTML smaller. React cannot emit a doctype, so it is prepended.
 *
 * @param document - Element whose root renders `<html>`.
 * @returns HTML ready to write to disk or send from the dev server.
 * @example
 * renderHtml(<Document title='About'>...</Document>)
 */
export function renderHtml(document: ReactElement): string {
	return `<!doctype html>${renderToStaticMarkup(document)}`
}
