import { LOGO_PATH, LOGO_VIEW_BOX_SIZE } from '../config/logo.ts'

/** Props Ox Content passes to the template, plus the fields this site adds. */
type OgTemplateProps = {
	title: string
	description?: string
	siteName?: string
	/** Publication date shown under the title, `YYYY-MM-DD`. */
	date?: string
}

const IVORY = '#f8f3e8'
const NAVY = '#15264a'
// Navy mixed 25% towards ivory: the site's muted text colour, 6.33:1 on ivory.
const MUTED = '#4e5972'

/**
 * Escapes text for an HTML text node or a double-quoted attribute.
 *
 * @param text - Raw text.
 * @returns Escaped text.
 */
function escapeHtml(text: string): string {
	return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

/**
 * Open Graph image template for blog posts, rendered by Satori through Ox Content.
 *
 * It repeats the home page: an ivory panel with the post title and a navy band on the right, joined
 * by the logo in a navy tile sitting on the seam. Satori supports only a subset of CSS, so every
 * element sets `display: flex` and layout uses absolute positioning rather than grid.
 *
 * @param props - Post title, description, site name and date.
 * @returns HTML for Satori.
 */
export default function ogTemplate({ title, description, siteName = '11gather11', date }: OgTemplateProps): string {
	const logo = `data:image/svg+xml;base64,${btoa(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO_VIEW_BOX_SIZE} ${LOGO_VIEW_BOX_SIZE}"><path fill="${IVORY}" d="${LOGO_PATH}"/></svg>`
	)}`
	// Long titles step down in size, and titles and descriptions clamp with an ellipsis, so neither can
	// push the site name or date out of the card. Length is counted in code points: a Japanese
	// character is roughly as wide as two Latin letters, which the lower threshold for CJK accounts for.
	let length = 0
	for (const _ of title) {
		length += 1
	}
	const cjk = /[\u3000-\u9fff\uff00-\uffef]/.test(title)
	const titleSize = length > (cjk ? 24 : 40) ? 52 : 64
	return `<div style="display:flex;position:relative;width:100%;height:100%;background:${IVORY};font-family:Geist;">
	<div style="display:flex;position:absolute;top:0;right:0;width:300px;height:100%;background:${NAVY};"></div>
	<div style="display:flex;flex-direction:column;justify-content:space-between;position:absolute;top:0;left:0;width:760px;height:100%;padding:72px 0 64px 80px;">
		<div style="display:flex;font-size:28px;font-weight:700;color:${NAVY};">${escapeHtml(siteName)}</div>
		<div style="display:flex;flex-direction:column;">
			<div style="display:block;font-size:${titleSize}px;font-weight:700;line-height:1.2;color:${NAVY};line-clamp:3;overflow:hidden;">${escapeHtml(title)}</div>
			${
				description === undefined
					? ''
					: `<div style="display:block;margin-top:24px;font-size:28px;line-height:1.5;color:${MUTED};line-clamp:2;overflow:hidden;">${escapeHtml(description)}</div>`
			}
		</div>
		<div style="display:flex;font-size:24px;color:${MUTED};">${date === undefined ? '' : escapeHtml(date)}</div>
	</div>
	<div style="display:flex;align-items:center;justify-content:center;position:absolute;top:225px;left:810px;width:180px;height:180px;background:${NAVY};">
		<img src="${logo}" style="width:136px;height:136px;" />
	</div>
</div>`
}
