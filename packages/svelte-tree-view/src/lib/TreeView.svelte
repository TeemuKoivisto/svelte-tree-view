<script lang="ts">
  import { onMount, setContext, untrack } from 'svelte'
  import { get } from 'svelte/store'

  import TreeViewNode from './TreeViewNode.svelte'
  import { createPropsStore, createRootElementStore, createTreeStore } from './stores'

  import type { Stores } from './stores'
  import type { Props, TreeViewProps } from './types'

  const DEFAULT_RECURSION_OPTS = {
    maxDepth: 16,
    omitKeys: [],
    stopCircularRecursion: false,
    shouldExpandNode: () => false
  }

  let {
    data,
    rootNode,
    treeNode,
    theme,
    showLogButton,
    showCopyButton,
    recursionOpts,
    valueFormatter,
    onUpdate,
    ...rest
  }: Props = $props()

  let propsObj: Omit<TreeViewProps, 'data'> = {
    treeNode,
    theme,
    showLogButton,
    showCopyButton,
    recursionOpts: { ...DEFAULT_RECURSION_OPTS, ...recursionOpts },
    valueFormatter,
    onUpdate
  }
  let rootElement: HTMLElement
  const propsStore = createPropsStore(propsObj)
  const rootElementStore = createRootElementStore()
  const treeStore = createTreeStore(propsStore)
  const newRecOpts = $derived({ ...DEFAULT_RECURSION_OPTS, ...recursionOpts })
  // const treeChildren = $derived(treeStore.treeMap['[]']?.children)
  const tree = treeStore.tree

  setContext<Stores>('svelte-tree-view', {
    propsStore,
    rootElementStore,
    treeStore
  })

  onMount(() => {
    rootElementStore.set(rootElement)
  })

  $effect(() => {
    // To keep things less messy all props are joined to one object _except_ the recursionOpts
    // which is picked from the old props. This is to allow checking between the old and new recursionOpts
    // in the recomputeTree.
    propsObj = {
      treeNode,
      showLogButton,
      showCopyButton,
      recursionOpts: propsObj.recursionOpts,
      valueFormatter,
      onUpdate
    }
    propsStore.setProps(propsObj)
  })

  $effect(() => {
    const oldRecOptions = get(propsStore.recursionOpts)
    // Destruct recursionOpts to unwrap from proxy
    const opts = { ...newRecOpts }
    const newData = data
    const shouldRecompute = oldRecOptions?.shouldExpandNode !== opts.shouldExpandNode
    // Use untrack to prevent triggering this effect again
    untrack(() => {
      treeStore.update(newData, opts, shouldRecompute)
      propsStore.setProps(propsObj)
      propsObj.recursionOpts = opts
    })
  })

  $effect(() => {
    for (const key in theme) {
      const value = theme[key as keyof typeof theme]
      if (rootElement && key.includes('base') && value) {
        rootElement.style.setProperty(`--tree-view-${key}`, value)
      }
    }
  })
</script>

{#snippet children()}
  {#each $tree.children as id}
    <TreeViewNode {id} />
  {/each}
{/snippet}

{#if rootNode}
  {@render rootNode(children)}
{:else}
  <ul {...rest} class={`${rest.class || ''} svelte-tree-view`} bind:this={rootElement}>
    {@render children()}
  </ul>
{/if}

<style>
  ul.svelte-tree-view {
    background: var(--tree-view-base00);
    font-family: var(--tree-view-font-family);
    font-size: var(--tree-view-font-size);
    height: max-content;
    list-style: none;
    margin: 0;
    padding: 0;
    width: max-content;

    --tree-view-font-family: 'Helvetica Neue', 'Calibri Light', Roboto, sans-serif;
    --tree-view-font-size: 13px;
    --tree-view-left-indent: 0.875em;
    --tree-view-line-height: 1.1;
    --tree-view-key-margin-right: 0.5em;
  }
</style>
