import { vi } from 'vitest'
import { createStore, type TreeNode } from 'svelte-tree-view'

import { moveNode } from '../move-utils'

import dndData from '$lib/example_dnd.json'

const instruction = { operation: 'reorder-before', blocked: false, axis: 'vertical' } as const
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
  const store = createStore({ recursionOpts: DEFAULT_RECURSION_OPTS })
  store.createTree(dndData, DEFAULT_RECURSION_OPTS, false)
  const treeMap = store.treeMap

  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(1704060000000))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('without edge set', () => {
    it('should move items as in the old implementation with dnd-kit & direct mutations', async () => {
      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node-basic'))

      moveNode(treeMap['[1,2,0,2,1]'], treeMap['[1,2,0,2,0]'], instruction, treeMap)
      // moveNode(treeMap['[1,2,0]'], treeMap['[0,2,1,1]'], instruction, treeMap)
      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 1, 'move-node-basic'))
    })
  })
})
