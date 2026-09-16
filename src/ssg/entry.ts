import { outputFileName } from './output.ts'
import { createRouteTable, type PageModule, type RouteTable, type SiteContext } from './route.ts'

// Eager so the SSR bundle contains every page and nothing lists them by hand.
const modules = import.meta.glob<PageModule>('/src/pages/**/index.tsx', { eager: true })

/** One file of the built site. */
export type RenderedFile = {
	/** Path relative to the output directory. */
	fileName: string
	body: string
}

/**
 * Renders the route at a URL path, for the dev server.
 *
 * @param pathname - Requested URL path.
 * @param context - Assets as the dev server serves them.
 * @returns The response body, or `undefined` when no route has this path.
 */
export async function renderPath(pathname: string, context: SiteContext): Promise<string | undefined> {
	const table = await createRouteTable(modules)
	return table.get(pathname)?.render({ ...context, paths: sortedPaths(table) })
}

/**
 * Lists every route path, so the dev server can tell a missing trailing slash from a missing page.
 *
 * @returns All route paths of the site.
 */
export async function listPaths(): Promise<string[]> {
	return [...(await createRouteTable(modules)).keys()]
}

/**
 * Renders every route of the site, for the build.
 *
 * @param context - Assets as the client build emitted them.
 * @returns One file per route.
 */
export async function renderSite(context: SiteContext): Promise<RenderedFile[]> {
	const table = await createRouteTable(modules)
	const paths = sortedPaths(table)
	return Promise.all(
		[...table.values()].map(async (route) => ({
			fileName: outputFileName(route.path),
			body: await route.render({ ...context, paths }),
		}))
	)
}

/**
 * Lists a table's paths in a stable order, so generated lists such as the sitemap do not depend on
 * the order `import.meta.glob` happens to return modules in.
 *
 * @param table - Route table.
 * @returns Paths sorted by code unit.
 */
function sortedPaths(table: RouteTable): string[] {
	return [...table.keys()].toSorted()
}
