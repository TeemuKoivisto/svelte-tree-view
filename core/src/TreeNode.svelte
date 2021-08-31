<script lang="ts">
  import { getContext } from 'svelte'
  import type { Stores } from './stores'
  import type { ITreeNode } from './types'

  export let id: string

  const { treeMapStore, propsStore, rootElementStore } = getContext<Stores>('svelte-tree-view')
  // Should explode rather than have logic written to check for undefinedness.
  // As this compoennt should be unmounted if it's undefined.
  $: node = $treeMapStore.get(id) as ITreeNode
  $: hasChildren = node && node.children.length > 0
  $: valueComponent = $propsStore.valueComponent

  treeMapStore.subscribe(value => {
    const n = value.get(id)
    if (n && node !== n) {
      node = n
    }
  })

  function handleLogNode() {
    console.info('%c [svelte-tree-view]: Property added to window._node', 'color: #b8e248')
    console.log(node.value)
    window._node = node.value
  }
  function handleCopyNodeToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(node.value))
  }
  function handleToggleCollapse() {
    if (hasChildren) {
      treeMapStore.toggleCollapse(node.id)
    } else if (node.circularOfId) {
      treeMapStore.expandAllNodesToNode(node.circularOfId)
      $rootElementStore.querySelector(`li[data-tree-id="${node.circularOfId}"]`)?.scrollIntoView()
    }
  }
</script>

<li class="row" class:collapsed={node.collapsed && hasChildren} data-tree-id={node.id}>
  {#if hasChildren}
    <button
      class={`arrow-btn ${node.collapsed ? 'collapsed' : ''}`}
      on:click={handleToggleCollapse}
    >
      ▶
    </button>
  {/if}
  <div
    class="node-key"
    class:has-children={hasChildren}
    class:p-left={!hasChildren}
    on:click={handleToggleCollapse}
  >
    {node.key}:
  </div>
  <div
    class="node-value"
    data-type={node.type}
    class:expanded={!node.collapsed && hasChildren}
    class:has-children={hasChildren}
    on:click={handleToggleCollapse}
  >
    {#if valueComponent}
      <svelte:component
        this={valueComponent}
        value={node.value}
        {node}
        defaultFormatter={val => propsStore.formatValue(val, node)}
      />
    {:else}
      {propsStore.formatValue(node.value, node)}
    {/if}
  </div>
  <div class="buttons">
    {#if $propsStore.showLogButton}
      <button class="log-copy-button" on:click={handleLogNode}>log</button>
    {/if}
    {#if $propsStore.showCopyButton}
      <button class="log-copy-button" on:click={handleCopyNodeToClipboard}>copy</button>
    {/if}
  </div>
</li>
{#if !node.collapsed && hasChildren}
  <li class="row">
    <ul>
      {#each node.children as child}
        <svelte:self id={child.id} />
      {/each}
    </ul>
  </li>
{/if}

<style lang="scss">
  ul {
    display: flex;
    flex-direction: column;
    height: max-content;
    list-style: none;
    padding: 0;
    padding-left: var(--tree-view-left-indent);
    margin: 0;
    width: 100%;
  }
  li {
    align-items: baseline;
    display: flex;
    height: max-content;
    line-height: var(--tree-view-line-height);
    list-style: none;
    width: 100%;
    /* &.collapsed {
      margin-bottom: 0.3em;
    } */
  }
  li + li {
    margin-top: 0.25em;
  }
  .empty-block {
    visibility: hidden;
  }
  .node-key {
    color: var(--tree-view-base0D);
    margin-right: var(--tree-view-key-margin-right);
    &.has-children {
      cursor: pointer;
    }
    &.p-left {
      padding-left: 1.1em;
    }
  }
  .node-value {
    color: var(--tree-view-base0B);
    margin-right: 0.5em;
    word-break: break-all;
    &[data-type='number'] {
      color: var(--tree-view-base09);
    }
    &[data-type='null'],
    &[data-type='undefined'] {
      color: var(--tree-view-base08);
    }
    &.expanded {
      color: var(--tree-view-base03);
    }
    &.has-children {
      cursor: pointer;
    }
  }
  .arrow-btn {
    background: transparent;
    border: 0;
    color: var(--tree-view-base0D);
    cursor: pointer;
    margin-right: 0.5em;
    padding: 0;
    transition: all 150ms ease 0s;
    transform: rotateZ(0deg);
    transform-origin: 45% 50%;
    position: relative;
    line-height: 1.1em;
    font-size: 0.75em;
    &.collapsed {
      transform: rotateZ(90deg);
    }
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
  }
  .log-copy-button {
    background: transparent;
    border: 0;
    color: var(--tree-view-base0D);
    cursor: pointer;
    margin: 0;
    padding: 0 0.5em;
    &:hover {
      background: rgba(rgb(255, 162, 177), 0.4);
      border-radius: 2px;
      color: var(--tree-view-base07);
    }
  }
</style>
