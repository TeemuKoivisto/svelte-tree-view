<script lang="ts">
  import { base } from '$app/paths'
  import TreeView, { DefaultNode, type Base16Theme } from 'svelte-tree-view'
  import PropsForm from '../components/PropsForm.svelte'
  import DiffValue from '../components/DiffValue.svelte'

  import example1 from '../utils/example1.json'
  import example2 from '../utils/example2.json'
  import { mapDocDeltaChildren } from '../utils/mapDocDeltaChildren'
  import { generateObj } from '../utils/generateObj'
  import {
    state,
    parsedData,
    parsedRecursionOpts,
    parsedTheme,
    parsedValueFormatter,
    update
  } from '../utils/store'

  let leftIndent = $derived($state.leftIndent)
  let lineHeight = $derived($state.lineHeight)
  let fontFamily = $derived($state.fontFamily)
  let fontSize = $derived($state.fontSize)
  let keyMarginRight = $derived($state.keyMarginRight)

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

  function handleExampleClick(example: 1 | 2 | 3) {
    switch (example) {
      case 1:
        parsedData.set(example1)
        update('valueComponent', undefined)
        parsedRecursionOpts.update(v => {
          if (v?.mapChildren === mapDocDeltaChildren) {
            v.mapChildren = undefined
          }
          return v
        })
        break
      case 2:
        parsedData.set(example2)
        update('valueComponent', DiffValue)
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
        break
      case 3:
        parsedData.set(generateObj(0, 4))
        update('valueComponent', undefined)
        parsedRecursionOpts.update(v => {
          if (v && v.mapChildren === mapDocDeltaChildren) {
            v.mapChildren = undefined
          }
          if (v) {
            v.stopCircularRecursion = true
          }
          return v
        })
    }
  }
</script>

<!-- TODO static adapter wont use base path correctly if this is in app.html -->
<svelte:head>
  <link rel="icon" href={`${base}/favicon.png`} />
</svelte:head>

<section class="xs:p-8 m-auto rounded-2xl p-4 lg:container md:p-16 md:pt-8">
  <h1 class="my-3 flex items-center text-5xl font-bold">
    <a
      target="_blank"
      rel="noopener noreferrer"
      href="https://github.com/teemukoivisto/svelte-tree-view">svelte-tree-view</a
    >
  </h1>
  <p class="my-2">Copy-paste JSON objects to view them.</p>
  <PropsForm />
  <div class="my-4">
    <button class="btn" data-test-id="btn-1" onclick={() => handleExampleClick(1)}>Example 1</button
    >
    <button class="btn ml-2" data-test-id="btn-2" onclick={() => handleExampleClick(2)}
      >Example 2</button
    >
    <button class="btn ml-2" data-test-id="btn-3" onclick={() => handleExampleClick(3)}
      >Example 3</button
    >
  </div>
  <div class="tree-wrapper flex">
    <textarea
      class="bg-06 text-00 w-1/2 border p-2 placeholder-gray-500"
      data-test-id="input-textarea"
      value={$state.data}
      placeholder={`Eg. {"a": 1, "b": [1,2,3]}`}
      oninput={e => update('data', e.currentTarget.value)}
    ></textarea>
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
      {#snippet treeNode(props)}
        {#if $state.valueComponent}
          <DiffValue {...props} />
        {:else}
          <DefaultNode {...props} />
        {/if}
      {/snippet}
    </TreeView>
  </div>
</section>

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
