import { createPropsStore } from './props'
import { createRootElementStore } from './root-element'
import { createTreeStore } from './tree'
import { createTreeMapStore } from './treemap'

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
