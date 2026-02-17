<script lang="ts">
  import { get } from 'svelte/store'
  import { onMount } from 'svelte'
  import {
    draggable,
    dropTargetForElements,
    type ElementDropTargetEventBasePayload
  } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import {
    attachInstruction,
    extractInstruction
  } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'
  import { handleLogNode, handleCopyNodeToClipboard } from 'svelte-tree-view/DefaultNode.svelte'

  import DropIndicator from './dnd-drop-indicator/DropIndicator.svelte'
  import {
    type DndTreeItem,
    type Draggable,
    type Droppable,
    getDndContext
  } from '$lib/dnd/dnd-context'

  import type { NodeProps, TreeNode } from 'svelte-tree-view'

  let { node, TreeViewNode, getTreeContext }: NodeProps = $props()

  const store = getTreeContext()
  const { viewProps, collapseOrScrollIntoCircularNode } = store
  const dnd = getDndContext()

  // Provide the store's expandNodeChildren to the dnd context (only needs to happen once)
  dnd.setTreeStore(
    (n, opts) => store.expandNodeChildren(n, opts),
    () => get(store.recursionOpts)
  )

  let element: HTMLDivElement
  let groupElement: HTMLDivElement | null = $state(null)
  // let value = $derived<TreeItem>(node.getValue())
  let hasChildren = $derived(node.children.length > 0)
  let descend = $derived(!node.collapsed && hasChildren)
  let dndData = $derived<DndTreeItem>({
    id: node.id,
    node,
    type: 'tree-item'
  })
  // Allow dragging only for {} objects
  let canDrag = $derived(node.children.length > 0 && node.type === 'object')
  // Allow dropping into objects with children or arrays that can be also empty
  let canDrop = $derived(node.children.length > 0 || node.type === 'array')
  let dragState = $state<'idle' | 'dragging' | 'preview'>('idle')
  let groupState = $state<'idle' | 'is-innermost-over'>('idle')
  let instruction = $state<ReturnType<typeof extractInstruction>>(null)

  onMount(() => {
    return dnd.registerElement(node.id, element)
  })

  $effect(() => {
    if (!canDrag) return
    return draggable({
      element,
      getInitialData: (): Draggable => dndData,
      onDragStart: ({ source }) => {
        dragState = 'dragging'
        instruction = null
      },
      onDrop: ({ source }) => {
        dragState = 'idle'
        groupState = 'idle'
        instruction = null
      }
    })
  })

  $effect(() => {
    if (!canDrop) return
    return dropTargetForElements({
      element,
      getData: ({ input, element }) => {
        return attachInstruction(
          { ...dndData },
          {
            input,
            element,
            operations: {
              // Allow combine (the focus ring drop indicator) for both objects and ararys
              combine: 'available',
              // Allow reorder (the line drop indicator) only for objects
              'reorder-before': canDrag ? 'available' : 'not-available',
              // Hide the line drop indicator on expanded nodes
              'reorder-after': canDrag ? 'available' : 'not-available'
            }
          }
        )
      },
      canDrop: ({ source }) => {
        if ('node' in source.data && 'type' in source.data) {
          // Prevent dropping node unto itself or its children. This is done by comparing the dragged's node path,
          // if equal ensures it must be a descendant, not an ancestor (node with smaller path)
          const draggedNode = source.data.node as TreeNode
          return (
            draggedNode.path.some((pathIndex, i) => pathIndex !== node.path[i]) ||
            draggedNode.path.length > node.path.length
          )
        }
        return false
      },
      onDragEnter: onDragChange,
      onDrag: onDragChange,
      onDragLeave: () => {
        instruction = null
      },
      onDrop: () => {
        instruction = null
      }
    })
  })

  $effect(() => {
    if (!groupElement || !canDrag) return
    return dropTargetForElements({
      element: groupElement,
      getData: (): Droppable => ({ type: 'group' }),
      getIsSticky: () => false,
      canDrop: ({ source }) => source.data.type === 'tree-item' && source.data.id !== dndData.id,
      onDragStart: onGroupDragChange,
      onDropTargetChange: onGroupDragChange,
      onDragLeave: () => {
        groupState = 'idle'
      },
      onDrop: () => {
        groupState = 'idle'
      }
    })
  })

  function onDragChange(payload: ElementDropTargetEventBasePayload) {
    const extracted = extractInstruction(payload.self.data)
    instruction = extracted
  }

  function onGroupDragChange({ location, self }: ElementDropTargetEventBasePayload) {
    const [innerMost] = location.current.dropTargets.filter(
      dropTarget => dropTarget.data.type === 'group'
    )
    groupState = innerMost?.element === self.element ? 'is-innermost-over' : 'idle'
  }

  // Function to create truncated preview of objects and arrays
  function createTruncatedPreview(value: any, type: string): string {
    if (type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
      const keys = Object.keys(value)
      if (keys.length === 0) return '{}'

      const preview = keys
        .slice(0, 3)
        .map(key => {
          const val = value[key]
          if (val === null) return `${key}: null`
          if (typeof val === 'object') return `${key}: {…}`
          if (typeof val === 'string') {
            return `${key}: "${val.length > 10 ? val.substring(0, 10) + '…' : val}"`
          }
          return `${key}: ${val}`
        })
        .join(', ')

      const suffix = keys.length > 3 ? `, …` : ''
      return `{ ${preview}${suffix} }`
    }

    if (type === 'array' && Array.isArray(value)) {
      if (value.length === 0) return '[]'

      const preview = value
        .slice(0, 3)
        .map(item => {
          if (item === null) return 'null'
          if (typeof item === 'object') return '{…}'
          if (typeof item === 'string') {
            return `"${item.length > 10 ? item.substring(0, 10) + '…' : item}"`
          }
          return String(item)
        })
        .join(', ')

      const suffix = value.length > 3 ? ', …' : ''
      return `[ ${preview}${suffix} ]`
    }

    // For other types, use the default formatter or string representation
    return $viewProps.valueFormatter?.(value, node) ?? String(value)
  }

  // Get the appropriate value to display
  function getDisplayValue(): string {
    const val = node.getValue()
    if (hasChildren && node.collapsed) {
      // Show truncated preview when collapsed
      return createTruncatedPreview(val, node.type)
    } else {
      // Show full value when expanded or for leaf nodes
      return $viewProps.valueFormatter?.(val, node) ?? String(val)
    }
  }

  // Get type-specific styling classes
  function getTypeClasses() {
    switch (node.type) {
      case 'string':
        return 'text-green-600 dark:text-green-400'
      case 'number':
      case 'bigint':
        return 'text-blue-600 dark:text-blue-400'
      case 'boolean':
        return 'text-purple-600 dark:text-purple-400'
      case 'null':
      case 'undefined':
        return 'text-gray-500 dark:text-gray-400 italic'
      case 'object':
      case 'array':
      case 'map':
      case 'set':
        return 'text-orange-600 dark:text-orange-400'
      case 'function':
        return 'text-indigo-600 dark:text-indigo-400'
      case 'date':
        return 'text-teal-600 dark:text-teal-400'
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }
</script>

<div class="tree-node-container" data-tree-node-id={node.id}>
  <div
    class="tree-node-card group relative"
    class:collapsed={node.collapsed && hasChildren}
    class:hoverable={canDrag}
    data-dnd-id={node.id}
    bind:this={element}
  >
    <!-- Arrow button for expandable nodes -->
    {#if hasChildren}
      <button
        class="arrow-button"
        class:collapsed={node.collapsed}
        onclick={() => collapseOrScrollIntoCircularNode(node.id)}
        aria-label={node.collapsed ? 'Expand' : 'Collapse'}
      >
        <svg class="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    {:else}
      <div class="arrow-placeholder"></div>
    {/if}

    <!-- Node content -->
    <button
      class="node-content"
      class:cursor-pointer={hasChildren}
      onclick={() => collapseOrScrollIntoCircularNode(node.id)}
    >
      <!-- Key section -->
      <div class="node-key-section">
        <span class="node-key">{node.key}:</span>
      </div>

      <!-- Value section -->
      <div class="node-value-section">
        <div class={`node-value truncate ${getTypeClasses()}`} data-type={node.type}>
          {getDisplayValue()}
        </div>
      </div>
    </button>

    <!-- Action buttons -->
    <div class="action-buttons">
      {#if $viewProps.showLogButton}
        <button
          class="action-button log-button"
          onclick={() => handleLogNode(node)}
          aria-label="Log to console"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
      {/if}
      {#if $viewProps.showCopyButton}
        <button
          class="action-button copy-button"
          onclick={() => handleCopyNodeToClipboard(node)}
          aria-label="Copy to clipboard"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      {/if}
    </div>
    {#if instruction}
      <DropIndicator {instruction} />
    {/if}
  </div>

  {#if descend}
    <div
      class="children-container"
      class:group-drop-indicator={groupState === 'is-innermost-over'}
      bind:this={groupElement}
    >
      {#each node.children as id}
        <TreeViewNode {id} />
      {/each}
    </div>
  {/if}
</div>

<style lang="postcss">
  @reference "#app.css";

  .tree-node-container {
    @apply w-full;
  }

  .tree-node-card {
    @apply flex items-center gap-2 rounded-lg border border-gray-200 bg-white transition-all duration-200 ease-in-out dark:border-gray-700 dark:bg-gray-800;
    &.hoverable:hover {
      @apply !cursor-grab border-gray-300 bg-gray-100 shadow-md dark:border-gray-600 dark:bg-gray-700;
    }
  }

  .arrow-button {
    @apply flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200;
  }

  .arrow-button.collapsed .arrow-icon {
    @apply rotate-0 transform;
  }

  .arrow-icon {
    @apply h-4 w-4 transition-transform duration-200;
  }

  .arrow-placeholder {
    @apply h-6 w-6 flex-shrink-0;
  }

  .node-content {
    @apply flex min-w-0 flex-1 gap-2;
  }

  .node-key-section {
    @apply flex-shrink-0;
  }

  .node-key {
    @apply font-medium text-gray-700 dark:text-gray-300;
  }

  .node-value-section {
    @apply min-w-0 flex-1;
  }

  .node-value {
    @apply flex break-words;
  }

  .action-buttons {
    @apply flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100;
  }

  .action-button {
    @apply rounded-md p-1.5 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200;
  }

  .children-container {
    @apply mt-0.5 ml-6 space-y-0.5;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .tree-node-card {
      @apply p-1.5;
    }

    .arrow-button {
      @apply h-5 w-5;
    }

    .arrow-icon {
      @apply h-3.5 w-3.5;
    }

    .arrow-placeholder {
      @apply h-5 w-5;
    }

    .action-buttons {
      @apply opacity-100;
    }
  }
</style>
