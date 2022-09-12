import { get, writable } from 'svelte/store'

import { createNode, recurseObjectProperties } from '../tree-utils'
import type { TreeNode, TreeRecursionOpts } from '../types'
import type { PropsStore } from './props'

export type TreeStore = ReturnType<typeof createTreeStore>

export const createTreeStore = (propsStore: PropsStore) => {
  const defaultRootNode = createNode(0, 'root', [], 0, null)
  const tree = writable<TreeNode>(defaultRootNode)
  const treeMap = writable<Map<string, TreeNode>>(new Map())
  const iteratedValues = writable<Map<any, TreeNode>>(new Map())

  return {
    tree,
    treeMap,
    defaultRootNode,

    init(
      newTree: TreeNode | null,
      newTreeMap: Map<string, TreeNode>,
      iterated: Map<any, TreeNode>
    ) {
      if (newTree) {
        tree.set(newTree)
      } else {
        tree.set(defaultRootNode)
      }
      treeMap.set(newTreeMap)
      iteratedValues.set(iterated)
    },

    getNode(id: string) {
      return get(treeMap).get(id)
    },

    toggleCollapse(id: string) {
      const node = get(treeMap).get(id)
      if (!node) {
        console.warn(`Attempted to collapse non-existent node: ${id}`)
        return
      }
      const updatedNode = { ...node, collapsed: !node.collapsed }
      treeMap.update(m => new Map(m.set(node.id, updatedNode)))
      const recursionOpts = get(propsStore.recursionOpts)
      if (recursionOpts) {
        this.expandNodeChildren(updatedNode, recursionOpts)
      }
    },

    expandNodeChildren(node: TreeNode, recursionOpts: TreeRecursionOpts) {
      const parent = this.getNode(node?.parentId || '') || null
      if (!parent) {
        // Only root node has no parent and it should not be expandable
        throw Error('No parent in expandNodeChildren for node: ' + node)
      }
      const newTreeMap = new Map(get(treeMap))
      const oldTreeMap = get(treeMap)
      const previouslyIterated = get(iteratedValues)
      const nodeWithUpdatedChildren = recurseObjectProperties(
        node.index,
        node.key,
        node.value,
        node.depth,
        !node.collapsed, // Ensure that when uncollapsed the node's children are always recursed
        parent,
        newTreeMap,
        oldTreeMap,
        previouslyIterated,
        false, // Never recompute shouldExpandNode since it may override the collapsing of this node
        recursionOpts
      )
      if (!nodeWithUpdatedChildren) return
      parent.children = parent.children.map(c =>
        c.id === nodeWithUpdatedChildren.id ? nodeWithUpdatedChildren : c
      )
      newTreeMap.set(nodeWithUpdatedChildren.id, nodeWithUpdatedChildren)
      newTreeMap.set(parent.id, parent)
      treeMap.set(newTreeMap)
      iteratedValues.set(previouslyIterated)
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
