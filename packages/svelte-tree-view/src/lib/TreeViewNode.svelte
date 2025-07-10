<script lang="ts">
  import { getContext, onMount } from 'svelte'
  import { get } from 'svelte/store'

  import DefaultNode from './DefaultNode.svelte'
  import TreeViewNode from './TreeViewNode.svelte'

  import type { Stores } from './stores'
  import type { TreeNode } from './types'

  interface Props {
    id: string
  }

  let { id }: Props = $props()

  const { treeStore, propsStore, rootElementStore } = getContext<Stores>('svelte-tree-view')
  let { props: propsObj } = propsStore
  let node = $state(get(treeStore.treeMap).get(id) as TreeNode<any>)
  let hasChildren = $derived(node && node.children.length > 0)
  let nodeProps = $derived({
    node,
    getCtx: () => getContext<Stores>('svelte-tree-view'),
    // propsObj,
    // children,
    handleLogNode() {
      console.info('%c [svelte-tree-view]: Property added to window._node', 'color: #b8e248')
      console.log(node.value)
      try {
        if (typeof window !== 'undefined') window._node = node.value
      } catch (err) {
        console.error('Failed to set _node, window was undefined')
      }
    },
    handleCopyNodeToClipboard() {
      try {
        navigator.clipboard.writeText(JSON.stringify(node.value))
      } catch (err) {
        console.error('Copying node to clipboard failed: ', err)
      }
    },
    handleToggleCollapse() {
      if (hasChildren) {
        treeStore.toggleCollapse(node.id)
      } else if (node.circularOfId) {
        treeStore.expandAllNodesToNode(node.circularOfId)
        $rootElementStore
          ?.querySelector(`li[data-tree-id="${node.circularOfId}"]`)
          ?.scrollIntoView()
      }
    }
  })

  onMount(() => {
    treeStore.treeMap.subscribe(value => {
      const val = value.get(id) as TreeNode<any>
      if (val) {
        node = val
      }
    })
  })

  // {#snippet button()}
  //   <button
  //     class="hover:bg-gray-200 rounded px-1.5 py-1.5"
  //     onclick={() => {
  //       deleteOpen = !deleteOpen
  //     }}><Trash class="h-4 w-4" /></button
  //   >
  // {/snippet}
</script>

{#if $propsObj.node}
  {@render $propsObj.node(nodeProps)}
{:else}
  <DefaultNode {...nodeProps}>
    {#snippet children({ id })}
      <TreeViewNode {id} />
    {/snippet}
  </DefaultNode>
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
