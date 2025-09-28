<script lang="ts">
  import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'
  import type { CSSSize, LineType } from './types'

  interface LineProps {
    class?: string
    edge: Edge
    gap?: CSSSize
    indent?: CSSSize
    type?: LineType
  }

  const { edge, gap = '0px', indent = '0px', type = 'terminal', ...rest }: LineProps = $props()

  const lineStartFrom = {
    // - half the terminal bleeding out the containing element
    // - half the terminal inside the containing element (we need to position the line next to this)
    terminal: `calc(var(--terminal-radius) + ${indent})`,
    // The full terminal is inside the containing element (we need to position the line next to this)
    'terminal-no-bleed': `calc(var(--terminal-diameter) + ${indent})`,
    // No terminal to worry about, line should take up all the space
    'no-terminal': indent
  }

  const styles = {
    '--stroke-color': 'var(--color-blue-600)',
    '--stroke-width': '2px',

    // Shift line and terminal on the main access to account for gaps between items
    '--main-axis-offset': `calc(-0.5 * (${gap} + var(--stroke-width)))`,

    // If there is a terminal, we want the line to start from next to it
    '--line-main-axis-start': lineStartFrom[type],

    '--terminal-display': type === 'no-terminal' ? 'none' : 'block',
    '--terminal-diameter': 'calc(var(--stroke-width) * 4)',
    '--terminal-radius': 'calc(var(--terminal-diameter) / 2)',

    // The line is positioned to account for the the terminal (--line-main-axis-start).
    // The terminal is rendered relative to the line (it's a `::before`)
    // We need to pull the terminal backwards so it sits before the start of the line
    '--terminal-main-axis-start': 'calc(-1 * var(--terminal-diameter))',

    // Pull the terminal backwards on the cross axis (eg "up" on "vertical")
    // so the center of the terminal lines up with the center of the line
    '--terminal-cross-axis-offset': 'calc(calc(var(--stroke-width) - var(--terminal-diameter)) / 2)'
  }
  const styleString = $derived(
    Object.entries(styles)
      .map(([key, value]) => `--${key}:${value}`)
      .join(';')
  )
</script>

<div
  class={`line-root ${rest.class || ''} `}
  class:line-horizontal={edge === 'top' || edge === 'bottom'}
  class:line-vertical={edge === 'left' || edge === 'right'}
  style={styleString}
></div>

<style lang="postcss">
  @reference "#app.css";

  /* Base styles for the line container */
  .line-root {
    display: block;
    position: absolute;
    z-index: 1;
    /* Blocking pointer events to prevent the line from triggering drag events */
    pointer-events: none;
    background-color: var(--stroke-color);
  }

  /* &::before is for the terminal */
  .line-root::before {
    display: var(--terminal-display);
    content: '';
    position: absolute;
    box-sizing: border-box;
    width: var(--terminal-diameter);
    height: var(--terminal-diameter);
    border-width: var(--stroke-width);
    border-style: solid;
    border-color: var(--stroke-color);
    border-radius: 50%;
  }

  /* Orientation-specific styles */
  .line-horizontal {
    height: var(--stroke-width);
    inset-inline-start: var(--line-main-axis-start);
    inset-inline-end: 0;
  }

  .line-horizontal::before {
    inset-inline-start: var(--terminal-main-axis-start);
  }

  /* For now, vertical lines will always have the terminal on the top.
   Need to investigate whether we want the terminal on the bottom
   for bottom to top languages. */
  .line-vertical {
    width: var(--stroke-width);
    top: var(--line-main-axis-start);
    bottom: 0;
  }

  .line-vertical::before {
    top: var(--terminal-main-axis-start);
  }

  /* Edge-specific positioning */
  .line-top {
    top: var(--main-axis-offset);
  }

  .line-top::before {
    top: var(--terminal-cross-axis-offset);
  }

  .line-right {
    right: var(--main-axis-offset);
  }

  .line-right::before {
    right: var(--terminal-cross-axis-offset);
  }

  .line-bottom {
    bottom: var(--main-axis-offset);
  }

  .line-bottom::before {
    bottom: var(--terminal-cross-axis-offset);
  }

  .line-left {
    left: var(--main-axis-offset);
  }

  .line-left::before {
    left: var(--terminal-cross-axis-offset);
  }
</style>
