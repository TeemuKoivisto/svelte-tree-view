import { getContext, setContext } from 'svelte'
import type {
  BaseEventPayload,
  ElementDragType
} from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'
import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'

import type { TreeNode, TreeRecursionOpts } from 'svelte-tree-view'
import { moveNode } from './move-utils'

export type DndTreeItem = { id: string; node: TreeNode; type: 'tree-item' }
export type DndTreeGroup = { type: 'group' }
export type Draggable = DndTreeItem
export type Droppable = DndTreeItem | DndTreeGroup

export type DndContext = ReturnType<typeof createDndContext>
export const DND_CTX = 'dnd'

export const getDndContext = () => getContext<DndContext>(DND_CTX)
export const setDndContext = (val: DndContext) => setContext(DND_CTX, val)

type ExpandNodeChildren = (node: TreeNode, recursionOpts: TreeRecursionOpts) => void
type GetRecursionOpts = () => TreeRecursionOpts | undefined

export function createDndContext() {
  // This registry is used to maintain focus between drops. Not working for now
  const registry = new Map<string, HTMLElement>()
  let treeMap: Record<string, TreeNode> = {}
  let expandNodeChildren: ExpandNodeChildren | null = null
  let getRecursionOpts: GetRecursionOpts | null = null

  function registerElement(nodeId: string, el: HTMLElement) {
    registry.set(nodeId, el)
    return () => registry.delete(nodeId)
  }

  function setTreeMap(map: Record<string, TreeNode>) {
    treeMap = map
  }

  /** Called by DndNode to provide the store's expandNodeChildren function */
  function setTreeStore(expand: ExpandNodeChildren, getOpts: GetRecursionOpts) {
    expandNodeChildren = expand
    getRecursionOpts = getOpts
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
        console.error(`Unknown target object type`, droppedTo)
      }
      return
    }

    const instruction = extractInstruction(target.data)
    if (instruction === null || dragged.id === droppedTo.id || instruction.blocked) {
      // Can't drop on itself, null instruction, or blocked instruction
      return
    }

    const result = moveNode(dragged.node, droppedTo.node, instruction, treeMap)
    if (result && expandNodeChildren && getRecursionOpts) {
      // Re-expand only the affected parent nodes to rebuild their children
      // Look up nodes fresh from treeMap by ID since refs may become stale after expansion
      const recursionOpts = getRecursionOpts()
      if (recursionOpts) {
        for (const parentId of result.affectedParentIds) {
          const parent = treeMap[parentId]
          if (parent) {
            expandNodeChildren(parent, recursionOpts)
          }
        }
      }
    }
  }

  return {
    registerElement,
    handleDrop,
    setTreeMap,
    setTreeStore
  }
}
