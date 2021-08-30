import { get, writable } from 'svelte/store'
import { createNode } from '../tree-utils'

import type { ITreeNode } from '../types'

export const createTreeStore = () => {
  const treeStore = writable<ITreeNode>(createNode(0, 'root', [], 0, null))

  return {
		set: treeStore.set,
		subscribe: treeStore.subscribe,
  }
}
