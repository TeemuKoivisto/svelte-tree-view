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
    update,
    setExampleData
  } from '$lib/store'

  onMount(() => {
    setExampleData('tailwind')
    parsedRecursionOpts.set({
      shouldExpandNode: () => true
    })
  })
</script>

<div class="flex flex-col">
  <div class="p-4">
    <TreeView
      data={$parsedData}
      showLogButton={$state.showLogButton}
      showCopyButton={$state.showCopyButton}
      recursionOpts={$parsedRecursionOpts}
      valueFormatter={$parsedValueFormatter}
      theme={$parsedTheme}
    >
      {#snippet treeNode(props)}
        <TailwindNode {...props} />
      {/snippet}
    </TreeView>
  </div>

  <div class="demo-info">
    <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">How it works:</h3>
    <ul class="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
      <li>
        When collapsed, objects show a preview like: <code
          class="rounded bg-gray-100 px-1 dark:bg-gray-700">object with keys</code
        >
      </li>
      <li>
        When collapsed, arrays show a preview like: <code
          class="rounded bg-gray-100 px-1 dark:bg-gray-700">[ 1, 2, 3, ... ]</code
        >
      </li>
      <li>When expanded, full details are displayed as normal</li>
      <li>Strings longer than 10 characters are truncated with "..."</li>
      <li>Nested objects are shown as "object" in previews</li>
    </ul>
  </div>
</div>

<style lang="postcss">
  @reference "#app.css";

  .demo-info {
    @apply mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800;
  }
</style>
