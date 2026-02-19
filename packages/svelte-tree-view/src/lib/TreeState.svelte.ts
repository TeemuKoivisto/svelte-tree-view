import { derived, writable } from 'svelte/store'

import { createRootNode } from './tree-node.svelte'
import type { TreeNode, TreeRecursionOpts, TreeViewProps } from './types'

export type StoreOptions = Omit<TreeViewProps, 'data' | 'rootNode'>

export class TreeState {
  defaultRootNode = createRootNode()
  treeMap = $state<Record<string, TreeNode>>({
    [this.defaultRootNode.id]: this.defaultRootNode
  })
  rootNode = $derived(this.treeMap[this.defaultRootNode.id])
  rootElement = writable<HTMLElement | null>(null)
  viewProps: ReturnType<typeof writable<StoreOptions>>
  recursionOpts: ReturnType<typeof derived<typeof this.viewProps, TreeRecursionOpts | undefined>>
  iteratedValues = new Map<any, TreeNode>()

  constructor(initialProps: StoreOptions) {
    this.viewProps = writable<StoreOptions>(initialProps)
    this.recursionOpts = derived(this.viewProps, p => p.recursionOpts)
  }
}
