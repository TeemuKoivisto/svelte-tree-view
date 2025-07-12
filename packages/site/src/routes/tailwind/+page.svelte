<script lang="ts">
  import TailwindNodeDemo from '$components/TailwindNodeDemo.svelte'
</script>

<svelte:head>
  <title>Tailwind Tree Node Demo - svelte-tree-view</title>
</svelte:head>

<div class="tailwind-demo-page">
  <div class="demo-header">
    <h1 class="mb-2 text-4xl font-bold text-gray-800 dark:text-gray-200">Tailwind CSS Tree Node</h1>
    <p class="mb-8 text-lg text-gray-600 dark:text-gray-400">
      A modern, card-based tree view component with Tailwind CSS styling
    </p>
  </div>

  <TailwindNodeDemo />
</div>

<style lang="postcss">
  @reference "#app.css";
  .tailwind-demo-page {
    @apply min-h-screen bg-gray-100 py-8 dark:bg-gray-900;
  }

  .demo-header {
    @apply mb-8 text-center;
  }
</style>
