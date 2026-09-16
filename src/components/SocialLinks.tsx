/** Props for {@link SocialLinks}. */
export type SocialLinksProps = {
	/** Classes for the list, such as its flex direction and gap. */
	className?: string
	/** Classes for each link, such as its colour and size. */
	linkClassName?: string
}

/**
 * Links to GitHub, Twitch and YouTube, each with its brand icon and a visible label.
 *
 * The icon classes are written out per link rather than mapped from data so the Tailwind scanner
 * and shadcn/require-static-classes can both read them.
 *
 * @example
 * <SocialLinks className='flex gap-6' linkClassName='text-band-foreground' />
 */
export function SocialLinks({ className, linkClassName }: SocialLinksProps) {
	return (
		<ul className={className}>
			<li>
				<a href='https://github.com/11gather11' className={linkClassName}>
					<span className='iconify simple-icons--github size-4' aria-hidden='true' />
					GitHub
				</a>
			</li>
			<li>
				<a href='https://www.twitch.tv/igara4ryusei' className={linkClassName}>
					<span className='iconify simple-icons--twitch size-4' aria-hidden='true' />
					Twitch
				</a>
			</li>
			<li>
				<a href='https://www.youtube.com/@igara4ryusei' className={linkClassName}>
					<span className='iconify simple-icons--youtube size-4' aria-hidden='true' />
					YouTube
				</a>
			</li>
		</ul>
	)
}
