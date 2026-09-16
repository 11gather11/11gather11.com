// Loaded by vite.config.ts before Vite resolves anything, so imports here must stay relative
// and must not pull in page code.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
	isRunnableDevEnvironment,
	type BuildEnvironment,
	type Manifest,
	type Plugin,
	type ViteBuilder,
	type ViteDevServer,
} from 'vite-plus'

import type * as Entry from './entry.ts'
import type { SiteAssets } from './route.ts'

const ENTRY = 'src/ssg/entry.ts'
const STYLESHEET = 'src/styles/global.css'
// The SSR bundle only exists to be imported once during the build, so it lives outside dist/.
const SSR_OUT_DIR = 'node_modules/.ssg'
const SSR_ENTRY_FILE = 'entry.mjs'

/**
 * Renders the pages in `src/pages` to static HTML, with React only at build time.
 *
 * - Dev: each request for a route path is rendered on the fly through the SSR module runner.
 * - Build: the client environment emits the stylesheet, the SSR environment bundles the page
 *   renderer, and the renderer's output is written into the client's `dist/`. No page JavaScript
 *   is emitted.
 *
 * @returns The Vite plugin.
 * @example
 * export default defineConfig({ plugins: [ssg()] })
 */
export function ssg(): Plugin {
	let root = process.cwd()

	return {
		name: 'ssg',

		config() {
			return {
				// Opt `vp build` into the app builder so buildApp below drives both environments.
				builder: {},
				environments: {
					client: {
						build: {
							outDir: 'dist',
							emptyOutDir: true,
							manifest: true,
							rollupOptions: { input: STYLESHEET },
						},
					},
					ssr: {
						build: {
							outDir: SSR_OUT_DIR,
							emptyOutDir: true,
							rollupOptions: {
								input: ENTRY,
								output: { entryFileNames: SSR_ENTRY_FILE },
							},
						},
					},
				},
			}
		},

		configResolved(config) {
			root = config.root
		},

		configureServer(server) {
			server.middlewares.use((request, response, next) => {
				serveRoute(server, request.url, request.method)
					.then((result) => {
						if (result === undefined) {
							next()
							return
						}
						if (result.redirect !== undefined) {
							response.writeHead(308, { Location: result.redirect }).end()
							return
						}
						response.writeHead(200, { 'Content-Type': contentType(result.pathname) }).end(result.body)
					})
					.catch(next)
			})
		},

		// Pages are rendered on the server only, so a change can never hot-swap in the browser;
		// reload the page so the next request renders with the new code.
		hotUpdate({ modules, server }) {
			if (this.environment.name === 'ssr' && modules.length > 0) {
				// Sent through the client environment, since the browser is what has to reload.
				server.environments.client.hot.send({ type: 'full-reload' })
			}
		},

		buildApp: {
			order: 'pre',
			async handler(builder) {
				const client = buildEnvironment(builder, 'client')
				await builder.build(client)
				await builder.build(buildEnvironment(builder, 'ssr'))

				const clientOutDir = path.resolve(root, client.config.build.outDir)
				const ssrOutDir = path.resolve(root, SSR_OUT_DIR)
				const assets = await readBuiltAssets(clientOutDir)

				const entry = (await import(pathToFileURL(path.join(ssrOutDir, SSR_ENTRY_FILE)).href)) as typeof Entry
				for (const file of await entry.renderSite({ assets })) {
					const target = path.join(clientOutDir, file.fileName)
					await mkdir(path.dirname(target), { recursive: true })
					await writeFile(target, file.body)
				}

				// The manifest was only needed to find the stylesheet; do not deploy it.
				await rm(path.join(clientOutDir, '.vite'), { recursive: true, force: true })
				await rm(ssrOutDir, { recursive: true, force: true })
			},
		},
	}
}

/**
 * Looks up a build environment the plugin configures.
 *
 * @param builder - The app builder.
 * @param name - Environment name.
 * @returns The environment.
 * @throws If the environment is missing, which means the config hook did not apply.
 */
function buildEnvironment(builder: ViteBuilder, name: 'client' | 'ssr'): BuildEnvironment {
	const environment = builder.environments[name]
	if (environment === undefined) {
		throw new Error(`The ${name} build environment is missing`)
	}
	return environment
}

/** Result of matching a dev request against the routes. */
type ServeResult = { pathname: string; body: string; redirect?: undefined } | { redirect: string }

/**
 * Renders the route a dev request asks for.
 *
 * @returns The rendered body, a redirect to the trailing-slash form of a route, or `undefined`
 *   when the request is not for a route and should fall through to Vite.
 */
async function serveRoute(
	server: ViteDevServer,
	url: string | undefined,
	method: string | undefined
): Promise<ServeResult | undefined> {
	if (url === undefined || (method !== 'GET' && method !== 'HEAD')) {
		return undefined
	}
	const environment = server.environments.ssr
	if (!isRunnableDevEnvironment(environment)) {
		throw new Error('The ssr environment must be runnable to render pages in dev')
	}
	const { pathname } = new URL(url, 'http://localhost')
	const entry = (await environment.runner.import(`/${ENTRY}`)) as typeof Entry

	const body = await entry.renderPath(pathname, { assets: { stylesheets: [`/${STYLESHEET}`] } })
	if (body !== undefined) {
		// Inject Vite's client so saved changes trigger the full reload sent from hotUpdate.
		const html = pathname.endsWith('/') || pathname.endsWith('.html')
		return { pathname, body: html ? await server.transformIndexHtml(url, body) : body }
	}

	// Mirror Cloudflare, which redirects /about to /about/ when about/index.html exists.
	if (!pathname.endsWith('/') && (await entry.listPaths()).includes(`${pathname}/`)) {
		return { redirect: `${pathname}/` }
	}
	return undefined
}

/**
 * Reads the stylesheet URL the client build emitted.
 *
 * @param outDir - Client build output directory.
 * @returns Assets to link from the rendered pages.
 */
async function readBuiltAssets(outDir: string): Promise<SiteAssets> {
	const manifest = JSON.parse(await readFile(path.join(outDir, '.vite/manifest.json'), 'utf8')) as Manifest
	const chunk = manifest[STYLESHEET]
	if (chunk === undefined) {
		throw new Error(`The client build did not emit ${STYLESHEET}`)
	}
	return { stylesheets: [`/${chunk.file}`] }
}

/**
 * Picks the Content-Type for a dev response from the route path.
 *
 * @param pathname - Route path.
 * @returns A Content-Type header value.
 */
function contentType(pathname: string): string {
	if (pathname.endsWith('.xml')) {
		return 'application/xml; charset=utf-8'
	}
	if (pathname.endsWith('.txt')) {
		return 'text/plain; charset=utf-8'
	}
	return 'text/html; charset=utf-8'
}
