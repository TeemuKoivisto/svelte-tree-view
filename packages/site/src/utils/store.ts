import { writable } from 'svelte/store'
import * as parser from './parser'
import example1 from './example1.json'

export interface FormState {
  data: string
  leftIndent: string
  lineHeight: string
  fontFamily: string
  fontSize: string
  keyMarginRight: string
  showLogButton: boolean
  showCopyButton: boolean
  valueComponent: any
  recursionOpts: string
  valueFormatter: string
  theme: string
}

export const DEFAULT_OPTIONS: FormState = {
  data: '',
  leftIndent: '0.875em',
  lineHeight: '1.1',
  fontFamily: 'Helvetica Neue',
  fontSize: '13px',
  keyMarginRight: '0.5em',
  showLogButton: false,
  showCopyButton: false,
  valueComponent: undefined,
  recursionOpts: `{
  maxDepth: 16,
  omitKeys: [],
  stopCircularRecursion: false,
  isCircularNode(node, iteratedValues) {
    if (node.type === 'object' || node.type === 'array') {
      const existingNodeWithValue = iteratedValues.get(node.value)
      if (existingNodeWithValue && node.id !== existingNodeWithValue.id) {
        node.circularOfId = existingNodeWithValue.id
        return false
      }
      iteratedValues.set(node.value, node)
    }
    return true
  },
  shouldExpandNode: (node) => {
    return true
  },
  mapChildren(value, type, parent) {
    switch (type) {
      case 'array':
        return value.map((v, i) => [i.toString(), v])
      case 'map':
        const entries = Array.from(value.entries())
        return entries.map(([key, value], i) => [
          \`[map entry \${i}]\`,
          {
            '[key]': key,
            '[value]': value
          }
        ])
      case 'set':
        return Array.from(value.values()).map((v, i) => [\`[set entry \${i}]\`, v])
      case 'object':
        return Object.entries(value)
      default:
        return []
    }
  }
}`,
  valueFormatter: `(val, node) => {
  switch (node.type) {
    case 'array':
      return \u0060\${node.circularOfId ? 'circular' : ''} [] \${val.length} items\u0060
    case 'object':
      return \u0060\${node.circularOfId ? 'circular' : ''} {} \${Object.keys(val).length} keys\u0060
    case 'map':
    case 'set':
      return \u0060\${node.circularOfId ? 'circular' : ''} () \${val.size} entries\u0060
    case 'date':
      return \u0060\${val.toISOString()}\u0060
    case 'string':
      return \u0060"\${val}"\u0060
    case 'boolean':
      return val ? 'true' : 'false'
    case 'symbol':
      return String(val)
    default:
      return val
  }
}`,
  theme: `{
  scheme: 'monokai',
  base00: '#363755', // main blue bg
  base01: '#604D49',
  base02: '#6D5A55',
  base03: '#D1929B', // red text
  base04: '#B79F8D',
  base05: '#F9F8F2',
  base06: '#F7F4F1',
  base07: '#FAF8F5',
  base08: '#FA3E7E', // purple (null, undefined)
  base09: '#FD993C', // orange (number, boolean)
  base0A: '#F6BF81',
  base0B: '#B8E248', // main green text
  base0C: '#B4EFE4',
  base0D: '#85D9EF', // main blue text
  base0E: '#BE87FF',
  base0F: '#D6724C'
}`
}
const testNode = {
  id: '[1]',
  index: 0,
  key: `test`,
  value: [1, 2, 3],
  depth: 0,
  collapsed: false,
  type: 'array',
  path: [],
  parentId: null,
  circularOfId: null,
  children: []
}

export const options = writable(DEFAULT_OPTIONS)
export const parsedData = writable<any>(example1)
export const parsedRecursionOpts = writable(
  parser.parseRecursionOpts(DEFAULT_OPTIONS.recursionOpts, testNode)
)
export const parsedValueFormatter = writable(
  parser.parseValueFormatter(DEFAULT_OPTIONS.valueFormatter, testNode)
)
export const parsedTheme = writable(parser.parseTheme(DEFAULT_OPTIONS.theme))

export function update<K extends keyof FormState>(key: K, val: FormState[K]) {
  options.update(o => {
    o[key] = val
    return o
  })
  if (key === 'data') {
    parsedData.update(old => parser.parseData(val) ?? old)
  } else if (key === 'recursionOpts') {
    parsedRecursionOpts.update(old => parser.parseRecursionOpts(val, testNode) ?? old)
  } else if (key === 'valueFormatter') {
    parsedValueFormatter.update(old => parser.parseValueFormatter(val, testNode) ?? old)
  } else if (key === 'theme') {
    parsedTheme.update(old => parser.parseTheme(val) ?? old)
  }
}
