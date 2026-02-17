import { getContext, setContext } from 'svelte'
import type {
  BaseEventPayload,
  ElementDragType
} from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'

import type { TreeNode } from 'svelte-tree-view'
import { moveNode } from './move-utils'

export type DndTreeItem = { id: string; node: TreeNode; type: 'tree-item' }
export type DndTreeGroup = { type: 'group' }
export type Draggable = DndTreeItem
export type Droppable = DndTreeItem | DndTreeGroup

export type DndContext = ReturnType<typeof createDndContext>
export const DND_CTX = 'dnd'

export const getDndContext = () => getContext<DndContext>(DND_CTX)
export const setDndContext = (val: DndContext) => setContext(DND_CTX, val)

export function createDndContext() {
  // This registry is used to maintain focus between drops. Not working for now
  const registry = new Map<string, HTMLElement>()
  let treeMap: Record<string, TreeNode> = {}

  function registerElement(nodeId: string, el: HTMLElement) {
    registry.set(nodeId, el)
    return () => registry.delete(nodeId)
  }

  function setTreeMap(map: Record<string, TreeNode>) {
    treeMap = map
  }

  function handleDrop(args: BaseEventPayload<ElementDragType>) {
    const { location, source } = args
    const target = location.current.dropTargets.at(0)
    const dragged = source.data as Draggable | undefined
    const droppedTo = target?.data as Droppable | undefined

    if (target === undefined) {
      // Item was dropped somewhere without any handlers -> no-op / cancel
      return
    }

    if (dragged === undefined) {
      // draggable was registered with invalid getInitialData()
      console.error(`Undefined dragged item!`, source)
      return
    }

    if (droppedTo === undefined) {
      // Item was dropped most likely into a group
      console.error(`Undefined drop target!`, target)
      return
    }

    if (dragged.type !== 'tree-item') {
      console.error(`Unknown dragged object type ${dragged.type}`, dragged)
      return
    }

    if (droppedTo.type !== 'tree-item') {
      // Dropped onto a group container, not a specific tree item - ignore
      if (droppedTo.type !== 'group') {
        console.error(`Unknown target object type ${droppedTo.type}`, droppedTo)
      }
      return
    }

    const instruction = extractInstruction(target.data)
    if (instruction === null || dragged.id === droppedTo.id || instruction.blocked) {
      // Can't drop on itself, null instruction, or blocked instruction
      return
    }

    moveNode(dragged.node, droppedTo.node, instruction, treeMap)
    // Trigger store update to re-render the tree with new structure
    data.update(currentData => {
      // Return a new array/object reference to trigger reactivity
      return Array.isArray(currentData) ? [...currentData] : { ...currentData }
    })
  }

  return {
    registerElement,
    handleDrop,
    setTreeMap
  }
}
