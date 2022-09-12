import { derived, get, writable } from 'svelte/store'

import type { TreeNode, TreeViewProps } from '../types'

export type PropsStore = ReturnType<typeof createPropsStore>

export const createPropsStore = (initialProps: Omit<TreeViewProps, 'data'>) => {
  const props = writable<Omit<TreeViewProps, 'data'>>(initialProps)
  const recursionOpts = derived(props, p => p.recursionOpts)

  return {
    props,
    recursionOpts,

    setProps(newProps: Omit<TreeViewProps, 'data'>) {
      props.set(newProps)
    },

    formatValue(val: any, node: TreeNode) {
      const { valueFormatter } = get(props)
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
        case 'symbol':
          return String(val)
        default:
          return val
      }
    }
  }
}
