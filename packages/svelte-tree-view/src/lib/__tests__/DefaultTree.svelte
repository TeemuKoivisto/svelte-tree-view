<script lang="ts">
  import TreeView from '../TreeView.svelte'
  import DefaultNode from '../DefaultNode.svelte'

  import type { Props } from '../types'

  let props: Props = $props()
</script>

<TreeView {...props}>
  {#snippet treeNode(props)}
    <DefaultNode {...props} />
  {/snippet}
</TreeView>
