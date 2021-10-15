import { get, writable } from 'svelte/store'

import type { TreeNode } from '../types'

export const createTreeMapStore = () => {
  const treeMapStore = writable<Map<string, TreeNode>>(new Map())

  return {
    get: get(treeMapStore),
    set: treeMapStore.set,
    subscribe: treeMapStore.subscribe,

    getNode(id: string) {
      return get(treeMapStore).get(id)
    },

    toggleCollapse(id: string) {
      const node = get(treeMapStore).get(id)
      if (node) {
        treeMapStore.update(m => new Map(m.set(node.id, { ...node, collapsed: !node.collapsed })))
      } else {
        console.warn(`Attempted to collapse non-existent node: ${id}`)
      }
    },

    expandAllNodesToNode(id: string) {
      function recurseNodeUpwards(updated: Map<string, TreeNode | null>, node?: TreeNode | null) {
        if (!node) return
        updated.set(node.id, { ...node, collapsed: false })
        if (node.parentId) {
          recurseNodeUpwards(updated, updated.get(node.parentId))
        }
      }
      const updated = new Map<string, TreeNode>(get(treeMapStore))
      recurseNodeUpwards(updated, updated.get(id))
      treeMapStore.set(updated)
    }
  }
}
