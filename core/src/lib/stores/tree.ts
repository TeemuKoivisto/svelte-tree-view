import { writable } from 'svelte/store'
import { createNode } from '../tree-utils'

import type { ITreeNode } from '../types'

export const createTreeStore = () => {
  const defaultRootNode = createNode(0, 'root', [], 0, null)
  const treeStore = writable<ITreeNode>(defaultRootNode)

  return {
    set(value: ITreeNode | null) {
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
