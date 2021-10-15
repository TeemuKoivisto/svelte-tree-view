import { writable } from 'svelte/store'
import { createNode } from '../tree-utils'

import type { TreeNode } from '../types'

export const createTreeStore = () => {
  const defaultRootNode = createNode(0, 'root', [], 0, null)
  const treeStore = writable<TreeNode>(defaultRootNode)

  return {
    set(value: TreeNode | null) {
      if (value) {
        treeStore.set(value)
      } else {
        treeStore.set(defaultRootNode)
      }
    },
    subscribe: treeStore.subscribe,

    defaultRootNode
  }
}
