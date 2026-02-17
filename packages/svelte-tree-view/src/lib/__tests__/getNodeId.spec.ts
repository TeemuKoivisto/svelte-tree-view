import { render, fireEvent, findAllByText } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'

import { createNode, recurseObjectProperties } from '../tree-utils.svelte'

import DefaultTree from './DefaultTree.svelte'

import type { TreeNode, TreeRecursionOpts } from '../types'

function buildTree(data: unknown, opts: TreeRecursionOpts = {}) {
  const treeMap: Record<string, TreeNode> = {}
  const usedIds = new Set<string>()
  const root = recurseObjectProperties(
    -1,
    'root',
    data,
    0,
    true,
    null,
    treeMap,
    new Set(),
    new Map(),
    false,
    opts,
    usedIds
  )
  return { treeMap, root: root!, usedIds }
}

/** Create a minimal parent node for use in createNode tests */
function makeParent(): TreeNode {
  const [parent] = createNode(0, 'parent', {}, 0, null, {})
  return parent
}

async function clickByText(container: HTMLElement, text: string, index = 0) {
  const el = (await findAllByText(container, text))[index]
  if (el) {
    return fireEvent(
      el,
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
    )
  }
}

describe('getNodeId', () => {
  describe('createNode', () => {
    it('uses path-based id when getNodeId is not provided', () => {
      const treeMap: Record<string, TreeNode> = {}
      const [node] = createNode(0, 'foo', 'bar', 1, null, treeMap)
      expect(node.id).toBe('[]')
    })

    it('skips getNodeId for root node (parent is null)', () => {
      const treeMap: Record<string, TreeNode> = {}
      const usedIds = new Set<string>()
      const getNodeId = vi.fn(() => 'custom-id')
      const [node] = createNode(0, 'foo', 'bar', 1, null, treeMap, getNodeId, usedIds)
      // Root always gets path-based ID
      expect(node.id).toBe('[]')
      expect(getNodeId).not.toHaveBeenCalled()
    })

    it('uses getNodeId for non-root nodes', () => {
      const parent = makeParent()
      const treeMap: Record<string, TreeNode> = { [parent.id]: parent }
      const usedIds = new Set<string>()
      const getNodeId = () => 'custom-id'
      const [node] = createNode(0, 'foo', 'bar', 1, parent, treeMap, getNodeId, usedIds)
      expect(node.id).toBe('custom-id')
    })

    it('passes value, key, and parent to getNodeId', () => {
      const parent = makeParent()
      const treeMap: Record<string, TreeNode> = { [parent.id]: parent }
      const usedIds = new Set<string>()
      const getNodeId = vi.fn(() => 'id-1')

      createNode(0, 'child', 'val', 1, parent, treeMap, getNodeId, usedIds)

      expect(getNodeId).toHaveBeenCalledWith('val', 'child', parent)
    })

    it('tracks used ids in the usedIds set', () => {
      const parent = makeParent()
      const treeMap: Record<string, TreeNode> = { [parent.id]: parent }
      const usedIds = new Set<string>()
      const getNodeId = () => 'my-id'
      createNode(0, 'foo', 'bar', 1, parent, treeMap, getNodeId, usedIds)
      expect(usedIds.has('my-id')).toBe(true)
    })

    it('logs error and falls back to UUID on duplicate id', () => {
      const parent = makeParent()
      const treeMap: Record<string, TreeNode> = { [parent.id]: parent }
      const usedIds = new Set<string>()
      const getNodeId = () => 'duplicate-id'
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const [node1] = createNode(0, 'foo', 'bar', 1, parent, treeMap, getNodeId, usedIds)
      expect(node1.id).toBe('duplicate-id')

      const [node2] = createNode(1, 'baz', 'qux', 1, parent, treeMap, getNodeId, usedIds)
      expect(node2.id).not.toBe('duplicate-id')
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate node id "duplicate-id"')
      )

      errorSpy.mockRestore()
    })

    it('does not log error when same id exists in treeMap from previous walk', () => {
      const parent = makeParent()
      const treeMap: Record<string, TreeNode> = { [parent.id]: parent }
      const usedIds = new Set<string>()
      const getNodeId = () => 'stable-id'
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // First walk
      const [node1] = createNode(0, 'foo', 'bar', 1, parent, treeMap, getNodeId, usedIds)
      treeMap[node1.id] = node1

      // Second walk with fresh usedIds — same id in treeMap is fine (node reuse)
      const usedIds2 = new Set<string>()
      const [node2, oldNode] = createNode(0, 'foo', 'baz', 1, parent, treeMap, getNodeId, usedIds2)
      expect(node2.id).toBe('stable-id')
      expect(oldNode).toBeDefined()
      expect(errorSpy).not.toHaveBeenCalled()

      errorSpy.mockRestore()
    })
  })

  describe('recurseObjectProperties', () => {
    it('uses getNodeId for non-root nodes in the tree', () => {
      let counter = 0
      const getNodeId = () => `node-${counter++}`

      const data = { a: 1, b: { c: 2 } }
      const { treeMap } = buildTree(data, { getNodeId, shouldExpandNode: () => false })

      const nodeIds = Object.keys(treeMap)
      // Root always gets path-based ID "[]"
      expect(nodeIds).toContain('[]')
      // Children get custom IDs
      expect(nodeIds).toContain('node-0') // a
      expect(nodeIds).toContain('node-1') // b
      expect(nodeIds).toContain('node-2') // c
    })

    it('preserves collapsed state across rebuilds with stable ids', () => {
      const getNodeId = (_val: any, key: string, parent: TreeNode) => `${parent.id}/${key}`

      const data = { a: { x: 1 }, b: { y: 2 } }

      // First build
      const { treeMap } = buildTree(data, { getNodeId, shouldExpandNode: () => false })

      // Manually uncollapse 'a'
      treeMap['[]/a'].collapsed = false

      // Rebuild with same data — should preserve collapsed state
      const usedIds = new Set<string>()
      recurseObjectProperties(
        -1,
        'root',
        data,
        0,
        true,
        null,
        treeMap,
        new Set(Object.keys(treeMap)),
        new Map(),
        false,
        { getNodeId, shouldExpandNode: () => false },
        usedIds
      )

      expect(treeMap['[]/a'].collapsed).toBe(false)
      expect(treeMap['[]/b'].collapsed).toBe(true)
    })

    it('handles duplicate ids from getNodeId without crashing', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Deliberately return the same id for different nodes
      const getNodeId = () => 'same-id-for-all'

      const data = { a: 1, b: 2, c: 3 }
      const { treeMap, root } = buildTree(data, { getNodeId, shouldExpandNode: () => false })

      // Should not crash — root should have 3 children
      expect(root).toBeDefined()
      expect(root.children.length).toBe(3)

      // First child gets the requested id, the rest get UUID fallbacks
      const childIds = root.children
      expect(childIds[0]).toBe('same-id-for-all')
      expect(childIds[1]).not.toBe('same-id-for-all')
      expect(childIds[2]).not.toBe('same-id-for-all')

      // All 3 are unique
      expect(new Set(childIds).size).toBe(3)

      // Error logged for each duplicate
      expect(errorSpy).toHaveBeenCalledTimes(2)

      errorSpy.mockRestore()
    })

    it('stable ids survive node reorder (DnD scenario)', () => {
      const getNodeId = (_val: any, key: string, parent: TreeNode) => `${parent.id}/${key}`

      const data = { a: { x: 1 }, b: { y: 2 }, c: { z: 3 } }
      const { treeMap } = buildTree(data, { getNodeId, shouldExpandNode: () => false })

      // Manually uncollapse 'a' and 'c'
      treeMap['[]/a'].collapsed = false
      treeMap['[]/c'].collapsed = false

      // Simulate reorder: swap a and c
      const reordered = { c: { z: 3 }, b: { y: 2 }, a: { x: 1 } }
      const usedIds = new Set<string>()
      const oldIds = new Set(Object.keys(treeMap))
      recurseObjectProperties(
        -1,
        'root',
        reordered,
        0,
        true,
        null,
        treeMap,
        oldIds,
        new Map(),
        false,
        { getNodeId, shouldExpandNode: () => false },
        usedIds
      )

      // Collapsed state preserved despite different order
      expect(treeMap['[]/a'].collapsed).toBe(false)
      expect(treeMap['[]/b'].collapsed).toBe(true)
      expect(treeMap['[]/c'].collapsed).toBe(false)

      // Nested children still accessible
      expect(treeMap['[]/a/x']).toBeDefined()
      expect(treeMap['[]/c/z']).toBeDefined()
    })
  })

  describe('TreeView component with getNodeId', () => {
    it('renders with getNodeId and nodes are interactive', async () => {
      window.HTMLElement.prototype.scrollIntoView = vi.fn()
      const getNodeId = (_val: any, key: string, parent: TreeNode) => `${parent.id}/${key}`

      const data = {
        items: [1, 2, 3],
        nested: { deep: 'value' }
      }

      let map: Record<string, TreeNode> | undefined
      const results = render(DefaultTree, {
        data,
        recursionOpts: {
          getNodeId
        },
        onUpdate: (v: any) => {
          map = v
        }
      })

      // Root children collapsed by default
      expect(results.container.querySelectorAll('li').length).toBe(2)

      // Expand 'items'
      await clickByText(results.container, 'items:')
      expect(results.container.querySelectorAll('li').length).toBe(6)

      // Expand 'nested'
      await clickByText(results.container, 'nested:')
      expect(results.container.querySelectorAll('li').length).toBe(8)

      // Verify stable ids in the treeMap
      expect(map).toBeDefined()
      expect(map!['[]/items']).toBeDefined()
      expect(map!['[]/nested']).toBeDefined()
      expect(map!['[]/nested/deep']).toBeDefined()
    })

    it('preserves expanded state after rerender with getNodeId', async () => {
      window.HTMLElement.prototype.scrollIntoView = vi.fn()
      const getNodeId = (_val: any, key: string, parent: TreeNode) => `${parent.id}/${key}`

      const data = { a: { x: 1 }, b: { y: 2 } }
      const results = render(DefaultTree, {
        data,
        recursionOpts: { getNodeId }
      })

      // Expand 'a'
      await clickByText(results.container, 'a:')
      expect(results.container.querySelectorAll('li').length).toBe(4)

      // Rerender with same data — 'a' should stay expanded
      await results.rerender({
        data: { ...data },
        recursionOpts: { getNodeId }
      })
      expect(results.container.querySelectorAll('li').length).toBe(4)
    })
  })
})
