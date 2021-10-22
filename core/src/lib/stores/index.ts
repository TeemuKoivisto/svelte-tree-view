import type { PropsStore } from './props'
import type { RootElementStore } from './root-element'
import type { TreeStore } from './tree'

export { createPropsStore } from './props'
export { createRootElementStore } from './root-element'
export { createTreeStore } from './tree'

export interface Stores {
  propsStore: PropsStore
  rootElementStore: RootElementStore
  treeStore: TreeStore
}
