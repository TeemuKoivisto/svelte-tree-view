import { get, writable } from 'svelte/store'

import type { TreeNode, TreeViewProps } from '../types'

export const createPropsStore = (props: Omit<TreeViewProps, 'data'>) => {
  const propsStore = writable<Omit<TreeViewProps, 'data'>>(props)

  return {
    set: propsStore.set,
    subscribe: propsStore.subscribe,

    formatValue(val: any, node: TreeNode) {
      const { valueFormatter } = get(propsStore)
      const customFormat = valueFormatter ? valueFormatter(val, node) : undefined
      if (customFormat) {
        return customFormat
      }
      switch (node.type) {
        case 'array':
          return `${node.circularOfId ? 'circular' : ''} [] ${val.length} items`
        case 'object':
          return `${node.circularOfId ? 'circular' : ''} {} ${Object.keys(val).length} keys`
        case 'map':
        case 'set':
          return `${node.circularOfId ? 'circular' : ''} () ${val.size} entries`
        case 'date':
          return `${val.toISOString()}`
        case 'string':
          return `"${val}"`
        case 'boolean':
          return val ? 'true' : 'false'
        default:
          return val
      }
    }
  }
}
