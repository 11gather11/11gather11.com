/** Props for {@link ComingSoon}. */
export type ComingSoonProps = {
	/** Section name shown as the page heading. */
	title: string
}

/**
 * Placeholder body for a section whose page is not written yet, so navigation links never 404.
 *
 * @example
 * <ComingSoon title='Blog' />
 */
export function ComingSoon({ title }: ComingSoonProps) {
	return (
		<section className='py-16'>
			<h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
			<p className='mt-2 text-muted-foreground'>Coming soon.</p>
		</section>
	)
}
