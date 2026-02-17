<script lang="ts">
  import { getContext } from 'svelte'

  import TreeViewNode from './TreeViewNode.svelte'

  import type { TreeStore } from './store'

  interface Props {
    id: string
  }

  let { id }: Props = $props()

  const { rootElement, treeMap, viewProps, ...rest } = getContext<TreeStore>('svelte-tree-view')
  let nodeProps = $derived({
    node: treeMap[id],
    getTreeContext: () => getContext<TreeStore>('svelte-tree-view'),
    TreeViewNode: TreeViewNode,
    handleLogNode() {
      console.log(treeMap[id].getValue())
      try {
        window._node = treeMap[id].getValue()
        console.info('%c [svelte-tree-view]: Property added to window._node', 'color: #b8e248')
      } catch (err) {
        console.error('[svelte-tree-view]: handleLogNode() errored', err)
      }
    },
    handleCopyNodeToClipboard() {
      try {
        navigator.clipboard.writeText(JSON.stringify(treeMap[id].getValue()))
      } catch (err) {
        console.error('[svelte-tree-view]: handleCopyNodeToClipboard() errored', err)
      }
    },
    handleToggleCollapse() {
      if (treeMap[id].children.length > 0) {
        rest.toggleCollapse(treeMap[id].id)
      } else if (treeMap[id].circularOfId) {
        rest.expandAllNodesToNode(treeMap[id].circularOfId)
        $rootElement
          ?.querySelector(`[data-tree-node-id="${treeMap[id].circularOfId}"]`)
          ?.scrollIntoView()
      }
    }
  })
</script>

{@render $viewProps.treeNode(nodeProps)}
