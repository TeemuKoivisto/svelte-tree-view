<script lang="ts">
  import { getContext } from 'svelte'

  import TreeViewNode from './TreeViewNode.svelte'

  import type { TreeStore } from './store.svelte'

  interface Props {
    id: string
  }

  let { id }: Props = $props()

  const { rootElement, treeMap, viewProps, ...rest } = getContext<TreeStore>('svelte-tree-view')
  let node = $derived(treeMap[id])
  let hasChildren = $derived(node.children.length > 0)
  let nodeProps = $derived({
    node,
    getTreeContext: () => getContext<TreeStore>('svelte-tree-view'),
    TreeViewNode: TreeViewNode,
    handleLogNode() {
      console.info('%c [svelte-tree-view]: Property added to window._node', 'color: #b8e248')
      console.log(node.getValue())
      try {
        if (typeof window !== 'undefined') window._node = node.getValue()
      } catch (err) {
        console.error('Failed to set _node, window was undefined')
      }
    },
    handleCopyNodeToClipboard() {
      try {
        navigator.clipboard.writeText(JSON.stringify(node.getValue()))
      } catch (err) {
        console.error('Copying node to clipboard failed: ', err)
      }
    },
    handleToggleCollapse() {
      if (hasChildren) {
        rest.toggleCollapse(node.id)
      } else if (node.circularOfId) {
        rest.expandAllNodesToNode(node.circularOfId)
        $rootElement?.querySelector(`li[data-tree-id="${node.circularOfId}"]`)?.scrollIntoView()
      }
    }
  })
</script>

{@render $viewProps.treeNode(nodeProps)}
