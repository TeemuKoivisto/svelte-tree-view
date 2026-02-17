import { vi } from 'vitest'
import { createStore, type TreeNode } from 'svelte-tree-view'

import { moveNode } from '../move-utils'

import dndData from '$lib/example_dnd.json'

const instructions = [
  { operation: 'combine', blocked: false, axis: 'vertical' },
  { operation: 'reorder-before', blocked: false, axis: 'vertical' },
  { operation: 'reorder-after', blocked: false, axis: 'vertical' }
] as const

const DEFAULT_RECURSION_OPTS = {
  maxDepth: 16,
  omitKeys: [],
  stopCircularRecursion: false,
  shouldExpandNode: () => true
}

const snapPath = (i: number, j: number, name?: string) =>
  `./__snapshots__/${i}-${j}${name ? '-' + name : ''}.json`

const intoJSON = (map: Record<string, TreeNode<any>>) =>
  Object.entries(map).reduce<Record<string, any>>(
    (acc, [id, { getValue, updateValue, ...node }]) => {
      acc[id] = { ...node, value: getValue() }
      return acc
    },
    {}
  )

describe('moveNode', () => {
  const store = createStore({ recursionOpts: DEFAULT_RECURSION_OPTS, treeNode: (() => {}) as any })
  store.createTree(structuredClone(dndData), DEFAULT_RECURSION_OPTS, false)
  const treeMap = store.treeMap

  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(1704060000000))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    store.createTree(structuredClone(dndData), DEFAULT_RECURSION_OPTS, false)
  })

  /** Re-expand affected parents after a moveNode call to rebuild the tree structure */
  function reexpandAfterMove(nodeIds: string[]) {
    for (const id of nodeIds) {
      const node = treeMap[id]
      if (node) {
        store.expandNodeChildren(node, DEFAULT_RECURSION_OPTS)
      }
    }
  }

  describe('with instruction reorder-before', () => {
    it('should reorder n2-c1-gc2 before n2-c1-gc1 within same parent', async () => {
      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node'))

      // n2-c1's grandchildren: [n2-c1-gc1, n2-c1-gc2] → [n2-c1-gc2, n2-c1-gc1]
      // dragged=[1,2,0,2,1] (n2-c1-gc2), target=[1,2,0,2,0] (n2-c1-gc1)
      const dragged = treeMap['[1,2,0,2,1]']
      const target = treeMap['[1,2,0,2,0]']
      const oldParentId = dragged.parentId! // [1,2,0,2] (n2-c1's children array)

      moveNode(dragged, target, instructions[1], treeMap)
      reexpandAfterMove([oldParentId])

      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node-before'))
    })
  })

  describe('with instruction reorder-before (cross-parent)', () => {
    it('should move n1-c2 before n1-c1-gc2 into a deeper list', async () => {
      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node'))

      // Move n1-c2 from n1's children into n1-c1's grandchildren, before n1-c1-gc2
      // dragged=[0,2,1] (n1-c2), target=[0,2,0,2,1] (n1-c1-gc2)
      const dragged = treeMap['[0,2,1]']
      const target = treeMap['[0,2,0,2,1]']
      const oldParentId = dragged.parentId! // [0,2] (n1's children array)
      // target parent for reorder = [0,2,0,2] (n1-c1's children array)
      const targetParentId = target.parentId!

      moveNode(dragged, target, instructions[1], treeMap)
      reexpandAfterMove([oldParentId, targetParentId])

      // n1's children: was [n1-c1, n1-c2] → [n1-c1]
      // n1-c1's grandchildren: was [n1-c1-gc1, n1-c1-gc2] → [n1-c1-gc1, n1-c2, n1-c1-gc2]
      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node-cross'))
    })
  })

  describe('with instruction reorder-after', () => {
    it('should reorder n2-c1-gc1 after n2-c1-gc2 within same parent', async () => {
      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node'))

      // n2-c1's grandchildren: [n2-c1-gc1, n2-c1-gc2] → [n2-c1-gc2, n2-c1-gc1]
      // dragged=[1,2,0,2,0] (n2-c1-gc1), target=[1,2,0,2,1] (n2-c1-gc2)
      const dragged = treeMap['[1,2,0,2,0]']
      const target = treeMap['[1,2,0,2,1]']
      const oldParentId = dragged.parentId!

      moveNode(dragged, target, instructions[2], treeMap)
      reexpandAfterMove([oldParentId])

      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node-after'))
    })
  })
})
