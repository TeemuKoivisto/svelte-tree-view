<script lang="ts">
  import { setContext, onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { recurseObjectProperties } from './tree-utils'
  import {
    createPropsStore,
    createRootElementStore,
    createTreeStore,
    createTreeMapStore
  } from './stores'

  import TreeNode from './TreeNode.svelte'

  import type { Stores } from './stores'
  import type {
    ITreeNode,
    TreeViewProps,
    IBase16Theme,
    ValueComponent,
    TreeRecursionOpts
  } from './types'

  export let data: { [key in string | number | symbol]: unknown } | any[] | Map<any, any> | Set<any>,
    theme: IBase16Theme | undefined = undefined,
    showLogButton = false,
    showCopyButton = false,
    valueComponent: ValueComponent | undefined = undefined,
    recursionOpts: TreeRecursionOpts | undefined = {},
    valueFormatter: ((val: any, n: ITreeNode) => string | undefined) | undefined = undefined

  let rootElement: HTMLElement | null = null
  const defaultRecursionOpts: TreeRecursionOpts = {
    maxDepth: 10,
    omitKeys: [],
    stopCircularRecursion: false,
    shouldExpandNode: () => false
  }
  let props: Omit<TreeViewProps, 'data'> = {
    showLogButton,
    showCopyButton,
    valueComponent,
    recursionOpts: {
      ...defaultRecursionOpts,
      ...recursionOpts
    },
    valueFormatter
  }
  $: {
    props = {
      showLogButton,
      showCopyButton,
      valueComponent,
      valueFormatter,
      recursionOpts: props.recursionOpts
    }
    propsStore.set(props)
  }
  $: {
    const nodeRecursionOpts = {
      ...defaultRecursionOpts,
      ...recursionOpts
    }
    const recomputeExpandNode =
      props?.recursionOpts?.shouldExpandNode !== nodeRecursionOpts.shouldExpandNode
    const treeMap = new Map()
    const oldTreeMap = get(treeMapStore)
    const iteratedValues = new Map()
    const newTree = recurseObjectProperties(
      -1,
      'root',
      data,
      -1,
      null,
      treeMap,
      oldTreeMap,
      iteratedValues,
      recomputeExpandNode,
      nodeRecursionOpts
    )
    treeMapStore.set(treeMap)
    treeStore.set(newTree)
    props.recursionOpts = nodeRecursionOpts
  }
  $: {
    if (theme && rootElement) {
      Object.keys(theme).forEach((key: string) => {
        if (rootElement && key.includes('--tree-view-base')) {
          rootElement.style.setProperty(`--tree-view-${key}`, theme[key])
        }
      })
    }
  }

  const propsStore = createPropsStore(props)
  const rootElementStore = createRootElementStore()
  const treeStore = createTreeStore()
  const treeMapStore = createTreeMapStore()
  setContext<Stores>('svelte-tree-view', {
    propsStore,
    rootElementStore,
    treeStore,
    treeMapStore
  })

  onMount(() => {
    rootElementStore.set(rootElement)
  })
</script>

<ul class={$$props.class || ''} bind:this={rootElement}>
  {#each $treeStore.children as child}
    <TreeNode id={child.id} />
  {/each}
</ul>

<style>
  * {
    box-sizing: border-box;
  }
  :root {
    --tree-view-base00: #363755;
    --tree-view-base01: #604d49;
    --tree-view-base02: #6d5a55;
    --tree-view-base03: #d1929b;
    --tree-view-base04: #b79f8d;
    --tree-view-base05: #f9f8f2;
    --tree-view-base06: #f7f4f1;
    --tree-view-base07: #faf8f5;
    --tree-view-base08: #fa3e7e;
    --tree-view-base09: #fd993c;
    --tree-view-base0A: #f6bf81;
    --tree-view-base0B: #b8e248;
    --tree-view-base0C: #b4efe4;
    --tree-view-base0D: #85d9ef;
    --tree-view-base0E: #be87ff;
    --tree-view-base0F: #d6724c;

    --tree-view-font-family: 'Helvetica Neue', 'Calibri Light', Roboto, sans-serif;
    --tree-view-font-size: 13px;
    --tree-view-left-indent: 0.875em;
    --tree-view-line-height: 1.1;
    --tree-view-key-margin-right: 0.5em;
  }
  ul {
    background: var(--tree-view-base00);
    font-family: var(--tree-view-font-family);
    font-size: var(--tree-view-font-size);
    height: max-content;
    list-style: none;
    margin: 0;
    padding: 0;
    width: max-content;
  }
</style>
