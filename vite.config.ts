import { defineConfig } from 'vite-plus'

const IGNORED_PATHS = ['dist/**', 'node_modules/**', '.direnv/**', '.wrangler/**']

export default defineConfig({
	appType: 'mpa',
	server: {
		watch: {
			ignored: ['**/.direnv/**'],
		},
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
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
	},
})
