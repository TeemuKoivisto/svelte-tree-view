import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/list-item'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types'
import type { TreeNode } from 'svelte-tree-view'

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
      console.log('parentVal', parentVal)
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
  // console.log('MOVE', draggedVal)
  // console.log('TARGET', targetVal)
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

export function moveFromOldArray<T>(
  active: T,
  isActive: (val: T) => boolean,
  isOver: ((val: T) => boolean) | undefined,
  oldList: T[],
  newList: T[],
  edge: Edge | null = null
) {
  const oldIndex = oldList.findIndex(v => isActive(v))
  const sameList = oldList === newList
  let newIndex = edge === 'bottom' ? newList.length - 1 : 0
  let passedItself = false
  for (let i = 0; i < newList.length; i += 1) {
    const item = newList[i]
    if (isOver && isOver(item)) {
      const draggedFromBelow = oldIndex > i
      if (edge === 'top') {
        /**
         * The newIndex is calculated by relying on the split() semantics where inserting at index will insert
         * the element in place of the current element. Eg. [1,2,3].splice(0, 0, 4) -> [4,1,2,3]
         * @TODO prob needs to use x,y coordinates also to know direction when not in the same list
         *
         * If dragging from BELOW and edge top -> insert at i -> [item2, item1, item3]
         *
         * ---drop--- newIndex = 0
         * 0 item1 <over> i = 0
         * 1 item2 <active> oldIndex = 1
         * 2 item3
         *
         * But if dragging from ABOVE and edge top -> insert i - 1 -> [item1, item2, item3]
         *
         * 0 item1 <active> oldIndex = 0
         * ---drop--- newIndex = 0
         * 1 item2 <over> i = 1
         * 2 item3
         */
        newIndex = sameList && draggedFromBelow ? i : Math.max(i - 1, 0)
      } else {
        /**
         * If dragging from BELOW and edge bottom -> insert at i + 1 -> [item1, item2, item3]
         *
         * 0 item1 <over> i = 0
         * ---drop--- newIndex = 1
         * 1 item2 <active> oldIndex = 1
         * 2 item3
         *
         * But if dragging from ABOVE and edge bottom -> insert i + 2 -> [item2, item1, item3]
         *
         * 0 item1 <active> oldIndex = 0
         * 1 item2 <over> i = 1
         * ---drop--- newIndex = 2
         * 2 item3
         */
        newIndex = sameList && draggedFromBelow ? i + 1 : i // not adjusting i due to oldList.splice(oldIndex, 1)
      }
      break
    } else if (isActive(item)) {
      // Passed active item before terminating at over
      passedItself = true
    }
  }
  if (oldIndex === -1) {
    throw Error(`Failed to find active ${active} from oldList: ${JSON.stringify(oldList)}`)
  }
  oldList.splice(oldIndex, 1)
  // If passed itself in the newList, adjust the index as the items just shifted by 1
  newList.splice(passedItself && edge === null && newIndex > 0 ? newIndex - 1 : newIndex, 0, active)
}
