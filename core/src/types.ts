import { SvelteComponent, SvelteComponentTyped } from 'svelte'

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

export interface ITreeNode {
  id: string
  index: number
  key: string
  value: any
  depth: number
  collapsed: boolean
  type: ValueType
  path: number[]
  parentId: string | null
  circularOfId: string | null
  children: ITreeNode[]
}

export interface IBase16Theme {
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

export interface TreeViewProps {
  data: Object
  theme?: IBase16Theme
  leftIndent?: number
  showLogButton?: boolean
  showCopyButton?: boolean
  valueComponent?: SvelteComponentTyped<{
    value: any
    node: ITreeNode
    defaultFormatter?: (val: any) => string | undefined
  }>
  recursionOpts?: TreeRecursionOpts
  valueFormatter?: (val: any, n: ITreeNode) => string | undefined
}

export interface TreeRecursionOpts {
  maxDepth?: number
  omitKeys?: string[]
  stopCircularRecursion?: boolean
  isCircularNode?: (n: ITreeNode, iteratedValues: Map<any, ITreeNode>) => boolean
  shouldExpandNode?: (n: ITreeNode) => boolean
  mapChildren?: (val: any, type: ValueType, parent: ITreeNode) => [string, any][] | undefined
}

export class TreeView extends SvelteComponentTyped<TreeViewProps> {}
export default TreeView
