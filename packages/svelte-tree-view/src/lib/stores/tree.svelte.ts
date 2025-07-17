import { get } from 'svelte/store'

import { createNode, recurseObjectProperties } from '../tree-utils.svelte'
import type { TreeNode, TreeRecursionOpts } from '../types'
import type { PropsStore } from './props'

export type TreeStore = ReturnType<typeof createTreeStore>

export const createTreeStore = (propsStore: PropsStore) => {
  const [defaultRootNode] = createNode(-1, 'root', [], 0, null, {})
  const treeMap = $state<Record<string, TreeNode>>({
    [defaultRootNode.id]: defaultRootNode
  })
  const rootNode = $derived(treeMap[defaultRootNode.id])
  const iteratedValues = new Map<any, TreeNode>()

  return {
    treeMap,
    rootNode,

    recompute(data: unknown, recursionOpts: TreeRecursionOpts<any>, recomputeExpandNode: boolean) {
      const oldIds = new Set(Object.keys(treeMap))
      iteratedValues.clear()
      recurseObjectProperties(
        defaultRootNode.index,
        defaultRootNode.key,
        data,
        defaultRootNode.depth,
        true,
        null,
        treeMap,
        oldIds,
        iteratedValues,
        recomputeExpandNode,
        recursionOpts
      )
      for (const id of oldIds) {
        delete treeMap[id]
      }
      get(propsStore.props).onUpdate?.(treeMap)
    },

    toggleCollapse(id: string) {
      const node = treeMap[id]
      if (!node) {
        return console.warn(`Attempted to collapse non-existent node: ${id}`)
      }
      node.collapsed = !node.collapsed
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
      const nodeWithUpdatedChildren = recurseObjectProperties(
        node.index,
        node.key,
        node.getValue(),
        node.depth,
        !node.collapsed, // Ensure that when uncollapsed the node's children are always recursed
        parent,
        treeMap,
        new Set(),
        iteratedValues,
        false, // Never recompute shouldExpandNode since it may override the collapsing of this node
        recursionOpts
      )
      if (!nodeWithUpdatedChildren) return
      treeMap[nodeWithUpdatedChildren.id] = nodeWithUpdatedChildren
      treeMap[parent.id] = parent
      get(propsStore.props).onUpdate?.(treeMap)
    },

    expandAllNodesToNode(id: string) {
      function recurseNodeUpwards(
        updated: Record<string, TreeNode | null>,
        node?: TreeNode | null
      ) {
        if (!node) return
        updated[node.id]!.collapsed = false
        if (node.parentId) {
          recurseNodeUpwards(updated, updated[node.parentId])
        }
      }
      const updated = treeMap
      recurseNodeUpwards(updated, updated[id])
      get(propsStore.props).onUpdate?.(updated)
    }
  }
}
