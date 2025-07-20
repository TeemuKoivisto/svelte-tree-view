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
  const rootElement = writable<HTMLElement | null>(null)
  const viewProps = writable<Omit<TreeViewProps, 'data'>>(initialProps)
  const recursionOpts = derived(viewProps, p => p.recursionOpts)
  const iteratedValues = new Map<any, TreeNode>()

  function setProps(newProps: Omit<TreeViewProps, 'data'>) {
    viewProps.set(newProps)
  }

  function setRootElement(el: HTMLElement | null) {
    rootElement.set(el)
  }

  function formatValue(val: any, node: TreeNode): string {
    const { valueFormatter } = get(viewProps)
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
  }

  function createTree(
    data: unknown,
    recursionOpts: TreeRecursionOpts<any>,
    recomputeExpandNode: boolean
  ) {
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
    get(viewProps).onUpdate?.(treeMap)
  }

  function toggleCollapse(id: string) {
    const node = treeMap[id]
    if (!node) {
      return console.warn(`Attempted to collapse non-existent node: ${id}`)
    }
    node.collapsed = !node.collapsed
    const recurOpts = get(recursionOpts)
    if (recurOpts) {
      expandNodeChildren(node, recurOpts)
    } else {
      get(viewProps).onUpdate?.(treeMap)
    }
  }

  function expandNodeChildren(node: TreeNode, recursionOpts: TreeRecursionOpts) {
    const parent = treeMap[node.parentId || ''] || null
    if (!parent) {
      // Only root node has no parent and it should not be expandable
      throw Error('No parent in expandNodeChildren for node: ' + node)
    }
    recurseObjectProperties(
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
    get(viewProps).onUpdate?.(treeMap)
  }

  function expandAllNodesToNode(id: string) {
    function recurseNodeUpwards(node?: TreeNode | null) {
      if (!node) return
      treeMap[node.id]!.collapsed = false
      if (node.parentId) {
        recurseNodeUpwards(treeMap[node.parentId])
      }
    }
    recurseNodeUpwards(treeMap[id])
    get(viewProps).onUpdate?.(treeMap)
  }

  return {
    recursionOpts,
    rootElement,
    rootNode,
    treeMap,
    viewProps,

    setProps,
    setRootElement,
    formatValue,
    createTree,
    toggleCollapse,
    expandNodeChildren,
    expandAllNodesToNode
  }
}
