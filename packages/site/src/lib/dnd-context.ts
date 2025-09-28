import { getContext, setContext } from 'svelte'
import type { ElementDropTargetEventBasePayload } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
// import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox'

export type DndContext = ReturnType<typeof createDndContext>
export const DND_CTX = 'dnd'

export const getDndContext = () => getContext<DndContext>(DND_CTX)
export const setDndContext = (val: DndContext) => setContext(DND_CTX, val)

export function createDndContext() {
  const registry = new Map<string, HTMLElement>()

  function registerElement(nodeId: string, el: HTMLElement) {
    registry.set(nodeId, el)
    return () => registry.delete(nodeId)
  }

  function handleDrag() {}
  function handleDrop() {}

  // const handleDragChange = (item: 'tree-item') => (args: ElementDropTargetEventBasePayload) => {
  //   if (item === 'tree-item') {
  //     const instruction = extractInstruction(args.self.data)

  //   }
  // }

  return {
    registerElement,
    handleDrag,
    handleDrop
  }
}
