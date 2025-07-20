import { derived, get, writable } from 'svelte/store'

import { createNode, recurseObjectProperties } from './tree-utils.svelte'
import type { TreeNode, TreeRecursionOpts, TreeViewProps } from './types'

export type TreeStore = ReturnType<typeof createStore>

export const createStore = (initialProps: Omit<TreeViewProps, 'data'>) => {
  const [defaultRootNode] = createNode(-1, 'root', [], 0, null, {})
  const treeMap = $state<Record<string, TreeNode>>({
    [defaultRootNode.id]: defaultRootNode
  })
  const rootNode = $derived(treeMap[defaultRootNode.id])
  const rootElementStore = writable<HTMLElement | null>(null)
  const props = writable<Omit<TreeViewProps, 'data'>>(initialProps)
  const recursionOpts = derived(props, p => p.recursionOpts)
  const iteratedValues = new Map<any, TreeNode>()

  return {
    props,
    recursionOpts,
    rootElementStore,
    rootNode,
    treeMap,

    setProps(newProps: Omit<TreeViewProps, 'data'>) {
      props.set(newProps)
    },

    setRootElement(el: HTMLElement | null) {
      rootElementStore.set(el)
    },

    formatValue(val: any, node: TreeNode): string {
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
        case 'number':
          return val
        case 'boolean':
          return val ? 'true' : 'false'
        case 'symbol':
          return String(val)
        default:
          return node.type
      }
    },

    recompute(data: unknown, recursionOpts: TreeRecursionOpts<any>, recomputeExpandNode: boolean) {
      const oldIds = new Set(Object.keys(treeMap))
      iteratedValues.clear()
      recurseObjectProperties(
        defaultRootNode.index,
        defaultRootNode.key,
        data,
        defaultRootNode.depth,
        true,
        null,
        treeMap,
        oldIds,
        iteratedValues,
        recomputeExpandNode,
        recursionOpts
      )
      for (const id of oldIds) {
        delete treeMap[id]
      }
      get(props).onUpdate?.(treeMap)
    },

    toggleCollapse(id: string) {
      const node = treeMap[id]
      if (!node) {
        return console.warn(`Attempted to collapse non-existent node: ${id}`)
      }
      node.collapsed = !node.collapsed
      const recurOpts = get(recursionOpts)
      if (recurOpts) {
        this.expandNodeChildren(node, recurOpts)
      } else {
        get(props).onUpdate?.(treeMap)
      }
    },

    expandNodeChildren(node: TreeNode, recursionOpts: TreeRecursionOpts) {
      const oldTreeMap = treeMap
      const parent = oldTreeMap[node?.parentId || ''] || null
      if (!parent) {
        // Only root node has no parent and it should not be expandable
        throw Error('No parent in expandNodeChildren for node: ' + node)
      }
      const nodeWithUpdatedChildren = recurseObjectProperties(
        node.index,
        node.key,
        node.getValue(),
        node.depth,
        !node.collapsed, // Ensure that when uncollapsed the node's children are always recursed
        parent,
        treeMap,
        new Set(),
        iteratedValues,
        false, // Never recompute shouldExpandNode since it may override the collapsing of this node
        recursionOpts
      )
      if (!nodeWithUpdatedChildren) return
      treeMap[nodeWithUpdatedChildren.id] = nodeWithUpdatedChildren
      treeMap[parent.id] = parent
      get(props).onUpdate?.(treeMap)
    },

    expandAllNodesToNode(id: string) {
      function recurseNodeUpwards(
        updated: Record<string, TreeNode | null>,
        node?: TreeNode | null
      ) {
        if (!node) return
        updated[node.id]!.collapsed = false
        if (node.parentId) {
          recurseNodeUpwards(updated, updated[node.parentId])
        }
      }
      const updated = treeMap
      recurseNodeUpwards(updated, updated[id])
      get(props).onUpdate?.(updated)
    }
  }
}
