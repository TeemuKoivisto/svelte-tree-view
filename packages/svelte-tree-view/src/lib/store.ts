import { get } from 'svelte/store'

import { recurseObjectProperties } from './tree-utils.svelte'
import { TreeState, type StoreOptions } from './TreeState.svelte'
import type { TreeNode, TreeRecursionOpts, TreeViewProps } from './types'

export type TreeStore = ReturnType<typeof createStore>

export const createStore = (initialProps: StoreOptions) => {
  const state = new TreeState(initialProps)

  function setProps(newProps: Omit<TreeViewProps, 'data'>) {
    state.viewProps.set(newProps)
  }

  function setRootElement(el: HTMLElement | null) {
    state.rootElement.set(el)
  }

  function formatValue(val: any, node: TreeNode): string {
    const { valueFormatter } = get(state.viewProps)
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
      case 'boolean':
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
    const oldIds = new Set(Object.keys(state.treeMap))
    const usedIds = new Set<string>()
    state.iteratedValues.clear()
    recurseObjectProperties(
      state.defaultRootNode.index,
      state.defaultRootNode.key,
      data,
      state.defaultRootNode.depth,
      true,
      null,
      state.treeMap,
      oldIds,
      state.iteratedValues,
      recomputeExpandNode,
      recursionOpts,
      usedIds
    )
    for (const id of oldIds) {
      delete state.treeMap[id]
    }
    get(state.viewProps).onUpdate?.(state.treeMap)
  }

  function toggleCollapse(id: string) {
    const node = state.treeMap[id]
    if (!node) {
      throw Error(`Attempted to collapse non-existent node: ` + JSON.stringify(node))
    }
    node.collapsed = !node.collapsed
    const recurOpts = get(state.recursionOpts)
    if (recurOpts) {
      expandNodeChildren(node, recurOpts)
    } else {
      get(state.viewProps).onUpdate?.(state.treeMap)
    }
  }

  function expandNodeChildren(node: TreeNode, recursionOpts: TreeRecursionOpts) {
    const parent = state.treeMap[node.parentId || '']
    if (!parent) {
      // Only root node has no parent and it should not be expandable
      throw Error('No parent in expandNodeChildren for node: ' + JSON.stringify(node))
    }
    recurseObjectProperties(
      node.index,
      node.key,
      node.getValue(),
      node.depth,
      !node.collapsed, // Ensure that when uncollapsed the node's children are always recursed
      parent,
      state.treeMap,
      new Set(),
      state.iteratedValues,
      false, // Never recompute shouldExpandNode since it may override the collapsing of this node
      recursionOpts,
      new Set<string>()
    )
    get(state.viewProps).onUpdate?.(state.treeMap)
  }

  function expandAllNodesToNode(id: string) {
    function recurseNodeUpwards(node?: TreeNode | null) {
      if (!node) return
      state.treeMap[node.id]!.collapsed = false
      if (node.parentId) {
        recurseNodeUpwards(state.treeMap[node.parentId])
      }
    }
    recurseNodeUpwards(state.treeMap[id])
    get(state.viewProps).onUpdate?.(state.treeMap)
  }

  return {
    get recursionOpts() {
      return state.recursionOpts
    },
    get rootElement() {
      return state.rootElement
    },
    get rootNode() {
      return state.rootNode
    },
    get treeMap() {
      return state.treeMap
    },
    get viewProps() {
      return state.viewProps
    },

    setProps,
    setRootElement,
    formatValue,
    createTree,
    toggleCollapse,
    expandNodeChildren,
    expandAllNodesToNode
  }
}
