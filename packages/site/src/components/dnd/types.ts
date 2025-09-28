export type Orientation = 'horizontal' | 'vertical'
export type LineType = 'terminal' | 'no-terminal' | 'terminal-no-bleed'

/**
 * Any valid CSS size value.
 *
 * _An alias to `string` to improve readability_
 *
 * @example
 *
 * - "2px"
 * - "4rem"
 * // ADS tokens (which resolve to CSS size values)
 * - token('border.width.selected')
 */
export type CSSSize = string

/**
 * Any valid CSS color value
 *
 * * _An alias to `string` to improve readability_
 *
 * @example
 *
 * - "#663399"
 * - "rgb(102, 51, 153)"
 * - "hsl(270, 50%, 40%)"
 * - "rebeccapurple"
 * // ADS tokens (which resolve to CSS color values)
 * - token('color.border.selected')
 */
export type CSSColor = string
