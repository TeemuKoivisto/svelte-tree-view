<script lang="ts">
  import { base } from '$app/paths'
  import type { Base16Theme } from 'svelte-tree-view'

  import DataSelector from '$components/DataSelector.svelte'
  import PropsForm from '$components/PropsForm.svelte'
  import { treeOpts, parsedTheme, update } from '$lib/store'

  import '../app.css'

  let { children } = $props()

  let leftIndent = $derived($treeOpts.leftIndent)
  let lineHeight = $derived($treeOpts.lineHeight)
  let fontFamily = $derived($treeOpts.fontFamily)
  let fontSize = $derived($treeOpts.fontSize)
  let keyMarginRight = $derived($treeOpts.keyMarginRight)

  $effect(() => {
    leftIndent && document.documentElement.style.setProperty(`--tree-view-left-indent`, leftIndent)
  })
  $effect(() => {
    lineHeight &&
      document.documentElement.style.setProperty(`--tree-view-li-line-height`, lineHeight)
  })
  $effect(() => {
    fontFamily && document.documentElement.style.setProperty(`--tree-view-font-family`, fontFamily)
  })
  $effect(() => {
    fontSize && document.documentElement.style.setProperty(`--tree-view-font-size`, fontSize)
  })
  $effect(() => {
    keyMarginRight &&
      document.documentElement.style.setProperty(`--tree-view-key-margin-right`, keyMarginRight)
  })
  $effect(() => {
    for (const key of Object.keys($parsedTheme || {})) {
      const val = $parsedTheme[key as keyof Base16Theme]
      if (val) {
        document.documentElement.style.setProperty(`--tree-view-${key}`, val)
      }
    }
  })
</script>

<main>
  <section class="xs:p-8 m-auto rounded-2xl p-4 md:p-16 md:pt-8 lg:container">
    <h1 class="my-3 flex items-center text-5xl font-bold">
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/teemukoivisto/svelte-tree-view">svelte-tree-view</a
      >
    </h1>
    <p class="my-2">Copy-paste JSON objects to view them.</p>
    <PropsForm />
    <DataSelector />
    <div class="my-4">
      <a
        class="btn"
        data-test-id="btn-1"
        href="{base}/"
        data-sveltekit-keepfocus
        data-sveltekit-noscroll>(1) Basic</a
      >
      <a
        class="btn ml-2"
        data-test-id="btn-2"
        href="{base}/diff"
        data-sveltekit-keepfocus
        data-sveltekit-noscroll>(2) Diff</a
      >
      <a
        class="btn ml-2"
        data-test-id="btn-3"
        href="{base}/circular"
        data-sveltekit-keepfocus
        data-sveltekit-noscroll>(3) Circular</a
      >
      <a
        class="btn ml-2"
        data-test-id="btn-3"
        href="{base}/tailwind"
        data-sveltekit-keepfocus
        data-sveltekit-noscroll>(4) Tailwind</a
      >
      <a
        class="btn ml-2"
        data-test-id="btn-3"
        href="{base}/dnd"
        data-sveltekit-keepfocus
        data-sveltekit-noscroll>(4) Dragn drop</a
      >
    </div>
    <div class="tree-wrapper flex">
      <textarea
        class="bg-06 text-00 w-1/2 border p-2 placeholder-gray-500"
        data-test-id="input-textarea"
        value={$treeOpts.data}
        placeholder={`Eg. {"a": 1, "b": [1,2,3]}`}
        oninput={e => update('data', e.currentTarget.value)}
      ></textarea>
      {@render children()}
    </div>
  </section>
</main>
