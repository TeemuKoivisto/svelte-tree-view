import { describe, expect, it, vi } from 'vitest'

import { createStore } from '../store'

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

const defaultOpts: TreeRecursionOpts = {
  maxDepth: 16,
  stopCircularRecursion: false,
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

    store.refreshNodeChildren([newParent.id, oldParent.id], 3)

    await expect(data).toMatchFileSnapshot(snapPath('file-tree', 0, 1))
    await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath('file-tree', 0, 2))
  })
})
