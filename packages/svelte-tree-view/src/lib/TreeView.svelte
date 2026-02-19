<script module lang="ts">
  export const DEFAULT_RECURSION_OPTS: TreeRecursionOpts = {
    maxDepth: 16,
    omitKeys: [],
    stopCircularRecursion: false,
    shouldExpandNode: () => false
  }
</script>

<script lang="ts">
  import { onMount, setContext, untrack } from 'svelte'
  import { get } from 'svelte/store'

  import TreeViewNode from './TreeViewNode.svelte'
  import { createStore, type TreeStore } from './store'

  import type { TreeRecursionOpts, TreeViewElementProps } from './types'

  let {
    data,
    rootNode,
    treeNode,
    recursionOpts,
    valueFormatter,
    onUpdate,
    ...rest
  }: TreeViewElementProps = $props()

  let propsObj = {
    treeNode,
    recursionOpts: { ...DEFAULT_RECURSION_OPTS, ...recursionOpts },
    valueFormatter,
    onUpdate
  }
  let rootElement: HTMLElement
  const store = createStore(propsObj)
  const newRecOpts = $derived({ ...DEFAULT_RECURSION_OPTS, ...recursionOpts })
  const treeChildren = $derived(store.rootNode.children)

  setContext<TreeStore>('svelte-tree-view', store)

  onMount(() => {
    store.setRootElement(rootElement)
  })

  $effect(() => {
    // To keep things less messy all props are joined to one object _except_ the recursionOpts
    // which is picked from the old props. This is to allow checking between the old and new recursionOpts
    // in the recomputeTree.
    propsObj = {
      treeNode,
      recursionOpts: propsObj.recursionOpts,
      valueFormatter,
      onUpdate
    }
    store.setProps(propsObj)
  })

  $effect(() => {
    const oldRecOptions = get(store.recursionOpts)
    // Destruct recursionOpts to unwrap from proxy
    const opts = { ...newRecOpts }
    const newData = data
    const recomputeExpandNode = oldRecOptions?.shouldExpandNode !== opts.shouldExpandNode
    // Use untrack to prevent triggering this effect again
    untrack(() => {
      store.createTree(newData, opts, recomputeExpandNode)
      store.setProps(propsObj)
      propsObj.recursionOpts = opts
    })
  })
</script>

{#snippet children()}
  {#each treeChildren as id}
    <TreeViewNode {id} />
  {/each}
{/snippet}

{#if rootNode}
  {@render rootNode(children)}
{:else}
  <ul {...rest} class={`svelte-tree-view ${rest.class || ''}`} role="tree" bind:this={rootElement}>
    {@render children()}
  </ul>
{/if}
