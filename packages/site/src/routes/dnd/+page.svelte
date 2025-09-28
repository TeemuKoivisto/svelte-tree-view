<script lang="ts">
  import { onMount } from 'svelte'
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
  import {
    dropTargetForElements,
    type ElementDropTargetEventBasePayload,
    monitorForElements
  } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

  import DndNode from '$components/DndNode.svelte'
  import { TreeView } from 'svelte-tree-view'

  import {
    treeOpts,
    parsedData,
    parsedRecursionOpts,
    parsedTheme,
    parsedValueFormatter,
    setExampleData
  } from '$lib/store'
  import { setDndContext, createDndContext } from '$lib/dnd-context'

  let element: HTMLDivElement
  let dropTargetState = $state<'idle' | 'is-innermost-over'>('idle')
  const dnd = createDndContext()
  setDndContext(dnd)
  const data = $derived(dnd.data)

  function onDropTargetChange({ location, self }: ElementDropTargetEventBasePayload) {
    const [innerMost] = location.current.dropTargets.filter(
      dropTarget => dropTarget.data.type === 'group'
    )
    dropTargetState = innerMost?.element === self.element ? 'is-innermost-over' : 'idle'
  }

  onMount(() => {
    setExampleData('dnd')
    parsedRecursionOpts.set({
      shouldExpandNode: () => true
    })
    return combine(
      monitorForElements({
        canMonitor({ source }) {
          // This is a global handler
          // const draggable = DRAGGABLE.safeParse(source.data)
          // if (!draggable.success) {
          //   console.error(draggable.error)
          // }
          console.log('monitor', source.data)
          return true
        },
        onDrop: dnd.handleDrop
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => source.data.type === 'tree-item',
        getData: () => ({ type: 'group' }),
        onDragStart: onDropTargetChange,
        onDropTargetChange: onDropTargetChange,
        onDragLeave: () => {
          dropTargetState = 'idle'
        },
        onDrop: () => {
          dropTargetState = 'idle'
        }
      })
    )
  })
</script>

<TreeView
  data={$data}
  showLogButton={$treeOpts.showLogButton}
  showCopyButton={$treeOpts.showCopyButton}
  recursionOpts={$parsedRecursionOpts}
  valueFormatter={$parsedValueFormatter}
  theme={$parsedTheme}
>
  {#snippet rootNode(children)}
    <div
      class={`svelte-tree-view w-1/2 px-4 text-sm ${dropTargetState === 'is-innermost-over' ? 'group-drop-indicator' : ''}`}
      bind:this={element}
    >
      {@render children()}
    </div>
  {/snippet}
  {#snippet treeNode(props)}
    <DndNode {...props} />
  {/snippet}
</TreeView>

<style lang="postcss">
</style>
