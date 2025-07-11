<script lang="ts">
  import type { NodeProps } from 'svelte-tree-view'

  let {
    node,
    TreeViewNode,
    getTreeContext,
    handleLogNode,
    handleCopyNodeToClipboard,
    handleToggleCollapse
  }: NodeProps = $props()
  const {
    propsStore: { props: propsObj, formatValue }
  } = getTreeContext()
  let hasChildren = $derived(node.children.length > 0)
  let descend = $derived(!node.collapsed && hasChildren)
  let value = $derived(node.value)

  function replaceSpacesWithNonBreakingSpace(value: string) {
    return value.replace(/\s/gm, ' ')
  }
  function parseTextDiff(textDiff: string) {
    const diffByLines = textDiff.split(/\n/gm).slice(1)
    return diffByLines.map(line => {
      const type = line.startsWith('-') ? 'delete' : line.startsWith('+') ? 'add' : 'raw'

      return { [type]: replaceSpacesWithNonBreakingSpace(line.substr(1)) }
    })
  }
  function stringifyAndShrink(v: any) {
    if (v === null) {
      return 'null'
    }
    const str = JSON.stringify(v)
    if (typeof str === 'undefined') {
      return 'undefined'
    }
    return str.length > 22 ? `${str.substr(0, 15)}…${str.substr(-5)}` : str
  }

  function getValueString(raw: any) {
    if (typeof raw === 'string') {
      return raw
    }
    return stringifyAndShrink(raw)
  }
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
    {#if Array.isArray(value)}
      <!-- The why https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md -->
      {#if value.length === 1}
        <span class="added">{getValueString(value[0])}</span>
      {:else if value.length === 2}
        <span class="updated">
          <span class="deleted">{getValueString(value[0])}</span>
          <span class="arrow"> =&gt;</span>
          <span class="added">{getValueString(value[1])}</span>
        </span>
      {:else if value.length === 3 && value[1] === 0 && value[2] === 0}
        <span class="deleted">{getValueString(value[0])}</span>
      {:else if value.length === 3 && value[2] === 2}
        <span class="updated">
          {#each parseTextDiff(value[0]) as item}
            {#if item.delete}
              <span class="deleted">{item.delete}</span>
            {:else if item.add}
              <span class="added">{item.add}</span>
            {:else}
              <span>{item.raw}</span>
            {/if}
          {/each}
        </span>
      {/if}
    {:else}
      {formatValue(value, node)}
    {/if}
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

<style lang="postcss">
  .added {
    display: inline-block;
    background: #87cc86;
    border-radius: 1px;
    color: #008000;
    padding: 1px 2px;
    text-indent: 0;
    min-height: 1ex;
  }
  .deleted {
    display: inline-block;
    background: #d66363;
    border-radius: 1px;
    color: #e2e2e2;
    padding: 1px 2px;
    text-decoration: line-through;
    text-indent: 0;
    min-height: 1ex;
  }
  .updated {
    word-break: break-all;
  }
  .updated .added {
    background: #eaea37;
  }
  .arrow {
    color: #87cc86;
  }

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
