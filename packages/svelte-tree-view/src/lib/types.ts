import { getContext, SvelteComponent, type Component, type Snippet } from 'svelte'
import type { HTMLAttributes } from 'svelte/elements'
import type { Writable } from 'svelte/store'
import type { Stores } from './stores'

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
   * ID generated from the path to this node eg "[0,1,2]"
   */
  id: string
  /**
   * Index of this node in the parent object as its values are iterated
   */
  index: number
  /**
   * Key of this node eg "1" for an array key or "foo" for an object
   */
  key: string
  /**
   * The value mapped to this key
   */
  value: T
  depth: number
  collapsed: boolean
  type: ValueType
  path: number[]
  parentId: string | null
  /**
   * Circularity is checked by object identity to prevent recursing the same values again
   */
  circularOfId: string | null
  children: TreeNode<T>[]
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

export interface NodeProps<T = any> {
  node: TreeNode<T>
  getCtx: () => ReturnType<typeof getContext<Stores>>
  // propsObj: Writable<Omit<TreeViewProps<T>, 'data' | 'node'>>
  children: Snippet<[{ id: string }]>
  handleLogNode(): void
  handleCopyNodeToClipboard(): void
  handleToggleCollapse(): void
}

export interface TreeViewProps<T = any> extends HTMLAttributes<HTMLUListElement> {
  /**
   * Data can be basically any non-primitive value
   */
  data: unknown
  node?: Snippet<[]>
  theme?: Base16Theme
  showLogButton?: boolean
  showCopyButton?: boolean
  recursionOpts?: TreeRecursionOpts<T>
  /**
   * For custom formatting of the value string. Returning undefined will pass the value to the default formatter
   * @param val
   * @param n
   * @returns
   */
  valueFormatter?: (val: any, n: TreeNode<T>) => string | undefined
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
   * @returns
   */
  isCircularNode?: (n: TreeNode<T>, iteratedValues: Map<any, TreeNode<T>>) => boolean
  /**
   * Will auto-expand or collapse values as data is provided
   * @param n
   * @returns
   */
  shouldExpandNode?: (n: TreeNode<T>) => boolean
  /**
   * For customizing the created key-value pairs
   * @param val Iterated value
   * @param type
   * @param parent
   * @returns
   */
  mapChildren?: (val: any, type: ValueType, parent: TreeNode<T>) => [string, any][] | undefined
}

// export type TreeView = Component<TreeViewProps>
export class TreeView extends SvelteComponent<TreeViewProps> {}
export default TreeView
