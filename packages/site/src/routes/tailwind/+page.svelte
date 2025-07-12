<script lang="ts">
  import { onMount } from 'svelte'
  import { TreeView } from 'svelte-tree-view'
  import TailwindNode from '$components/TailwindNode.svelte'

  import {
    state,
    parsedData,
    parsedRecursionOpts,
    parsedTheme,
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
  showLogButton={$state.showLogButton}
  showCopyButton={$state.showCopyButton}
  recursionOpts={$parsedRecursionOpts}
  valueFormatter={$parsedValueFormatter}
  theme={$parsedTheme}
>
  {#snippet rootNode(children)}
    <div class="svelte-tree-view w-1/2 px-4 text-sm">
      {@render children()}
    </div>
  {/snippet}
  {#snippet treeNode(props)}
    <TailwindNode {...props} />
  {/snippet}
</TreeView>

<style lang="postcss">
</style>
