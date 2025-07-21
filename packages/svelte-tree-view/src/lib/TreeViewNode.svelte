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
      console.log(node.getValue())
      try {
        window._node = node.getValue()
        console.info('%c [svelte-tree-view]: Property added to window._node', 'color: #b8e248')
      } catch (err) {
        console.error('[svelte-tree-view]: handleLogNode() errored', err)
      }
    },
    handleCopyNodeToClipboard() {
      try {
        navigator.clipboard.writeText(JSON.stringify(node.getValue()))
      } catch (err) {
        console.error('[svelte-tree-view]: handleCopyNodeToClipboard() errored', err)
      }
    },
    handleToggleCollapse() {
      if (hasChildren) {
        rest.toggleCollapse(node.id)
      } else if (node.circularOfId) {
        rest.expandAllNodesToNode(node.circularOfId)
        $rootElement?.querySelector(`[data-tree-node-id="${node.circularOfId}"]`)?.scrollIntoView()
      }
    }
  })
</script>

{@render $viewProps.treeNode(nodeProps)}
