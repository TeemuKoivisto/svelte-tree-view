<script lang="ts">
  import { getContext, onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { createNode, recurseObjectProperties, getValueType } from './tree-utils.ts'
  import { createContext } from './context.ts'

  import TreeNode from './TreeNode.svelte'

  export let data,
    theme = undefined,
    leftIndent = 4,
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
    leftIndent,
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
      leftIndent,
      showLogButton,
      showCopyButton,
      valueComponent,
      valueFormatter,
      recursionOpts: props.recursionOpts
    }
    // todo update props inside context?
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

  createContext(props)
  const { treeMapStore, treeStore, rootElementStore } = getContext('app')

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
    /* --string-color: var(--tree-view-string-color, #cb3f41);
    --symbol-color: var(--tree-view-symbol-color, #cb3f41);
    --boolean-color: var(--tree-view-boolean-color, #112aa7);
    --function-color: var(--tree-view-function-color, #112aa7);
    --number-color: var(--tree-view-number-color, #3029cf);
    --label-color: var(--tree-view-label-color, #871d8f);
    --arrow-color: var(--tree-view-arrow-color, #727272);
    --null-color: var(--tree-view-null-color, #8d8d8d);
    --undefined-color: var(--tree-view-undefined-color, #8d8d8d);
    --date-color: var(--tree-view-date-color, #8d8d8d); */

    --li-identation: var(--tree-view-li-indentation, 1em);
    --li-line-height: var(--tree-view-li-line-height, 1.1);
    --li-colon-space: 0.3em;
  }
  section {
    background: var(--tree-view-base00);
    font-family: var(--tree-view-font-family, 'Helvetica Neue', 'Calibri Light', Roboto, sans-serif);
    font-size: var(--tree-view-font-size, 12px);
    height: max-content;
    width: max-content;
  }
</style>
