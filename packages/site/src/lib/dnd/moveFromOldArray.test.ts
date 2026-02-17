import { describe, it, expect } from 'vitest'

import { moveFromOldArray } from './moveFromOldArray'

// Simple test items with IDs
const createItem = (id: number) => ({ id, name: `item-${id}` })

describe('moveFromOldArray', () => {
  /**
   * This tests the NEW implementation in moveFromOldArray.ts which has:
   * - `passedItselfIdx` (index) instead of boolean
   * - Explicit `edge === null` handling for dnd-kit style:
   *     `newIndex = sameList && i < oldIndex ? i : i + 1`
   * - Cross-list duplicate handling (removes from newList if exists)
   * - Uses `Math.max(newIndex - 1, 0)` for passedItself adjustment
   */

  describe('without edge set (null) - dnd-kit style behavior', () => {
    it('should move item below target when dragging from above', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 0 to position of item 1 (dragging from above)
      // i=1 < oldIndex=0? false, so newIndex = i + 1 = 2
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item1.id,
        items,
        items
      )
      expect(items).toEqual([item1, item0, item2])
    })

    it('should move item to target position when dragging from below', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 2 to position of item 0 (dragging from below)
      // i=0 < oldIndex=2? true, so newIndex = i = 0
      moveFromOldArray(
        item2,
        item => item.id === item2.id,
        item => item.id === item0.id,
        items,
        items
      )
      expect(items).toEqual([item2, item0, item1])
    })

    it('should move item to after target when dragging from above to last', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 0 to position of item 2 (dragging from above)
      // i=2 < oldIndex=0? false, so newIndex = i + 1 = 3
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item2.id,
        items,
        items
      )
      expect(items).toEqual([item1, item2, item0])
    })

    it('should swap adjacent items correctly - drag down', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const items = [item0, item1]

      // Move item 0 to item 1's position
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item1.id,
        items,
        items
      )
      expect(items).toEqual([item1, item0])
    })

    it('should swap adjacent items correctly - drag up', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const items = [item0, item1]

      // Move item 1 to item 0's position
      moveFromOldArray(
        item1,
        item => item.id === item1.id,
        item => item.id === item0.id,
        items,
        items
      )
      expect(items).toEqual([item1, item0])
    })
  })

  describe('with edge top', () => {
    it('should not move when dragging item to top edge of next item (from above)', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 0 to top edge of item 1
      // draggedFromBelow=false (oldIndex=0, i=1), so newIndex = Math.max(i-1, 0) = 0
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item1.id,
        items,
        items,
        'top'
      )
      expect(items).toEqual([item0, item1, item2])
    })

    it('should move item to before target when dragging from above to non-adjacent', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 0 to top edge of item 2
      // draggedFromBelow=false (oldIndex=0, i=2), newIndex = Math.max(2-1, 0) = 1
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item2.id,
        items,
        items,
        'top'
      )
      expect(items).toEqual([item1, item0, item2])
    })

    it('should move item to target position when dragging from below', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 2 to top edge of item 0 (dragging from below)
      // draggedFromBelow=true (oldIndex=2, i=0), newIndex = i = 0
      moveFromOldArray(
        item2,
        item => item.id === item2.id,
        item => item.id === item0.id,
        items,
        items,
        'top'
      )
      expect(items).toEqual([item2, item0, item1])
    })

    it('should move item to before target when dragging from below to middle', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 2 to top edge of item 1 (dragging from below)
      // draggedFromBelow=true (oldIndex=2, i=1), newIndex = i = 1
      moveFromOldArray(
        item2,
        item => item.id === item2.id,
        item => item.id === item1.id,
        items,
        items,
        'top'
      )
      expect(items).toEqual([item0, item2, item1])
    })
  })

  describe('with edge bottom', () => {
    it('should move item to after target when dragging from above', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 0 to bottom edge of item 1
      // draggedFromBelow=false (oldIndex=0 < i=1), newIndex = i = 1
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item1.id,
        items,
        items,
        'bottom'
      )
      expect(items).toEqual([item1, item0, item2])
    })

    it('should move item to end when dragging to bottom of last item', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 0 to bottom edge of item 2
      // draggedFromBelow=false (oldIndex=0 < i=2), newIndex = i = 2
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item2.id,
        items,
        items,
        'bottom'
      )
      expect(items).toEqual([item1, item2, item0])
    })

    it('should not move when dragging item to bottom edge of previous item (from below)', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 1 to bottom edge of item 0 (dragging from below)
      // draggedFromBelow=true (oldIndex=1 > i=0), newIndex = i+1 = 1
      moveFromOldArray(
        item1,
        item => item.id === item1.id,
        item => item.id === item0.id,
        items,
        items,
        'bottom'
      )
      expect(items).toEqual([item0, item1, item2])
    })

    it('should move item when dragging from below to non-adjacent', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const items = [item0, item1, item2]

      // Move item 2 to bottom edge of item 0
      // draggedFromBelow=true (oldIndex=2 > i=0), newIndex = i+1 = 1
      moveFromOldArray(
        item2,
        item => item.id === item2.id,
        item => item.id === item0.id,
        items,
        items,
        'bottom'
      )
      expect(items).toEqual([item0, item2, item1])
    })
  })

  describe('cross-list moves', () => {
    it('should move item from one list to another with edge top', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const item3 = createItem(3)
      const oldList = [item0, item1]
      const newList = [item2, item3]

      // Move item0 from oldList to top of item2 in newList
      // sameList=false, draggedFromBelow: oldIndex=0 > i=0? false
      // edge=top, so newIndex = Math.max(0-1, 0) = 0
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item2.id,
        oldList,
        newList,
        'top'
      )
      expect(oldList).toEqual([item1])
      expect(newList).toEqual([item0, item2, item3])
    })

    it('should move item from one list to another with edge bottom', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const item3 = createItem(3)
      const oldList = [item0, item1]
      const newList = [item2, item3]

      // Move item0 from oldList to bottom of item3 (2nd item) in newList
      // sameList=false, draggedFromBelow: oldIndex=0 > i=1? false
      // edge=bottom, so newIndex = i = 1
      // After oldList.splice removes item0, newList.splice(1, 0, item0) inserts at index 1
      // This effectively places item0 between item2 and item3
      // Note: cross-list bottom edge doesn't truly "append after" since splice happens after removal
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item3.id,
        oldList,
        newList,
        'bottom'
      )
      expect(oldList).toEqual([item1])
      expect(newList).toEqual([item2, item0, item3])
    })

    it('should move item to start when no over target with null edge', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const oldList = [item0, item1]
      const newList = [item2]

      // Move item0 to newList without specific target (edge null, no isOver match)
      // newIndex defaults to 0 (edge !== 'bottom')
      moveFromOldArray(item0, item => item.id === item0.id, undefined, oldList, newList, null)
      expect(oldList).toEqual([item1])
      expect(newList).toEqual([item0, item2])
    })

    it('should move item to last index when edge is bottom and no over target', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      const item3 = createItem(3)
      const oldList = [item0, item1]
      const newList = [item2, item3]

      // Move item0 to newList at bottom (no specific target)
      // newIndex = newList.length - 1 = 1 (default for bottom edge)
      // No isOver match, so we use the default newIndex
      moveFromOldArray(item0, item => item.id === item0.id, undefined, oldList, newList, 'bottom')
      expect(oldList).toEqual([item1])
      // Inserts at index 1 (newList.length-1 before any modifications = 1)
      expect(newList).toEqual([item2, item0, item3])
    })

    it('should handle duplicate in both lists by removing from newList first', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const item2 = createItem(2)
      // Item0 exists in both lists (edge case from inflow-history drag)
      const oldList = [item0, item1]
      const newList = [item0, item2]

      // Move item0 - it's in both lists
      // passedItselfIdx will be set when we find item0 in newList
      // The new impl removes the duplicate from newList first
      moveFromOldArray(
        item0,
        item => item.id === item0.id,
        item => item.id === item2.id,
        oldList,
        newList,
        'bottom'
      )
      expect(oldList).toEqual([item1])
      // Duplicate removed, then item0 inserted after item2
      expect(newList).toEqual([item2, item0])
    })
  })

  describe('error handling', () => {
    it('should throw when active item not found in oldList', () => {
      const item0 = createItem(0)
      const item1 = createItem(1)
      const itemNotInList = createItem(99)
      const items = [item0, item1]

      expect(() =>
        moveFromOldArray(
          itemNotInList,
          item => item.id === itemNotInList.id,
          item => item.id === item0.id,
          items,
          items
        )
      ).toThrow('Failed to find active')
    })
  })
})
