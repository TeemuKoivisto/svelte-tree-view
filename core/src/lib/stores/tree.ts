import { get, writable } from 'svelte/store'

import { createNode, recurseObjectProperties, recomputeTree } from '../tree-utils'
import type { TreeNode, TreeRecursionOpts } from '../types'

export type TreeStore = ReturnType<typeof createTreeStore>

export const createTreeStore = () => {
  const defaultRootNode = createNode(0, 'root', [], 0, null)
  const tree = writable<TreeNode>(defaultRootNode)
  const treeMap = writable<Map<string, TreeNode>>(new Map())

  return {
    tree,
    treeMap,
    defaultRootNode,

    init(newTree: TreeNode | null, newTreeMap: Map<string, TreeNode>) {
      if (newTree) {
        tree.set(newTree)
      } else {
        tree.set(defaultRootNode)
      }
      treeMap.set(newTreeMap)
    },

    getNode(id: string) {
      return get(treeMap).get(id)
    },

    toggleCollapse(id: string) {
      const node = get(treeMap).get(id)
      if (node) {
        treeMap.update(m => new Map(m.set(node.id, { ...node, collapsed: !node.collapsed })))
      } else {
        console.warn(`Attempted to collapse non-existent node: ${id}`)
      }
    },

    expandNodeChildren(id: string, recursionOpts: TreeRecursionOpts) {
      const oldNode = this.getNode(id)
      const parent = this.getNode(oldNode?.parentId || '') || null
      if (!oldNode || !parent) throw Error('No node or parent found to expand children for!')
      const newTreeMap = new Map()
      const oldTreeMap = get(treeMap)
      const iteratedValues = new Map()
      oldTreeMap.set(id, { ...oldNode, collapsed: false })
      const node = recurseObjectProperties(
        oldNode.index,
        oldNode.key,
        oldNode.value,
        oldNode.depth,
        parent,
        newTreeMap,
        oldTreeMap,
        iteratedValues,
        true,
        recursionOpts
      )
      if (!node) return
      parent.children = parent.children.map(c => c.id === id ? node : c)
      Array.from(newTreeMap.entries()).forEach(([node, id]) => {
        oldTreeMap.set(id, node)
      })
      treeMap.set(oldTreeMap)
    },

    expandAllNodesToNode(id: string) {
      function recurseNodeUpwards(updated: Map<string, TreeNode | null>, node?: TreeNode | null) {
        if (!node) return
        updated.set(node.id, { ...node, collapsed: false })
        if (node.parentId) {
          recurseNodeUpwards(updated, updated.get(node.parentId))
        }
      }
      const updated = new Map<string, TreeNode>(get(treeMap))
      recurseNodeUpwards(updated, updated.get(id))
      treeMap.set(updated)
    }
  }
}
