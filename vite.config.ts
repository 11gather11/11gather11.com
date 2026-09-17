import { defineCollections, oxContentCustomHost, planCollectionAssetsFromDocuments } from '@ox-content/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { configDefaults, defineConfig } from 'vite-plus'

import { validatePost } from './src/blog/post.ts'
import { READER_CHROME } from './src/config/reader-chrome.ts'
import { loadPosts } from './src/blog/posts.ts'
import { syntaxTheme } from './src/config/syntax-theme.ts'

// How long fetched embed metadata on disk counts as fresh: link titles, article counts and package
// versions rarely change enough to be worth refetching on every build.
const METADATA_CACHE_TTL = 30 * 24 * 60 * 60 * 1000

const IGNORED_PATHS = ['dist/**', 'node_modules/**', '.direnv/**', '.wrangler/**']

export default defineConfig({
	// Ox Content's custom host serves and writes every page, so Vite adds no HTML fallback of its own.
	appType: 'custom',
	server: {
		watch: {
			ignored: ['**/.direnv/**'],
		},
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		// The host looks up the stylesheets' and scripts' hashed URLs in the manifest.
		manifest: true,
		rollupOptions: {
			input: ['src/styles/global.css', 'src/styles/embeds.css', 'src/client/reader-chrome.ts'],
		},
	},
	plugins: [
		tailwindcss(),
		oxContentCustomHost({
			host: './src/host.ts',
			build: {
				// Pages are finished documents; Vite's HTML transform would inject its dev client script.
				transformHtml: false,
				// Strips whitespace and comments from the written HTML; runs after rendering, so it cannot
				// change what React or Ox Content produced.
				minifyHtml: true,
			},
			oxContent: {
				srcDir: 'src/content',
				outDir: 'dist',
				gfm: true,
				highlight: true,
				// Visible `#` links next to headings, reusing the heading ids.
				headingPermalinks: true,
				// Title text becomes a <figcaption>, images load lazily, and {width= height=} sets dimensions.
				images: true,
				// Marks Japanese phrase boundaries at build time; `word-break: keep-all` in the article styles
				// then wraps only at those boundaries instead of in the middle of words.
				budoux: true,
				// No sanitizer: every post is written in this repository, and the sanitizer's fixed
				// attribute allow list drops things posts need, such as table column alignment.
				docs: false,
				search: false,
				siteMaps: true,
				// Posts are read as a collection: Ox Content parses the frontmatter and runs validatePost over
				// every post, failing the build once with all problems. `blog/**` rather than
				// `blog/*/index.md`, so a Markdown file in the wrong place fails validation instead of being
				// silently ignored.
				collections: defineCollections({
					blog: { source: 'blog/**/*.md', include: ['body'], validate: validatePost },
				}),
				// Drafts, future-dated or scheduled posts and expired posts are not built, and unlisted posts
				// are built but not listed; src/blog/posts.ts applies it. The dev server previews them all.
				publishState: true,
				// Embed tags in posts become static cards at build time: no third-party widget script or iframe
				// reaches the page.
				embeds: {
					// Fetched from the GitHub API on every build; CI passes GITHUB_TOKEN to stay under the rate limit.
					github: true,
					// Link metadata rarely changes, so entries on disk stay fresh for 30 days instead of the default
					// hour, and CI restores the cache directories instead of refetching every site.
					openGraph: { persistCache: true, cacheTTL: METADATA_CACHE_TTL },
					bluesky: true,
					// Article, package and video cards fetch their metadata the same way and share
					// .cache/ox-content/providers. Twitch gets no `parent`, so its cards stay static instead of
					// loading the player iframe. YouTube needs no option: <YouTube> is always expanded, into a lazy
					// youtube-nocookie.com iframe.
					qiita: { persistCache: true, cacheTTL: METADATA_CACHE_TTL },
					zenn: { persistCache: true, cacheTTL: METADATA_CACHE_TTL },
					packageRegistry: { persistCache: true, cacheTTL: METADATA_CACHE_TTL },
					twitch: { persistCache: true, cacheTTL: METADATA_CACHE_TTL },
					// Post JSON (.cache/ox-content/twitter) and downloaded media (public/ox-content/twitter) are
					// committed, as ryoppippi.com does: builds do not depend on X being reachable, and images are
					// served from this origin. Media fetched during a build lands in public/ after Vite has copied
					// it, so run the build again, or preview with the dev server, after adding a post.
					twitter: {
						fetch: true,
						appearance: 'full',
						timeZone: 'Asia/Tokyo',
						mediaOutputDir: 'public/ox-content/twitter',
						mediaPublicPath: '/ox-content/twitter',
					},
				},
				feeds: {
					blog: {
						collection: 'blog',
						formats: ['rss'],
						path: '/blog/',
						title: 'Blog | 11gather11',
						description: 'Posts by 11gather11.',
						language: 'en',
					},
				},
				ssg: {
					// Adds the Copy button markup to code blocks when posts are rendered.
					readerChrome: READER_CHROME,
					siteName: '11gather11',
					siteUrl: 'https://11gather11.com',
				},
			},
			// Only the syntax colours: the rest of the site's palette lives in src/styles/global.css.
			themeTokens: {
				theme: syntaxTheme,
				include: (name) => name.startsWith('syntax-'),
			},
			// Images referenced from posts with relative paths are published under /assets/content with a
			// content hash, so the immutable cache rule in public/_headers applies to them.
			collectionAssets: {
				async manifest(context) {
					const result = await planCollectionAssetsFromDocuments({
						root: context.root,
						contentRoot: 'src/content',
						documents: (await loadPosts(context)).map((post) => ({
							documentPath: post.file,
							pagePath: `/blog/${post.slug}/`,
						})),
					})
					// A missing image fails the build instead of shipping a broken reference.
					if (result.diagnostics.length > 0) {
						throw new Error(result.diagnostics.map(({ message }) => message).join('\n'))
					}
					return result.manifest
				},
				watch: [{ path: 'src/content/blog', kind: 'directory' }],
				ownedPrefixes: ['/assets/content'],
			},
			dev: {
				feedOutputs: true,
				routeDependencies: [
					{ path: 'src/pages', kind: 'directory' },
					{ path: 'src/content/blog', kind: 'directory' },
				],
			},
		}),
	],
	// In-source tests are guarded by `import.meta.vitest`; defining it away lets the build drop them.
	define: {
		'import.meta.vitest': 'undefined',
	},
	fmt: {
		ignorePatterns: [...IGNORED_PATHS, 'pnpm-lock.yaml'],
		useTabs: true,
		semi: false,
		singleQuote: true,
		jsxSingleQuote: true,
		trailingComma: 'es5',
		printWidth: 120,
		sortPackageJson: true,
	},
	lint: {
		ignorePatterns: IGNORED_PATHS,
		// Setting plugins replaces the defaults, so the default three are listed again.
		plugins: ['typescript', 'unicorn', 'oxc', 'react', 'jsx-a11y', 'import', 'vitest'],
		// Design-system rules for Tailwind classes; see the rules block below.
		jsPlugins: ['@shadcn/lint'],
		rules: {
			// Colours come from the tokens in src/styles/global.css so both schemes stay in contrast.
			'shadcn/no-raw-colors': 'error',
			'shadcn/no-arbitrary-values': 'error',
			'shadcn/no-unknown-classes': 'error',
			'shadcn/no-inline-styles': 'error',
			'shadcn/require-static-classes': 'error',
		},
		options: {
			typeAware: true,
			typeCheck: true,
		},
	},
	staged: {
		'*.{css,html,js,json,jsonc,md,ts,tsx,yaml,yml}': 'vp check --fix',
		// gitleaks reads the staged diff itself, so it takes no file arguments.
		'*': () => 'gitleaks git --staged --no-banner --redact',
	},
	test: {
		environment: 'node',
		includeSource: ['src/**/*.{ts,tsx}'],
		// .direnv/flake-inputs links nixpkgs, whose own test files would otherwise be collected.
		exclude: [...configDefaults.exclude, '.direnv/**'],
	},
})
