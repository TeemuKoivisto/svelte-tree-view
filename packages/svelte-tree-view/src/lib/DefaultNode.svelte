<script module lang="ts">
  import type { TreeNode } from './types'

  declare global {
    interface Window {
      _node?: any
    }
  }

  export interface Base16Theme {
    scheme?: string
    author?: string
    /** Default Background */
    base00: string
    /** Lighter Background (Used for status bars, line number and folding marks) */
    base01: string
    /** Selection Background */
    base02: string
    /** Comments, Invisibles, Line Highlighting */
    base03: string
    /** Dark Foreground (Used for status bars) */
    base04: string
    /** Default Foreground, Caret, Delimiters, Operators */
    base05: string
    /** Light Foreground (Not often used) */
    base06: string
    /** Light Background (Not often used) */
    base07: string
    /** Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted */
    base08: string
    /** Integers, Boolean, Constants, XML Attributes, Markup Link Url */
    base09: string
    /** Classes, Markup Bold, Search Text Background */
    base0A: string
    /** Strings, Inherited Class, Markup Code, Diff Inserted */
    base0B: string
    /** Support, Regular Expressions, Escape Characters, Markup Quotes */
    base0C: string
    /** Functions, Methods, Attribute IDs, Headings */
    base0D: string
    /** Keywords, Storage, Selector, Markup Italic, Diff Changed */
    base0E: string
    /** Deprecated, Opening/Closing Embedded Language Tags, e.g. <?php ?> */
    base0F: string
  }

  export function applyBase16Theme(element: HTMLElement, theme: Base16Theme) {
    for (const key in theme) {
      const value = theme[key as keyof Base16Theme]
      if (key.startsWith('base') && value) {
        element.style.setProperty(`--tree-view-${key}`, value)
      }
    }
  }

  export function handleLogNode(node: TreeNode) {
    console.log(node.getValue())
    try {
      window._node = node.getValue()
      console.info('%c [svelte-tree-view]: Property added to window._node', 'color: #b8e248')
    } catch (err) {
      console.error('[svelte-tree-view]: handleLogNode() errored', err)
    }
  }

  export function handleCopyNodeToClipboard(node: TreeNode) {
    try {
      navigator.clipboard.writeText(JSON.stringify(node.getValue()))
    } catch (err) {
      console.error('[svelte-tree-view]: handleCopyNodeToClipboard() errored', err)
    }
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { NodeProps } from './types'

  type DefaultNodeProps = NodeProps & {
    showLogButton?: boolean
    showCopyButton?: boolean
    keySnippet?: Snippet<[TreeNode]>
    valueSnippet?: Snippet<[TreeNode]>
  }

  let {
    node,
    showLogButton,
    showCopyButton,
    keySnippet,
    valueSnippet,
    TreeViewNode,
    getTreeContext
  }: DefaultNodeProps = $props()
  const { formatValue, collapseOrScrollIntoCircularNode } = getTreeContext()
  let hasChildren = $derived(node.children.length > 0)
  let descend = $derived(!node.collapsed && hasChildren)
  let valueStr = $derived(formatValue(node.getValue(), node))
  let selected = $state(false)
</script>

<li
  class="row"
  class:collapsed={node.collapsed && hasChildren}
  data-tree-node-id={node.id}
  role="treeitem"
  aria-expanded={hasChildren ? (node.collapsed ? 'false' : 'true') : undefined}
  aria-level={node.depth}
  aria-selected={selected ? 'true' : 'false'}
>
  <div class="row-body">
    {#if hasChildren}
      <button
        class={`arrow-btn ${node.collapsed ? 'collapsed' : ''}`}
        onclick={() => collapseOrScrollIntoCircularNode(node.id)}
        onfocus={() => (selected = true)}
        onblur={() => (selected = false)}
      >
        ▶
      </button>
    {/if}
    <div
      class="node-key"
      class:has-children={hasChildren}
      class:p-left={!hasChildren}
      onclick={() => collapseOrScrollIntoCircularNode(node.id)}
      role="presentation"
    >
      {#if keySnippet}
        {@render keySnippet(node)}
      {:else}
        {node.key}:
      {/if}
    </div>
    <div
      class="node-value"
      data-type={node.type}
      class:expanded={!node.collapsed && hasChildren}
      class:has-children={hasChildren}
      onclick={() => collapseOrScrollIntoCircularNode(node.id)}
      role="presentation"
    >
      {#if valueSnippet}
        {@render valueSnippet(node)}
      {:else}
        {valueStr}
      {/if}
    </div>
    <div class="buttons">
      {#if showLogButton}
        <button class="log-copy-button" onclick={() => handleLogNode(node)}>log</button>
      {/if}
      {#if showCopyButton}
        <button class="log-copy-button" onclick={() => handleCopyNodeToClipboard(node)}>copy</button
        >
      {/if}
    </div>
  </div>
  {#if descend}
    <ul class="row" role="group">
      {#each node.children as id}
        <TreeViewNode {id} />
      {/each}
    </ul>
  {/if}
</li>

<style lang="scss">
  ul {
    display: flex;
    flex-direction: column;
    height: max-content;
    list-style: none;
    padding: 0;
    padding-left: var(--tree-view-left-indent);
    width: 100%;
  }
  li {
    display: flex;
    flex-direction: column;
    height: max-content;
    list-style: none;
    width: 100%;
  }
  .row-body {
    align-items: baseline;
    display: flex;
    line-height: var(--tree-view-line-height);
    width: 100%;
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
