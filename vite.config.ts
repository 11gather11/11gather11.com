import { oxContentCustomHost } from '@ox-content/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { configDefaults, defineConfig } from 'vite-plus'

import { syntaxTheme } from './src/config/syntax-theme.ts'

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
		// The host looks up the stylesheet's hashed URL in the manifest.
		manifest: true,
		rollupOptions: { input: 'src/styles/global.css' },
	},
	plugins: [
		tailwindcss(),
		oxContentCustomHost({
			host: './src/host.ts',
			// Pages are finished documents; Vite's HTML transform would inject its dev client script.
			build: { transformHtml: false },
			oxContent: {
				srcDir: 'src/content',
				outDir: 'dist',
				gfm: true,
				highlight: true,
				// Posts cannot inject scripts or inline styles through raw HTML.
				sanitize: true,
				docs: false,
				search: false,
				siteMaps: true,
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
					siteName: '11gather11',
					siteUrl: 'https://11gather11.com',
				},
			},
			// Only the syntax colours: the rest of the site's palette lives in src/styles/global.css.
			themeTokens: {
				theme: syntaxTheme,
				include: (name) => name.startsWith('syntax-'),
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
