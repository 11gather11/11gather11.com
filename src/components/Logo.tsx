import { LOGO_PATH, LOGO_VIEW_BOX_SIZE } from '../config/logo.ts'

/** Props for {@link Logo}. */
export type LogoProps = {
	/** Sizing classes; the logo fills with the current text colour. */
	className?: string
}

/**
 * The 11gather11 logo as inline SVG, so it renders with the HTML instead of waiting for a request.
 *
 * Decorative: place it next to text that names the site, or inside a link with an accessible name.
 * The same shape is served as public/icon.svg for the favicon.
 *
 * @example
 * <Logo className='size-24' />
 */
export function Logo({ className }: LogoProps) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox={`0 0 ${LOGO_VIEW_BOX_SIZE} ${LOGO_VIEW_BOX_SIZE}`}
			className={className}
			aria-hidden='true'
		>
			<path className='fill-current' d={LOGO_PATH} />
		</svg>
	)
}
