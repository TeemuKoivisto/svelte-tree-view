import { get } from 'svelte/store'

import {
  buildTree,
  expandAllNodesToNode as _expandAllNodesToNode,
  expandNodeChildren as _expandNodeChildren,
  formatValue as _formatValue,
  refreshNodeChildren as _refreshNodeChildren
} from './store-methods'
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
    return _formatValue(val, node, valueFormatter)
  }

  function createTree(
    data: unknown,
    recursionOpts: TreeRecursionOpts<any>,
    recomputeExpandNode: boolean
  ) {
    buildTree(
      data,
      state.defaultRootNode,
      state.treeMap,
      state.iteratedValues,
      recursionOpts,
      recomputeExpandNode
    )
    get(state.viewProps).onUpdate?.(state.treeMap)
  }

  /**
   * Collapses node's children if they are shown, uncollapses otherwise
   * @param id
   */
  function toggleCollapse(id: string) {
    const node = state.treeMap[id] as TreeNode | undefined
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
    _expandNodeChildren(node, state.treeMap, state.iteratedValues, recursionOpts)
    get(state.viewProps).onUpdate?.(state.treeMap)
  }

  function expandAllNodesToNode(id: string) {
    _expandAllNodesToNode(id, state.treeMap)
    get(state.viewProps).onUpdate?.(state.treeMap)
  }

  /**
   * Either collapses a node normally, or incase a circular node, scrolls into the original node
   * @param id
   */
  function collapseOrScrollIntoCircularNode(id: string) {
    const node = state.treeMap[id]
    if (node.children.length > 0) {
      toggleCollapse(id)
    } else if (node.circularOfId) {
      expandAllNodesToNode(node.circularOfId)
      get(state.rootElement)
        ?.querySelector(`[data-tree-node-id="${node.circularOfId}"]`)
        ?.scrollIntoView()
    }
  }

  function refreshNodeChildren(ids: string[], depth = -1) {
    const recurOpts = get(state.recursionOpts)
    if (!recurOpts) {
      console.warn('refreshNodeChildren: no recursionOpts set')
      return
    }
    _refreshNodeChildren(ids, state.treeMap, state.iteratedValues, recurOpts, depth)
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
    expandAllNodesToNode,
    collapseOrScrollIntoCircularNode,
    refreshNodeChildren
  }
}
