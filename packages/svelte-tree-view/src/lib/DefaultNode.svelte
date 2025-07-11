<script lang="ts">
  import type { NodeProps } from './types'

  let {
    node,
    TreeViewNode,
    getCtx,
    handleLogNode,
    handleCopyNodeToClipboard,
    handleToggleCollapse
  }: NodeProps = $props()
  const { treeStore, propsStore, rootElementStore } = getCtx()
  const { props: propsObj } = propsStore
  let hasChildren = $derived(node && node.children.length > 0)
  let descend = $derived(!node.collapsed && hasChildren)
</script>

<li class="row" class:collapsed={node.collapsed && hasChildren} data-tree-id={node.id}>
  {#if hasChildren}
    <button class={`arrow-btn ${node.collapsed ? 'collapsed' : ''}`} onclick={handleToggleCollapse}>
      ▶
    </button>
  {/if}
  <div
    class="node-key"
    class:has-children={hasChildren}
    class:p-left={!hasChildren}
    onclick={handleToggleCollapse}
    role="presentation"
  >
    {node.key}:
  </div>
  <div
    class="node-value"
    data-type={node.type}
    class:expanded={!node.collapsed && hasChildren}
    class:has-children={hasChildren}
    onclick={handleToggleCollapse}
    role="presentation"
  >
    {$propsObj.valueFormatter?.(node.value, node)}
  </div>
  <div class="buttons">
    {#if $propsObj.showLogButton}
      <button class="log-copy-button" onclick={handleLogNode}>log</button>
    {/if}
    {#if $propsObj.showCopyButton}
      <button class="log-copy-button" onclick={handleCopyNodeToClipboard}>copy</button>
    {/if}
  </div>
</li>
{#if descend}
  <li class="row">
    <ul>
      {#each node.children as child}
        <TreeViewNode id={child.id} />
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
    &[data-type='number'],
    &[data-type='boolean'] {
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
    margin-right: 0.7em;
    padding: 0;
    transition: all 150ms ease 0s;
    transform: rotateZ(90deg);
    transform-origin: 47% 43%;
    position: relative;
    line-height: 1.1em;
    font-size: 0.75em;
    &.collapsed {
      transform: rotateZ(0deg);
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
