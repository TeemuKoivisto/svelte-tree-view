<script lang="ts">
  import { onMount } from 'svelte'
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
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
    parsedValueFormatter,
    setExampleData
  } from '$lib/store'
  import { setDndContext, createDndContext, type Droppable } from '$lib/dnd/dnd-context'

  let element: HTMLDivElement
  let groupState = $state<'idle' | 'is-innermost-over'>('idle')

  const dnd = createDndContext()
  setDndContext(dnd)

  function onDropTargetChange({ location, self }: ElementDropTargetEventBasePayload) {
    const [innerMost] = location.current.dropTargets.filter(
      dropTarget => dropTarget.data.type === 'group'
    )
    groupState = innerMost?.element === self.element ? 'is-innermost-over' : 'idle'
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
          return source.data.type === 'tree-item'
        },
        onDrop: dnd.handleDrop
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => source.data.type === 'tree-item',
        getData: (): Droppable => ({ type: 'group' }),
        onDragStart: onDropTargetChange,
        onDropTargetChange: onDropTargetChange,
        onDragLeave: () => {
          groupState = 'idle'
        },
        onDrop: () => {
          groupState = 'idle'
        }
      })
    )
  })
</script>

<TreeView
  data={$parsedData}
  showLogButton={$treeOpts.showLogButton}
  showCopyButton={$treeOpts.showCopyButton}
  recursionOpts={$parsedRecursionOpts}
  valueFormatter={$parsedValueFormatter}
  onUpdate={treeMap => dnd.setTreeMap(treeMap)}
>
  {#snippet rootNode(children)}
    <div
      class="svelte-tree-view w-1/2 px-4 text-sm"
      class:group-drop-indicator={groupState === 'is-innermost-over'}
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
