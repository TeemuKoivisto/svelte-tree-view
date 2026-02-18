<script lang="ts">
  import { onMount } from 'svelte'
  import { TreeView } from 'svelte-tree-view'
  import TailwindNode from '$components/TailwindNode.svelte'

  import {
    treeOpts,
    parsedData,
    parsedRecursionOpts,
    parsedValueFormatter,
    setExampleData
  } from '$lib/store'

  onMount(() => {
    setExampleData('tailwind')
    parsedRecursionOpts.set({
      shouldExpandNode: () => true
    })
  })
</script>

<TreeView
  data={$parsedData}
  showLogButton={$treeOpts.showLogButton}
  showCopyButton={$treeOpts.showCopyButton}
  recursionOpts={$parsedRecursionOpts}
  valueFormatter={$parsedValueFormatter}
>
  {#snippet rootNode(children)}
    <div class="svelte-tree-view w-1/2 px-4 text-sm" role="tree">
      {@render children()}
    </div>
  {/snippet}
  {#snippet treeNode(props)}
    <TailwindNode {...props} />
  {/snippet}
</TreeView>

<style lang="postcss">
</style>
