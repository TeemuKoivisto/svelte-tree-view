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
    TreeViewNode: TreeViewNode,
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
</script>

{#if $propsObj.customNode}
  {@render $propsObj.customNode(nodeProps)}
{:else}
  <DefaultNode {...nodeProps} />
{/if}
