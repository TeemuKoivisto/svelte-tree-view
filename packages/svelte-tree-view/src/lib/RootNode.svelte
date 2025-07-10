<script lang="ts">
  import { getContext, onMount } from 'svelte'

  import TreeViewNode from './TreeViewNode.svelte'

  import type { Stores } from './stores'

  const { treeStore, propsStore, rootElementStore } = getContext<Stores>('svelte-tree-view')
  let rootNode = treeStore.tree
  let { props: propsObj } = propsStore
  let rootElement: HTMLElement
  let rest = $derived($propsObj.restProps)

  onMount(() => {
    rootElementStore.set(rootElement)
  })

  // $effect(() => {
  //   for (const key in theme) {
  //     const value = theme[key as keyof typeof theme]
  //     if (rootElement && key.includes('base') && value) {
  //       rootElement.style.setProperty(`--tree-view-${key}`, value)
  //     }
  //   }
  // })
</script>

<ul {...rest} class={`${rest.class || ''} svelte-tree-view`} bind:this={rootElement}>
  {#each $rootNode.children as child}
    <TreeViewNode id={child.id} />
  {/each}
</ul>

<style>
  :root {
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
