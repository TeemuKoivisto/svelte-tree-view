import { getContext, setContext } from 'svelte'
import type { Writable } from 'svelte/store'
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

export function createDndContext(data: Writable<any>) {
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

  function handleDrag() {}

  function handleDrop(args: BaseEventPayload<ElementDragType>) {
    const { location, source } = args
    // console.log('>> DROPPED location', location)
    // console.log('>> DROPPED source', source)
    const target = location.current.dropTargets.at(0)
    const dragged = source.data as Draggable | undefined
    const droppedTo = target?.data as Droppable | undefined
    if (target === undefined) {
      // Item was dropped somewhere without any handlers -> no-op / cancel
    } else if (dragged === undefined) {
      // draggable was registered with invalid getInitialData()
      console.log(args)
      console.error(`Undefined itemId!`, source)
    } else if (droppedTo === undefined) {
      // Item was dropped most likely into a group
      console.log(args)
      console.error(`Undefined targetId!`, target)
    } else if (dragged.type !== 'tree-item') {
      console.error(`Unknown dragged object type ${dragged.type}`, dragged)
    } else if (droppedTo.type !== 'tree-item') {
      // Probably group
      droppedTo.type !== 'group' &&
        console.error(`Unknown target object type ${droppedTo}`, droppedTo)
    } else {
      const instruction = extractInstruction(target.data)
      console.log('>> dragged', dragged)
      console.log('>> target', droppedTo)
      console.log('dragged val', dragged.node.getValue())
      console.log('target val', droppedTo.node.getValue())
      console.log('>> instruction', instruction)
      if (instruction !== null && dragged.id !== droppedTo.id && !instruction.blocked) {
        // Shouldn't be able to drop on itself or if 'blocked' instruction was added
        // Idk are null instructions bugs
        console.log(JSON.stringify(dragged.node))
        console.log(JSON.stringify(droppedTo.node))
        console.log(JSON.stringify(instruction))
        console.log(JSON.stringify(treeMap))
        moveNode(dragged.node, droppedTo.node, instruction, treeMap)
        // Trigger store update to re-render the tree with new structure
        data.update(currentData => {
          // Return a new array/object reference to trigger reactivity
          return Array.isArray(currentData) ? [...currentData] : { ...currentData }
        })
      }
    }
  }

  return {
    data,
    registerElement,
    handleDrag,
    handleDrop,
    setTreeMap
  }
}
