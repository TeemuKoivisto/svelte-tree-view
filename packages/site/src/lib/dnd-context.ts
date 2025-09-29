import { getContext, setContext } from 'svelte'
import { writable, type Writable } from 'svelte/store'
import type {
  BaseEventPayload,
  ElementDragType
} from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import {
  extractInstruction,
  type Instruction
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'

import type { TreeNode } from 'svelte-tree-view'

export type DndTreeItem = { id: string; node: TreeNode; type: 'tree-item' }
export type DndTreeGroup = { type: 'group' }
export type Draggable = DndTreeItem
export type Droppable = DndTreeItem | DndTreeGroup

export type DndContext = ReturnType<typeof createDndContext>
export const DND_CTX = 'dnd'

export const getDndContext = () => getContext<DndContext>(DND_CTX)
export const setDndContext = (val: DndContext) => setContext(DND_CTX, val)

function moveNode(
  dragged: TreeNode,
  target: TreeNode,
  instruction: Instruction,
  treeMap: Record<string, TreeNode>
) {
  const draggedVal = dragged.getValue()
  const targetVal = target.getValue()
  // So this dragn'drop implementation is fixed to allow only dragging of objects into arrays or another objects
  // Incase of an array, both 'reorder-after/before' and 'combine' instructions are allowed
  // Incase of an object, only 'combine' should be allowed which is implemented as creating/reusing 'children' property
  // It's turned into a list where the dragged object is inserted as the first element
  if (Array.isArray(targetVal)) {
    targetVal.unshift(draggedVal)
    target.updateValue(targetVal)
  } else if (targetVal && typeof targetVal === 'object') {
    // here get parent node, find this object's index, insert at before/after
    // incase of combine instruction, insert as property to droppedTo
    if (instruction.operation === 'combine') {
      if (!('children' in targetVal) || !Array.isArray(targetVal.children)) {
        targetVal.children = []
      }
      targetVal.children.unshift(draggedVal)
      target.updateValue(targetVal)
    } else {
      const parent = treeMap[target.parentId || '']
      const parentVal = parent?.getValue()
      if (!parent) {
        console.error(`No parent found in treeMap for node`, target)
      } else if (!Array.isArray(parentVal)) {
        console.error(`Can't insert objets to non-array parents`, parentVal)
      } else {
        const index = parentVal.findIndex(v => v === targetVal)
        if (instruction.operation === 'reorder-after') {
          // Insert after the object (or end of the list incase this bugged somehow)
          parentVal.splice(index === -1 ? parentVal.length : index + 1, 0, draggedVal)
        } else {
          // Insert at the index of the droppedTo object
          parentVal.splice(index === -1 ? 0 : index, 0, draggedVal)
        }
        parent.updateValue(parentVal)
        console.log('>> update parent!', parentVal)
      }
    }
  } else {
    console.warn(`Unknown dropped value ${typeof targetVal}`, targetVal)
  }
  const oldParent = treeMap[dragged.parentId || '']
  const oldParentVal = oldParent?.getValue()
  if (Array.isArray(oldParentVal)) {
    const idx = oldParentVal.findIndex(v => v === draggedVal)
    if (idx !== -1) {
      oldParentVal.splice(idx, 1)
    }
    oldParent.updateValue(oldParentVal)
  } else {
    console.error(`Unable to remove dragged node from parent`, oldParentVal)
  }
}

export function createDndContext(data: Writable<any>) {
  // const data = writable<TreeItem[]>(dndData)
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
        moveNode(dragged.node, droppedTo.node, instruction, treeMap)
        // data.update(items => {
        //   const moved = moveItem(itemId, targetNode, instruction, items)
        //   console.log('moved', moved)
        //   return moved
        // })
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
