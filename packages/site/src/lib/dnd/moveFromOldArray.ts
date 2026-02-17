type Edge = "top" | "right" | "bottom" | "left"

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
  let passedItselfIdx = -1
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
      } else if (edge === 'bottom') {
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
      } else {
        // OLD WAY with dnd-kit & items moved immediately into new arrays
        // If active item was dragged from below, moved it to over's place. Otherwise place it below
        newIndex = sameList && i < oldIndex ? i : i + 1
      }
      break
    } else if (isActive(item)) {
      // Passed active item before terminating at over
      passedItselfIdx = i
    }
  }
  if (oldIndex === -1) {
    throw Error(`Failed to find active ${active} from oldList: ${JSON.stringify(oldList)}`)
  }
  oldList.splice(oldIndex, 1)
  // If passed itself in the newList, adjust the index as the items just shifted by 1
  if (!sameList && passedItselfIdx !== -1) {
    // This is a rather awkward edge case, but sometimes the active item is in BOTH old and new list...
    // We should delete the duplicate before doing anything and then proceed as it didn't exist in the first place
    newList.splice(passedItselfIdx, 1)
  }
  const adjustedIdx = passedItselfIdx !== -1 && edge === null ? Math.max(newIndex - 1, 0) : newIndex
  newList.splice(adjustedIdx, 0, active)
}
