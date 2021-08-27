<script>
  import TreeView from 'svelte-tree-view'
  import obj1 from './obj1.json'

  let value = ''
  let parsedJSON = obj1
  const placeholder = `Eg. {"a": 1, "b": [1,2,3]}`
  $: {
    if (value) {
      try {
        parsedJSON = new Function(`return ${value}`)()
      } catch (e) {}
    }
  }
</script>

<section class="p-4 m-auto text-container md:p-16 md:pt-8 xs:p-8 rounded-2xl">
  <h1 class="my-3 text-5xl font-bold flex items-center">
    <a target="_blank" href="https://github.com/teemukoivisto/svelte-tree-view">svelte-tree-view</a>
  </h1>
  <p class="my-2">Copy-paste JSON objects to view them.</p>
  <div class="my-4">
    <button class="btn" on:click={() => (parsedJSON = obj1)}>Example 1</button>
  </div>
  <div class="flex">
    <textarea class="w-1/2 bg-0C text-01 p-2 border" bind:value {placeholder} />
    <TreeView
      class="tree-view w-1/2 px-4"
      data={parsedJSON}
      recursionOpts={{
        shouldExpandNode: () => true,
      }}
    />
  </div>
</section>

<style>
  :global(.tree-view) {
    width: 50% !important;
  }
</style>
