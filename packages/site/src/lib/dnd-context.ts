import { getContext, setContext } from 'svelte'
import type { ElementDropTargetEventBasePayload } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
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
import { get, writable } from 'svelte/store'

export type DndContext = ReturnType<typeof createDndContext>
export const DND_CTX = 'dnd'

export const getDndContext = () => getContext<DndContext>(DND_CTX)
export const setDndContext = (val: DndContext) => setContext(DND_CTX, val)

function moveItem(itemId: string, targetId: string, instruction: Instruction, data: TreeItem[]) {
  // the rest of the actions require you to drop on something else
  // OR the instruction was blocked and should not do anything
  if (itemId === targetId || instruction.blocked) {
    return data
  }
  let result: TreeItem[]
  const item = treeUtils.findItem(data, itemId)
  if (!item) return data
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
    console.log('>> DROPPED location', location)
    console.log('>> DROPPED source', source)
    // didn't drop on anything
    if (location.current.dropTargets.length === 0) {
      return
    }
    const itemId = source.data.id as string
    const target = location.current.dropTargets[0]
    const targetId = target.data.id as string
    const instruction = extractInstruction(target.data)
    if (instruction !== null) {
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

  // const handleDragChange = (item: 'tree-item') => (args: ElementDropTargetEventBasePayload) => {
  //   if (item === 'tree-item') {
  //     const instruction = extractInstruction(args.self.data)

  //   }
  // }

  return {
    data,
    registerElement,
    handleDrag,
    handleDrop
  }
}
