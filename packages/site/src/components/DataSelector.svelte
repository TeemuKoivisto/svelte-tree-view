<script lang="ts">
  import { DATA, treeOpts, setExampleData } from '$lib/store'
</script>

<div class="mt-2 flex items-center gap-2">
  <label for="data-selector" class="control-label">Example Data:</label>
  <div>
    <select
      id="data-selector"
      value={$treeOpts.selectedData}
      oninput={e => setExampleData(e.currentTarget.value as keyof typeof DATA)}
      class="control-select"
    >
      {#each Object.keys(DATA) as opt}
        <option value={opt}>{opt}</option>
      {/each}
    </select>
  </div>
</div>

<style lang="postcss">
  @reference "#app.css";

  .control-label {
    @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
  }

  .control-select {
    @apply w-full rounded-md border border-gray-300 bg-white px-3 py-0.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400;
  }
</style>
