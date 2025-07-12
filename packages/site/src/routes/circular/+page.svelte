<script lang="ts">
  import { onMount } from 'svelte'
  import TreeView from 'svelte-tree-view'

  import { mapDocDeltaChildren } from '$lib/mapDocDeltaChildren'
  import {
    state,
    parsedData,
    parsedRecursionOpts,
    parsedTheme,
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
  showLogButton={$state.showLogButton}
  showCopyButton={$state.showCopyButton}
  recursionOpts={$parsedRecursionOpts}
  valueFormatter={$parsedValueFormatter}
  theme={$parsedTheme}
>
  {#snippet rootNode(children)}
    <ul class="svelte-tree-view w-1/2 px-4">
      {@render children()}
    </ul>
  {/snippet}
</TreeView>

<style lang="postcss">
  @reference "#app.css";

  .svelte-tree-view {
    background: var(--tree-view-base00);
    font-family: var(--tree-view-font-family);
    font-size: var(--tree-view-font-size);

    --tree-view-font-family: 'Helvetica Neue', 'Calibri Light', Roboto, sans-serif;
    --tree-view-font-size: 13px;
    --tree-view-left-indent: 0.875em;
    --tree-view-line-height: 1.1;
    --tree-view-key-margin-right: 0.5em;
  }
</style>
