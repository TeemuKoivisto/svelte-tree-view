<script lang="ts">
  import TreeView from 'svelte-tree-view'
  import type { Base16Theme, TreeNode, ValueComponent } from 'svelte-tree-view'
  import PropsForm from '../components/PropsForm.svelte'
  import DiffValue from '../components/DiffValue.svelte'

  import { mapDocDeltaChildren } from '../mapDocDeltaChildren'

  import example1 from './example1.json'
  import example2 from './example2.json'
  import { generateObj } from '../generateObj'

  const placeholder = `Eg. {"a": 1, "b": [1,2,3]}`
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
  const defaultRecursionOpts = `{
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
}`
  const defaultValueFormatter = `(val, node) => {
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
}`
  const defaultTheme = `{
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
  let data = '',
    parsedData: { [key: string]: any } = example1,
    leftIndent = '0.875em',
    lineHeight = '1.1',
    fontFamily = 'Helvetica Neue',
    fontSize = '13px',
    keyMarginRight = '0.5em',
    showLogButton = false,
    showCopyButton = false,
    valueComponent: ValueComponent | undefined = undefined,
    recursionOpts = defaultRecursionOpts,
    parsedRecursionOpts: Record<string, unknown> | undefined = undefined,
    valueFormatter = defaultValueFormatter,
    parsedValueFormatter: (val: any, n: TreeNode) => string | undefined = undefined,
    theme = defaultTheme,
    parsedTheme: Base16Theme | undefined = undefined

  $: {
    if (data) {
      try {
        parsedData = new Function(`return ${data}`)()
      } catch (e) {}
    }
  }
  $: {
    if (typeof document !== undefined) {
      try {
        leftIndent &&
          document.documentElement.style.setProperty(`--tree-view-left-indent`, leftIndent)
        lineHeight &&
          document.documentElement.style.setProperty(`--tree-view-li-line-height`, lineHeight)
        fontFamily &&
          document.documentElement.style.setProperty(`--tree-view-font-family`, fontFamily)
        fontSize && document.documentElement.style.setProperty(`--tree-view-font-size`, fontSize)
        keyMarginRight &&
          document.documentElement.style.setProperty(`--tree-view-key-margin-right`, keyMarginRight)
      } catch (e) {}
    }
  }
  $: {
    try {
      let parsed = new Function(`return ${recursionOpts}`)()
      if (typeof parsed === 'object') {
        parsed.isCircularNode(testNode, new Map())
        parsed.shouldExpandNode(testNode)
        parsed.mapChildren([], 'array', testNode)
        parsedRecursionOpts = parsed
      }
    } catch (e) {}
  }
  $: {
    try {
      let parsed = new Function(`return ${valueFormatter}`)()
      if (typeof parsed === 'function') {
        parsed(testNode.value, testNode)
        parsedValueFormatter = parsed
      }
    } catch (e) {}
  }
  $: {
    if (theme) {
      try {
        parsedTheme = new Function(`return ${theme}`)()
        Object.keys(parsedTheme).forEach(key => {
          document.documentElement.style.setProperty(`--tree-view-${key}`, parsedTheme[key])
        })
      } catch (e) {}
    }
  }

  function handleExampleClick(example: 1 | 2 | 3) {
    switch (example) {
      case 1:
        parsedData = example1
        valueComponent = undefined
        if (parsedRecursionOpts?.mapChildren === mapDocDeltaChildren) {
          parsedRecursionOpts.mapChildren = undefined
        }
        break
      case 2:
        parsedData = example2
        valueComponent = DiffValue
        if (parsedRecursionOpts) {
          parsedRecursionOpts.mapChildren = mapDocDeltaChildren
          parsedRecursionOpts.shouldExpandNode = () => true
        } else {
          parsedRecursionOpts = {
            mapChildren: mapDocDeltaChildren,
            shouldExpandNode: () => true
          }
        }
        break
      case 3:
        parsedData = generateObj(0, 4)
        valueComponent = undefined
        if (parsedRecursionOpts && parsedRecursionOpts.mapChildren === mapDocDeltaChildren) {
          parsedRecursionOpts.mapChildren = undefined
        }
        parsedRecursionOpts.stopCircularRecursion = true
    }
  }
</script>

<section class="p-4 m-auto lg:container md:p-16 md:pt-8 xs:p-8 rounded-2xl">
  <h1 class="my-3 text-5xl font-bold flex items-center">
    <a target="_blank" rel="noopener" href="https://github.com/teemukoivisto/svelte-tree-view"
      >svelte-tree-view</a
    >
  </h1>
  <p class="my-2">Copy-paste JSON objects to view them.</p>
  <PropsForm
    bind:leftIndent
    bind:lineHeight
    bind:fontFamily
    bind:fontSize
    bind:keyMarginRight
    bind:showLogButton
    bind:showCopyButton
    bind:recursionOpts
    bind:valueFormatter
    bind:theme
  />
  <div class="my-4">
    <button class="btn" data-test="btn-1" on:click={() => handleExampleClick(1)}>Example 1</button>
    <button class="btn ml-2" data-test="btn-2" on:click={() => handleExampleClick(2)}
      >Example 2</button
    >
    <button class="btn ml-2" data-test="btn-3" on:click={() => handleExampleClick(3)}
      >Example 3</button
    >
  </div>
  <div class="flex tree-wrapper">
    <textarea
      class="w-1/2 bg-06 text-00 placeholder-gray-500 p-2 border"
      data-test="input-textarea"
      bind:value={data}
      {placeholder}
    />
    <TreeView
      data={parsedData}
      {showLogButton}
      {showCopyButton}
      {valueComponent}
      recursionOpts={parsedRecursionOpts}
      valueFormatter={parsedValueFormatter}
      theme={parsedTheme}
    />
  </div>
</section>

<style>
  .tree-wrapper > :global(.svelte-tree-view) {
    @apply w-1/2 px-4;
  }
</style>
