import type { Component, Snippet } from 'svelte'
import type { HTMLAttributes } from 'svelte/elements'
import type { TreeStore } from './store'

export type ValueType =
  | 'array'
  | 'map'
  | 'set'
  | 'date'
  | 'object'
  | 'function'
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'null'
  | 'undefined'

export interface TreeNode<T = any> {
  /**
   * ID generated from the index path to this node eg "[0,1,2]"
   */
  id: string
  /**
   * Index of this node in the parent object as returned by mapChildren()
   */
  index: number
  /**
   * Key of this node eg "1" for an array or "foo" for { foo: 'bar' } object
   */
  key: string
  /**
   * Since we use proxies, to avoid the node.value being proxied we wrap it in a getter.
   * This also makes controlling updates easier as only changes to this function trigger
   * new recursions.
   */
  getValue: () => T
  /**
   * Node depth in the tree. Root node is 0 so all 'normal' nodes start at 1
   */
  depth: number
  collapsed: boolean
  type: ValueType
  path: number[]
  parentId: string | null
  /**
   * Circularity is checked by object identity to prevent recursing the same values again
   */
  circularOfId: string | null
  children: string[]
}

export interface Base16Theme {
  scheme?: string
  author?: string
  /**
   * Default Background
   */
  base00: string
  /**
   * Lighter Background (Used for status bars, line number and folding marks)
   */
  base01: string
  /**
   * Selection Background
   */
  base02: string
  /**
   * Comments, Invisibles, Line Highlighting
   */
  base03: string
  /**
   * Dark Foreground (Used for status bars)
   */
  base04: string
  /**
   * Default Foreground, Caret, Delimiters, Operators
   */
  base05: string
  /**
   * Light Foreground (Not often used)
   */
  base06: string
  /**
   * Light Background (Not often used)
   */
  base07: string
  /**
   * Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
   */
  base08: string
  /**
   * Integers, Boolean, Constants, XML Attributes, Markup Link Url
   */
  base09: string
  /**
   * Classes, Markup Bold, Search Text Background
   */
  base0A: string
  /**
   * Strings, Inherited Class, Markup Code, Diff Inserted
   */
  base0B: string
  /**
   * Support, Regular Expressions, Escape Characters, Markup Quotes
   */
  base0C: string
  /**
   * Functions, Methods, Attribute IDs, Headings
   */
  base0D: string
  /**
   * Keywords, Storage, Selector, Markup Italic, Diff Changed
   */
  base0E: string
  /**
   * Deprecated, Opening/Closing Embedded Language Tags, e.g. <?php ?>
   */
  base0F: string
}

export interface TreeRecursionOpts<T = any> {
  /**
   * Default maxDepth is 16
   */
  maxDepth?: number
  /**
   * Quick and dirty way to prevent recursing certain object keys instead of overriding shouldExpandNode
   */
  omitKeys?: string[]
  /**
   * Stops recursing objects already recursed
   */
  stopCircularRecursion?: boolean
  /**
   * For custom circularity detection magic
   * @param n Iterated node
   * @param iteratedValues Map of all iterated values
   * @returns `true` if circular to skip iterating this value
   */
  isCircularNode?: (n: TreeNode<T>, iteratedValues: Map<any, TreeNode<T>>) => boolean
  /**
   * Will auto-expand or collapse values as data is provided
   * @param n
   * @returns
   */
  shouldExpandNode?: (n: TreeNode<T>) => boolean
  /**
   * Provide stable node IDs, eg for drag-and-drop. When not provided, IDs are derived from
   * the index path (eg "[0,1,2]") which changes when nodes move position.
   * On duplicate IDs, an error is logged and a random fallback ID is used.
   * @param value The node's value
   * @param key The node's key in its parent (eg property name or array index)
   * @param parent The parent TreeNode (never null — root node always uses a path-based ID)
   * @returns A unique string ID for this node
   */
  getNodeId?: (value: any, key: string, parent: TreeNode<T>) => string
  /**
   * For customizing the created key-value pairs
   * @param val Iterated value
   * @param type
   * @param parent
   * @returns
   */
  mapChildren?: (val: any, type: ValueType, parent: TreeNode<T>) => [string, any][] | undefined
}

/** Props passed to rendered TreeNodes */
export interface NodeProps<T = any> {
  node: TreeNode<T>
  TreeViewNode: Component<{ id: string }>
  getTreeContext: () => TreeStore
}

/** Props passed to the main component */
export interface TreeViewProps<T = any> {
  /**
   * Data can be basically any non-primitive value
   */
  data: unknown
  /**
   * Custom root node. Default <ul> with .svelte-tree-view class
   */
  rootNode?: Snippet<[Snippet]>
  /**
   * The rendered treeNode. DefaultNode.svelte can be used as the default
   */
  treeNode: Snippet<[NodeProps<T>]>
  theme?: Base16Theme
  showLogButton?: boolean
  showCopyButton?: boolean
  recursionOpts?: TreeRecursionOpts<T>
  onUpdate?: (newMap: Record<string, TreeNode>) => void
  /**
   * For custom formatting of the value string. Returning undefined will pass the value to the default formatter
   * @param val
   * @param n
   * @returns
   */
  valueFormatter?: (val: any, n: TreeNode<T>) => string | undefined
}

export type Props = TreeViewProps & HTMLAttributes<HTMLUListElement>
