<script lang="ts">
  import { onMount } from 'svelte'
  import TreeView from 'svelte-tree-view'
  import DefaultNode from 'svelte-tree-view/DefaultNode.svelte'

  import { mapDocDeltaChildren } from '$lib/mapDocDeltaChildren'
  import {
    treeOpts,
    parsedData,
    parsedRecursionOpts,
    parsedValueFormatter,
    setExampleData
  } from '$lib/store'

  onMount(() => {
    setExampleData('circular')
    parsedRecursionOpts.update(v => {
      if (v && v.mapChildren === mapDocDeltaChildren) {
        v.mapChildren = undefined
      }
      if (v) {
        v.stopCircularRecursion = true
      }
      return v
    })
  })
</script>

<TreeView
  data={$parsedData}
  showLogButton={$treeOpts.showLogButton}
  showCopyButton={$treeOpts.showCopyButton}
  recursionOpts={$parsedRecursionOpts}
  valueFormatter={$parsedValueFormatter}
  class="w-1/2 bg-(--tree-view-base00) px-4"
>
  {#snippet treeNode(props)}
    <DefaultNode {...props} />
  {/snippet}
</TreeView>

<style lang="postcss">
  @reference "#app.css";
</style>
