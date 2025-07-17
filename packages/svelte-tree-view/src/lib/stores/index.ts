import type { PropsStore } from './props'
import type { RootElementStore } from './root-element'
import type { TreeStore } from './tree.svelte'

export { createPropsStore } from './props'
export { createRootElementStore } from './root-element'
export { createTreeStore } from './tree.svelte'

export interface Stores {
  propsStore: PropsStore
  rootElementStore: RootElementStore
  treeStore: TreeStore
}
