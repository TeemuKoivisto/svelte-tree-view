import type { createPropsStore } from './props'
import type { createRootElementStore } from './root-element'
import type { createTreeStore } from './tree'
import type { createTreeMapStore } from './treemap'

export { createPropsStore } from './props'
export { createRootElementStore } from './root-element'
export { createTreeStore } from './tree'
export { createTreeMapStore } from './treemap'

export interface Stores {
  propsStore: ReturnType<typeof createPropsStore>
  rootElementStore: ReturnType<typeof createRootElementStore>
  treeStore: ReturnType<typeof createTreeStore>
  treeMapStore: ReturnType<typeof createTreeMapStore>
}
