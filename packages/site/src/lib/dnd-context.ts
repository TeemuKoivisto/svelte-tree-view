import { getContext, setContext } from 'svelte'
import { writable } from 'svelte/store'
import type {
  BaseEventPayload,
  ElementDragType
} from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import {
  extractInstruction,
  type Instruction
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'

import { treeUtils, type TreeItem } from './dnd-tree-utils'

import dndData from '$lib/example_dnd.json'

export type DndTreeItem = { id: string; type: 'tree-item' }
export type DndTreeGroup = { type: 'group' }
export type Draggable = DndTreeItem
export type Droppable = DndTreeItem | DndTreeGroup

export type DndContext = ReturnType<typeof createDndContext>
export const DND_CTX = 'dnd'

export const getDndContext = () => getContext<DndContext>(DND_CTX)
export const setDndContext = (val: DndContext) => setContext(DND_CTX, val)

function moveItem(itemId: string, targetId: string, instruction: Instruction, data: TreeItem[]) {
  const item = treeUtils.findItem(data, itemId)
  if (!item) {
    console.error(`Tried to move item (itemId ${itemId}) which didn't exist in data`, data)
    return data
  }
  let result: TreeItem[]
  switch (instruction.operation) {
    case 'reorder-before':
      result = treeUtils.remove(data, itemId)
      result = treeUtils.insertBefore(result, targetId, item)
      return result
    case 'reorder-after':
      result = treeUtils.remove(data, itemId)
      result = treeUtils.insertAfter(result, targetId, item)
      return result
    case 'combine':
      result = treeUtils.remove(data, itemId)
      result = treeUtils.insertChild(result, targetId, item)
      return result
  }
}

export function createDndContext() {
  const data = writable<TreeItem[]>(dndData)
  const registry = new Map<string, HTMLElement>()

  function setData() {}

  function registerElement(nodeId: string, el: HTMLElement) {
    registry.set(nodeId, el)
    return () => registry.delete(nodeId)
  }

  function handleDrag() {}

  function handleDrop(args: BaseEventPayload<ElementDragType>) {
    const { location, source } = args
    // console.log('>> DROPPED location', location)
    // console.log('>> DROPPED source', source)
    const target = location.current.dropTargets.at(0)
    const itemId = source.data.id as string | undefined
    const targetId = target?.data.id as string | undefined
    if (target === undefined) {
      // Item was dropped somewhere without any handlers -> no-op / cancel
    } else if (itemId === undefined) {
      // draggable was registered with invalid getInitialData()
      console.log(args)
      console.error(`Undefined itemId!`, source)
    } else if (targetId === undefined) {
      // Item was dropped most likely into a group
      console.log(args)
      console.error(`Undefined targetId!`, target)
    } else {
      const instruction = extractInstruction(target.data)
      console.log('>> target', target)
      console.log('>> instruction', instruction)
      if (instruction !== null && itemId !== targetId && instruction.blocked) {
        // Shouldn't be able to drop on itself or if 'blocked' instruction was added
        // Idk are null instructions bugs
        console.log('dropped', {
          type: 'instruction',
          instruction,
          itemId,
          targetId
        })
        // debugger
        // const old = get(data)
        // const moved = moveItem(itemId, targetId, instruction, old)
        data.update(items => {
          const moved = moveItem(itemId, targetId, instruction, items)
          console.log('moved', moved)
          return moved
        })
      }
    }
  }

  return {
    data,
    registerElement,
    handleDrag,
    handleDrop
  }
}
