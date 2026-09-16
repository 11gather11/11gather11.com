import tailwindcss from '@tailwindcss/vite'
import { configDefaults, defineConfig } from 'vite-plus'

import { ssg } from './src/ssg/plugin.ts'

const IGNORED_PATHS = ['dist/**', 'node_modules/**', '.direnv/**', '.wrangler/**']

export default defineConfig({
	appType: 'mpa',
	server: {
		watch: {
			ignored: ['**/.direnv/**'],
		},
	},
	plugins: [tailwindcss(), ssg()],
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
		// Design-system rules for Tailwind classes. Registered only; no shadcn/* rule is enabled yet.
		jsPlugins: ['@shadcn/lint'],
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
