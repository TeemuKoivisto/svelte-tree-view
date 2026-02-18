<script lang="ts">
  import TreeView from '../TreeView.svelte'
  import DefaultNode from '../DefaultNode.svelte'

  import type { TreeViewProps } from '../types'
  import type { HTMLAttributes } from 'svelte/elements'

  interface TestProps extends TreeViewProps, HTMLAttributes<HTMLUListElement> {
    showLogButton?: boolean
    showCopyButton?: boolean
  }

  let { showLogButton, showCopyButton, ...props }: TestProps = $props()
</script>

<TreeView {...props}>
  {#snippet treeNode(nodeProps)}
    <DefaultNode {...nodeProps} {showLogButton} {showCopyButton} />
  {/snippet}
</TreeView>
