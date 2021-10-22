<script lang="ts">
  import { setContext, onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { recomputeTree } from './tree-utils'
  import {
    createPropsStore,
    createRootElementStore,
    createTreeStore,
  } from './stores'

  import TreeViewNode from './TreeViewNode.svelte'

  import type { Stores } from './stores'
  import type {
    TreeNode,
    TreeViewProps,
    Base16Theme,
    ValueComponent,
    TreeRecursionOpts
  } from './types'

  export let data: object,
    theme: Base16Theme | undefined = undefined,
    showLogButton = false,
    showCopyButton = false,
    valueComponent: ValueComponent | undefined = undefined,
    recursionOpts: TreeRecursionOpts | undefined = {},
    valueFormatter: ((val: any, n: TreeNode) => string | undefined) | undefined = undefined

  let rootElement: HTMLElement | null = null
  const defaultRecursionOpts: TreeRecursionOpts = {
    maxDepth: 12,
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
  $: rootNode = treeStore.tree
  $: {
    // To keep things less messy all props are joined to one object _except_ the recursionOpts
    // which is picked from the old props. This is to allow checking between the old and new recursionOpts
    // in the recomputeTree.
    props = {
      showLogButton,
      showCopyButton,
      valueComponent,
      valueFormatter,
      recursionOpts: props.recursionOpts
    }
  }
  $: {
    // Combine the defaultProps with the possible new recursion opts
    const newRecursionOpts = {
      ...defaultRecursionOpts,
      ...recursionOpts
    }
    // Compare the old shouldExpandNode option with the possible new shouldExpandNode
    // to know whether to whole tree should be recomputed.
    const recomputeExpandNode =
      props?.recursionOpts?.shouldExpandNode !== newRecursionOpts.shouldExpandNode
    const oldTreeMap = get(treeStore.treeMap)
    const {
      treeMap,
      tree,
      iteratedValues
    } = recomputeTree(data, oldTreeMap, newRecursionOpts, recomputeExpandNode)
    treeStore.init(tree, treeMap, iteratedValues)
    props.recursionOpts = newRecursionOpts
    propsStore.setProps(props)
  }
  $: {
    if (theme && rootElement) {
      let key: keyof typeof theme
      for (key in theme) {
        // This ridiculous thing is for TypeScript type inference. Yey..?
        const value = theme[key]
        if (rootElement && key.includes('--tree-view-base') && value) {
          rootElement.style.setProperty(`--tree-view-${key}`, value)
        }
      }
    }
  }

  const propsStore = createPropsStore(props)
  const rootElementStore = createRootElementStore()
  const treeStore = createTreeStore(propsStore)
  setContext<Stores>('svelte-tree-view', {
    propsStore,
    rootElementStore,
    treeStore,
  })

  onMount(() => {
    rootElementStore.set(rootElement)
  })
</script>

<ul class={`${$$props.class || ''} svelte-tree-view`} bind:this={rootElement}>
  {#each $rootNode.children as child}
    <TreeViewNode id={child.id} />
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
