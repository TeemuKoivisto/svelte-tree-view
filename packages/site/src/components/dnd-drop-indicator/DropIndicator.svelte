<script lang="ts">
  import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'
  import type { CSSSize, LineType } from './types'

  import Line from './Line.svelte'

  interface Props {
    class?: string
    instruction: Instruction

    /**
     * `gap` allows you to position the drop indicator further away from the drop target.
     * `gap` should be the distance between your drop targets
     * a drop indicator will be rendered halfway between the drop targets
     * (the drop indicator will be offset by half of the `gap`)
     *
     * `gap` should be a valid CSS size.
     *
     * @example "8px"
     * @example "var(--gap)"
     */
    lineGap?: CSSSize

    /**
     * Which style of indicator should be used
     *
     * *"terminal"*
     *
     * - display a terminal (circle with a whole in it) at the start of the line
     * - half the size of the terminal will "bleed out" of the containing element
     *
     * *"terminal-no-bleed"*
     *
     * - display a terminal (circle with a whole in it) at the start of the line
     * - the terminal will _not_ "bleed out" of the containing element
     * - this is useful in situations where the terminal cannot bleed out
     *   (such as when inside scroll containers with no padding)
     *
     * *"no-terminal"*
     *
     * - display a full width line with no terminal
     */
    lineType?: LineType
  }

  const { instruction, lineGap, lineType, ...rest }: Props = $props()
  const operation = $derived(instruction.operation)
  const axis = $derived(instruction.axis)
</script>

{#if operation === 'combine'}
  <div class={`border ${rest.class || ''}`}></div>
{:else}
  <Line
    {...rest}
    edge={axis === 'vertical'
      ? operation === 'reorder-before'
        ? 'top'
        : 'bottom'
      : operation === 'reorder-before'
        ? 'left'
        : 'right'}
    gap={lineGap}
    type={lineType}
  />
{/if}

<style lang="postcss">
  @reference "#app.css";

  .border {
    @apply absolute inset-0 rounded border-2 border-blue-600;
  }
</style>
