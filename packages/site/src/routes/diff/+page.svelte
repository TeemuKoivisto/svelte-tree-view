<script lang="ts">
  import { onMount } from 'svelte'
  import TreeView from 'svelte-tree-view'
  import DiffValue from '$components/DiffValue.svelte'

  import { mapDocDeltaChildren } from '$lib/mapDocDeltaChildren'
  import {
    setExampleData,
    treeOpts,
    parsedData,
    parsedRecursionOpts,
    parsedValueFormatter
  } from '$lib/store'

  onMount(() => {
    setExampleData('diff')
    if ($parsedRecursionOpts) {
      parsedRecursionOpts.update(v => {
        v.mapChildren = mapDocDeltaChildren
        v.shouldExpandNode = () => true
        return v
      })
    } else {
      parsedRecursionOpts.set({
        mapChildren: mapDocDeltaChildren,
        shouldExpandNode: () => true
      })
    }
  })
</script>

<TreeView
  data={$parsedData}
  recursionOpts={$parsedRecursionOpts}
  valueFormatter={$parsedValueFormatter}
  class="w-1/2 bg-(--tree-view-base00) px-4"
>
  {#snippet treeNode(props)}
    <DiffValue
      {...props}
      showLogButton={$treeOpts.showLogButton}
      showCopyButton={$treeOpts.showCopyButton}
    />
  {/snippet}
</TreeView>

<style lang="postcss">
  @reference "#app.css";
</style>
