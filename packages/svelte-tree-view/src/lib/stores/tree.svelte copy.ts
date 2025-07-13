import { get, writable } from 'svelte/store'

import { createNode, recomputeTree, recurseObjectProperties } from '../tree-utils.svelte'
import type { TreeNode, TreeRecursionOpts } from '../types'
import type { PropsStore } from './props'

export type TreeStore = ReturnType<typeof createTreeStore>

export const createTreeStore = (propsStore: PropsStore) => {
  const [defaultRootNode] = createNode(0, 'root', [], 0, null, {})
  const tree = writable<TreeNode>(defaultRootNode)
  const treeMap = $state<Record<string, TreeNode>>({})
  const iteratedValues = writable<Map<any, TreeNode>>(new Map())

  return {
    tree,
    treeMap,
    defaultRootNode,

    update(data: unknown, recursionOpts: TreeRecursionOpts<any>, recomputeExpandNode: boolean) {
      const recomputed = recomputeTree(data, treeMap, recursionOpts, recomputeExpandNode)
      if (recomputed.tree) {
        tree.set(recomputed.tree)
      } else {
        tree.set(defaultRootNode)
      }
      // treeMap = recomputed.treeMap
      // treeMap.set(recomputed.treeMap)
      iteratedValues.set(recomputed.iteratedValues)
      get(propsStore.props).onUpdate?.(treeMap)
      // console.log('recomputed', $state.snapshot(recomputed.treeMap))
    },

    toggleCollapse(id: string) {
      const node = treeMap[id]
      if (!node) {
        console.warn(`Attempted to collapse non-existent node: ${id}`)
        return
      }
      node.collapsed = !node.collapsed
      // const updatedNode = { ...node, collapsed: !node.collapsed }
      // const newMap = { ...treeMap, [node.id]: updatedNode }
      // treeMap.set(newMap)
      const recursionOpts = get(propsStore.recursionOpts)
      if (recursionOpts) {
        this.expandNodeChildren(node, recursionOpts)
      } else {
        get(propsStore.props).onUpdate?.(treeMap)
      }
    },

    expandNodeChildren(node: TreeNode, recursionOpts: TreeRecursionOpts) {
      const oldTreeMap = treeMap
      const parent = oldTreeMap[node?.parentId || ''] || null
      if (!parent) {
        // Only root node has no parent and it should not be expandable
        throw Error('No parent in expandNodeChildren for node: ' + node)
      }
      const newTreeMap = { ...oldTreeMap }
      const previouslyIterated = get(iteratedValues)
      const nodeWithUpdatedChildren = recurseObjectProperties(
        node.index,
        node.key,
        node.getValue(),
        node.depth,
        !node.collapsed, // Ensure that when uncollapsed the node's children are always recursed
        parent,
        newTreeMap,
        new Set(),
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
      // treeMap.set(newTreeMap)
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
      const updated = treeMap
      recurseNodeUpwards(updated, updated[id])
      // treeMap.set(updated)
      get(propsStore.props).onUpdate?.(updated)
    }
  }
}
