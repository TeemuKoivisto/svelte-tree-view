import { get, writable } from 'svelte/store'

import { createNode, recomputeTree, recurseObjectProperties } from '../tree-utils.svelte'
import type { TreeNode, TreeRecursionOpts } from '../types'
import type { PropsStore } from './props'

export type TreeStore = ReturnType<typeof createTreeStore>

export const createTreeStore = (propsStore: PropsStore) => {
  const defaultRootNode = createNode(0, 'root', [], 0, null)
  const tree = writable<TreeNode>(defaultRootNode)
  const treeMap = writable<Record<string, TreeNode>>({})
  const iteratedValues = writable<Map<any, TreeNode>>(new Map())

  return {
    tree,
    treeMap,
    defaultRootNode,

    update(data: unknown, recursionOpts: TreeRecursionOpts<any>, recomputeExpandNode: boolean) {
      const oldTreeMap = get(treeMap)
      const recomputed = recomputeTree(data, oldTreeMap, recursionOpts, recomputeExpandNode)
      if (recomputed.tree) {
        tree.set(recomputed.tree)
      } else {
        tree.set(defaultRootNode)
      }
      treeMap.set(recomputed.treeMap)
      iteratedValues.set(recomputed.iteratedValues)
      get(propsStore.props).onUpdate?.(recomputed.treeMap)
      // console.log('recomputed', recomputed.treeMap)
      // treeStore.init(tree, treeMap, iteratedValues)
    },

    toggleCollapse(id: string) {
      const node = get(treeMap)[id]
      if (!node) {
        console.warn(`Attempted to collapse non-existent node: ${id}`)
        return
      }
      const updatedNode = { ...node, collapsed: !node.collapsed }
      const newMap = { ...get(treeMap), [node.id]: updatedNode }
      treeMap.set(newMap)
      const recursionOpts = get(propsStore.recursionOpts)
      if (recursionOpts) {
        this.expandNodeChildren(updatedNode, recursionOpts)
      } else {
        get(propsStore.props).onUpdate?.(newMap)
      }
    },

    expandNodeChildren(node: TreeNode, recursionOpts: TreeRecursionOpts) {
      const parent = get(treeMap)[node?.parentId || ''] || null
      if (!parent) {
        // Only root node has no parent and it should not be expandable
        throw Error('No parent in expandNodeChildren for node: ' + node)
      }
      const newTreeMap: Record<string, TreeNode> = { ...get(treeMap) }
      const oldTreeMap = get(treeMap)
      const previouslyIterated = get(iteratedValues)
      const nodeWithUpdatedChildren = recurseObjectProperties(
        node.index,
        node.key,
        node.getValue(),
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
      newTreeMap[nodeWithUpdatedChildren.id] = nodeWithUpdatedChildren
      newTreeMap[parent.id] = parent
      treeMap.set(newTreeMap)
      iteratedValues.set(previouslyIterated)
      get(propsStore.props).onUpdate?.(newTreeMap)
    },

    expandAllNodesToNode(id: string) {
      function recurseNodeUpwards(
        updated: Record<string, TreeNode | null>,
        node?: TreeNode | null
      ) {
        if (!node) return
        updated[node.id] = { ...node, collapsed: false }
        if (node.parentId) {
          recurseNodeUpwards(updated, updated[node.parentId])
        }
      }
      const updated = { ...get(treeMap) }
      recurseNodeUpwards(updated, updated[id])
      treeMap.set(updated)
      get(propsStore.props).onUpdate?.(updated)
    }
  }
}
