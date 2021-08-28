<script>
  import TreeView from 'svelte-tree-view'
  import PropsForm from '../components/PropsForm.svelte'
  import obj1 from './obj1.json'

  const placeholder = `Eg. {"a": 1, "b": [1,2,3]}`
  let data = '',
    parsedData = obj1,
    leftIndent = '0.875em',
    showLogButton = false,
    showCopyButton = false,
    valueComponent = undefined,
    recursionOpts = {
      shouldExpandNode: () => true,
    },
    valueFormatter = undefined,
    theme = undefined,
    parsedTheme = undefined

  $: {
    if (data) {
      try {
        parsedData = new Function(`return ${data}`)()
      } catch (e) {}
    }
  }
  $: {
    if (leftIndent && typeof document !== undefined) {
      try {
        document.documentElement.style.setProperty(`--tree-view-left-indent`, leftIndent)
      } catch (e) {}
    }
  }
  $: {
    if (theme) {
      try {
        parsedTheme = new Function(`return ${theme}`)()
        Object.keys(parsedTheme).forEach(key => {
          document.documentElement.style.setProperty(`--tree-view-${key}`, parsedTheme[key])
        })
      } catch (e) {}
    }
  }
</script>

<section class="p-4 m-auto text-container md:p-16 md:pt-8 xs:p-8 rounded-2xl">
  <h1 class="my-3 text-5xl font-bold flex items-center">
    <a target="_blank" href="https://github.com/teemukoivisto/svelte-tree-view">svelte-tree-view</a>
  </h1>
  <p class="my-2">Copy-paste JSON objects to view them.</p>
  <PropsForm
    bind:leftIndent={leftIndent}
    bind:showLogButton={showLogButton}
    bind:showCopyButton={showCopyButton}
    bind:valueComponent={valueComponent}
    bind:recursionOpts={recursionOpts}
    bind:valueFormatter={valueFormatter}
    bind:theme={theme}
  />
  <div class="my-4">
    <button class="btn" on:click={() => (parsedData = obj1)}>Example 1</button>
  </div>
  <div class="flex">
    <textarea class="w-1/2 bg-0C text-01 p-2 border" bind:value={data} {placeholder} />
    <TreeView
      class="tree-view w-1/2 px-4"
      data={parsedData}
      showLogButton={showLogButton}
      showCopyButton={showCopyButton}
      valueComponent={valueComponent}
      recursionOpts={recursionOpts}
      valueFormatter={valueFormatter}
      theme={parsedTheme}
    />
  </div>
</section>

<style>
  :global(.tree-view) {
    width: 50% !important;
  }
</style>
