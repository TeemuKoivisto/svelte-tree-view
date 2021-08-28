<script lang="ts">
  import { setContext, onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { recurseObjectProperties } from './tree-utils.ts'
  import {
    createPropsStore, rootElementStore, treeStore, treeMapStore
  } from './stores/index.ts'

  import TreeNode from './TreeNode.svelte'

  export let data,
    theme = undefined,
    showLogButton = false,
    showCopyButton = false,
    valueComponent = undefined,
    recursionOpts = {},
    valueFormatter = undefined

  let rootElement: HTMLElement | null = null
  const defaultRecursionOpts = {
    maxDepth: 10,
    omitKeys: [],
    stopRecursion: false,
    shouldExpandNode: () => false
  }
  let props = {
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
      props.recursionOpts.shouldExpandNode !== nodeRecursionOpts.shouldExpandNode
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
      Object.keys(theme).forEach(key => {
        rootElement.style.setProperty(`--tree-view-${key}`, theme[key])
      })
    }
  }

  const propsStore = createPropsStore(props)
  setContext('svelte-tree-view', {
    propsStore,
    rootElementStore,
    treeStore,
    treeMapStore
  })

  onMount(() => {
    rootElementStore.set(rootElement)
  })
</script>

<section class={$$props.class} bind:this={rootElement}>
  {#each $treeStore.children as child}
    <TreeNode id={child.id} />
  {/each}
</section>

<style>
  * {
    box-sizing: border-box;
  }
  :root {
    --tree-view-base00: #363755;
    --tree-view-base01: #604D49;
    --tree-view-base02: #6D5A55;
    --tree-view-base03: #D1929B;
    --tree-view-base04: #B79F8D;
    --tree-view-base05: #F9F8F2;
    --tree-view-base06: #F7F4F1;
    --tree-view-base07: #FAF8F5;
    --tree-view-base08: #FA3E7E;
    --tree-view-base09: #FD993C;
    --tree-view-base0A: #F6BF81;
    --tree-view-base0B: #B8E248;
    --tree-view-base0C: #B4EFE4;
    --tree-view-base0D: #85D9EF;
    --tree-view-base0E: #BE87FF;
    --tree-view-base0F: #D6724C;

    --tree-view-left-indent: 0.875em;
    --tree-view-li-line-height: 1.1;
    --tree-view-li-colon-space: 0.3em;
  }
  section {
    background: var(--tree-view-base00);
    font-family: var(--tree-view-font-family, 'Helvetica Neue', 'Calibri Light', Roboto, sans-serif);
    font-size: var(--tree-view-font-size, 12px);
    height: max-content;
    width: max-content;
  }
</style>
