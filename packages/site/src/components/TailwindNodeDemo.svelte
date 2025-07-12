<script lang="ts">
  import { TreeView } from 'svelte-tree-view'
  import TailwindNode from './TailwindNode.svelte'
  import example1Data from '../utils/example1.json'
  import example2Data from '../utils/example2.json'

  let selectedExample = 'example1'
  let showLogButton = true
  let showCopyButton = true

  const examples = {
    example1: example1Data[0], // Use first item from the array
    example2: example1Data, // Use the full array
    example3: example2Data // Use the diff object
  }

  $: currentData = examples[selectedExample as keyof typeof examples]
</script>

<div class="tailwind-demo">
  <div class="demo-header">
    <h2 class="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
      Tailwind CSS Tree Node Demo
    </h2>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      A modern, card-based tree view component using Tailwind CSS with hover effects, smooth
      transitions, and improved visual hierarchy.
    </p>
  </div>

  <div class="demo-controls">
    <div class="control-group">
      <label class="control-label">Example Data:</label>
      <select bind:value={selectedExample} class="control-select">
        <option value="example1">Example 1 - Complex Object</option>
        <option value="example2">Example 2 - Array with Objects</option>
        <option value="example3">Example 3 - Mixed Types</option>
      </select>
    </div>

    <div class="control-group">
      <label class="control-label">Features:</label>
      <div class="checkbox-group">
        <label class="checkbox-item">
          <input type="checkbox" bind:checked={showLogButton} />
          <span>Show Log Button</span>
        </label>
        <label class="checkbox-item">
          <input type="checkbox" bind:checked={showCopyButton} />
          <span>Show Copy Button</span>
        </label>
      </div>
    </div>
  </div>

  <div class="demo-content">
    <div class="tree-container">
      <TreeView data={currentData} {showLogButton} {showCopyButton} class="tailwind-tree-view">
        {#snippet treeNode(props)}
          <TailwindNode {...props} />
        {/snippet}
      </TreeView>
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "#app.css";
  .tailwind-demo {
    @apply mx-auto max-w-4xl p-6;
  }

  .demo-header {
    @apply mb-8;
  }

  .demo-controls {
    @apply mb-6 rounded-lg border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800;
  }

  .control-group {
    @apply mb-4 last:mb-0;
  }

  .control-label {
    @apply mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300;
  }

  .control-select {
    @apply w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400;
  }

  .checkbox-group {
    @apply flex flex-wrap gap-4;
  }

  .checkbox-item {
    @apply flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300;
  }

  .checkbox-item input[type='checkbox'] {
    @apply h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600;
  }

  .demo-content {
    @apply overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900;
  }

  .tree-container {
    @apply p-4;
  }

  .tailwind-tree-view {
    @apply space-y-1;
  }

  /* Custom scrollbar for the tree container */
  .tree-container::-webkit-scrollbar {
    @apply w-2;
  }

  .tree-container::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-gray-800;
  }

  .tree-container::-webkit-scrollbar-thumb {
    @apply rounded bg-gray-300 dark:bg-gray-600;
  }

  .tree-container::-webkit-scrollbar-thumb:hover {
    @apply dark:bg-gray-1000 bg-gray-400;
  }
</style>
