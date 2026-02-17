<script lang="ts">
  import { getContext } from 'svelte'

  import TreeViewNode from './TreeViewNode.svelte'

  import type { TreeStore } from './store'

  interface Props {
    id: string
  }

  let { id }: Props = $props()

  const { treeMap, viewProps } = getContext<TreeStore>('svelte-tree-view')
  let nodeProps = $derived({
    node: treeMap[id],
    TreeViewNode,
    getTreeContext: () => getContext<TreeStore>('svelte-tree-view')
  })
</script>

{@render $viewProps.treeNode(nodeProps)}
