import { SvelteComponentTyped } from 'svelte'

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
  id: string // ID generated from the path to this node eg "[0,1,2]"
  index: number // Index of this node in the parent object as its values are iterated
  key: string // Key of this node eg "1" for an array key or "foo" for an object
  value: T // The value mapped to this key
  depth: number
  collapsed: boolean
  type: ValueType
  path: number[]
  parentId: string | null
  // Circularity is checked by object identity to prevent recursing the same values again
  circularOfId: string | null
  children: TreeNode[]
}

export interface Base16Theme {
  scheme?: string
  author?: string
  base00: string // Default Background
  base01: string // Lighter Background (Used for status bars, line number and folding marks)
  base02: string // Selection Background
  base03: string // Comments, Invisibles, Line Highlighting
  base04: string // Dark Foreground (Used for status bars)
  base05: string // Default Foreground, Caret, Delimiters, Operators
  base06: string // Light Foreground (Not often used)
  base07: string // Light Background (Not often used)
  base08: string // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
  base09: string // Integers, Boolean, Constants, XML Attributes, Markup Link Url
  base0A: string // Classes, Markup Bold, Search Text Background
  base0B: string // Strings, Inherited Class, Markup Code, Diff Inserted
  base0C: string // Support, Regular Expressions, Escape Characters, Markup Quotes
  base0D: string // Functions, Methods, Attribute IDs, Headings
  base0E: string // Keywords, Storage, Selector, Markup Italic, Diff Changed
  base0F: string // Deprecated, Opening/Closing Embedded Language Tags, e.g. <?php ?>
}

// As described in https://stackoverflow.com/questions/67697298/svelte-components-as-object-properties/67737182#67737182
export type ValueComponent = new (...args: any) => SvelteComponentTyped<{
  value: any
  node: TreeNode
  defaultFormatter?: (val: any) => string | undefined
}>

export interface TreeViewProps {
  data: object // Data can be basically any non-primitive value
  class?: string // Top node has 'svelte-tree-view' class by default
  theme?: Base16Theme
  showLogButton?: boolean
  showCopyButton?: boolean
  valueComponent?: ValueComponent // The Svelte component to replace the default value-as-string presentation
  recursionOpts?: TreeRecursionOpts
  // For custom formatting of the value string. Returning undefined will pass the value to the default formatter
  valueFormatter?: (val: any, n: TreeNode) => string | undefined
}

export interface TreeRecursionOpts {
  maxDepth?: number // The default maxDepth is 16
  // Quick and dirty way to prevent recursing certain object keys instead of overriding shouldExpandNode
  omitKeys?: string[]
  stopCircularRecursion?: boolean // Stops recursing objects already recursed
  isCircularNode?: (n: TreeNode, iteratedValues: Map<any, TreeNode>) => boolean // For custom circularity detection magic
  shouldExpandNode?: (n: TreeNode) => boolean // Will auto-expand or collapse values as data is provided
  mapChildren?: (val: any, type: ValueType, parent: TreeNode) => [string, any][] | undefined // For customizing the created key-value pairs
}

export class TreeView extends SvelteComponentTyped<TreeViewProps> {}
export default TreeView
