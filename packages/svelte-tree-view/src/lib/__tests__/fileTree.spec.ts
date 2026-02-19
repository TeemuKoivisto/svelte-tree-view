import { describe, expect, it, vi } from 'vitest'

import { buildTree, expandNodeChildren, updateNodeValue } from '../store-methods'
import { createRootNode } from '../tree-node.svelte'
import { recurseObjectProperties } from '../tree-recursion'
import { createStore } from '../store'
import { generateObj } from './generateObj'

import fileTree from './__fixtures__/file-tree.json'
// import fileTree from './__fixtures__/file-tree-2.json'

import type { TreeNode, TreeRecursionOpts } from '../types'

const snapPath = (key: string, i: number, j: number) => `./__snapshots__/${key}-${i}-${j}.json`

const intoJSON = (map: Record<string, TreeNode<any>>) =>
  Object.entries(map).reduce<Record<string, any>>(
    (acc, [id, { getValue, updateValue, ...node }]) => {
      acc[id] = { ...node, value: getValue() }
      return acc
    },
    {}
  )

const DEFAULT_RECURSION_OPTS: TreeRecursionOpts = {
  maxDepth: 16,
  omitKeys: [],
  stopCircularRecursion: false,
  shouldExpandNode: () => false
}

const defaultOpts: TreeRecursionOpts = {
  getNodeId: (val: any, key: string, parent: TreeNode) => {
    const parentId = parent.index !== -1 ? parent.id : ''
    // For array items, use the name property if available
    if (parent.type === 'array' && val && typeof val === 'object' && val.name) {
      return val.name
    }
    return `${parentId}:${key}`
  },
  shouldExpandNode: () => true
}

function makeTree(data: unknown, opts: TreeRecursionOpts = defaultOpts) {
  const treeMap: Record<string, TreeNode> = {}
  const iteratedValues = new Map<any, TreeNode>()
  const rootNode = createRootNode()
  buildTree(data, rootNode, treeMap, iteratedValues, opts, false)
  return { treeMap, root: rootNode, iteratedValues }
}

describe('file-tree', () => {
  it('', async () => {
    const data = structuredClone(fileTree)
    const store = createStore({ treeNode: (() => {}) as any, recursionOpts: defaultOpts })
    store.createTree(data, defaultOpts, false)
    const treeMap = store.treeMap

    await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath('file-tree', 0, 0))

    expect(treeMap['counter.ts']).toBeDefined()

    // Move it directly from the root object
    const counter = data[2].children[0].children?.[0] as { name: string; content: string }
    expect(counter.name).toBe('counter.ts')
    data[2].children[0].children?.splice(0, 1)
    data[0].children.splice(1, 0, counter)

    const newParent = treeMap['src']
    const node = treeMap['counter.ts']
    const oldParent = treeMap[node.parentId ?? '']
    // // remove counter.ts from old parent
    // oldParent.updateValue(oldParent.getValue().filter((v: any) => v.name !== 'counter.ts'))
    // // add counter.ts below index.ts
    // newParent.updateValue(
    //   (() => {
    //     const val = newParent.getValue() as { name: string, children: any[]}
    //     val.children.splice(1, 0, node.getValue())
    //     return val
    //   })()
    // )
    // recurseObjectProperties(
    //   newParent.index,
    //   newParent.key,
    //   newParent.getValue(),
    //   newParent.depth,
    //   false,
    //   treeMap[newParent.parentId || ''] ?? null
    // )
    expandNodeChildren(newParent, treeMap, new Map(), defaultOpts)
    expandNodeChildren(oldParent, treeMap, new Map(), defaultOpts)
    // store.refreshNodeChildren([newParent.id, oldParent.id], 2)

    await expect(data).toMatchFileSnapshot(snapPath('file-tree', 0, 1))
    await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath('file-tree', 0, 2))
  })
})
