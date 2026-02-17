import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/list-item'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types'
import type { TreeNode } from 'svelte-tree-view'

import { moveFromOldArray } from './moveFromOldArray'

function getTargetList(
  target: TreeNode,
  instruction: Instruction,
  treeMap: Record<string, TreeNode>
): [any[], TreeNode] | [] {
  const targetVal = target.getValue()
  if (Array.isArray(targetVal)) {
    return [targetVal, target]
  } else if (targetVal && typeof targetVal === 'object') {
    // here get parent node, find this object's index, insert at before/after
    // incase of combine instruction, insert as property to droppedTo
    if (instruction.operation === 'combine') {
      if (!('children' in targetVal) || !Array.isArray(targetVal.children)) {
        targetVal.children = []
      }
      return [targetVal.children, target]
    } else {
      const parent = treeMap[target.parentId || '']
      const parentVal = parent?.getValue()
      if (!parent) {
        console.error(`No parent found in treeMap for node`, target)
      } else if (!Array.isArray(parentVal)) {
        console.error(`Can't insert objets to non-array parents`, parentVal)
      } else {
        return [parentVal, parent]
      }
    }
  } else {
    console.warn(`Unknown dropped value ${typeof targetVal}`, targetVal)
  }
  return []
}

export function moveNode(
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
  const [newList, targetNode] = getTargetList(target, instruction, treeMap)
  if (!newList || !targetNode) {
    return
  }
  const oldParent = treeMap[dragged.parentId || '']
  const oldParentVal = oldParent?.getValue()
  if (!Array.isArray(oldParentVal)) {
    console.error(`Unable to remove dragged node from parent`, oldParentVal)
    return
  }
  // Instructions are basically fancy edges where 'combine' is the 'inside edge'
  const edge =
    instruction.operation === 'combine'
      ? null
      : instruction.operation === 'reorder-before'
        ? 'top'
        : 'bottom'
  moveFromOldArray(
    draggedVal,
    v => v === draggedVal,
    t => t === targetVal,
    oldParentVal,
    newList,
    edge
  )
  targetNode.updateValue(newList)
  oldParent.updateValue(oldParentVal)
}
