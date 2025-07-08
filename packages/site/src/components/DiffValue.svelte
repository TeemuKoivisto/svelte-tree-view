<script lang="ts">
  import type { TreeNode } from 'svelte-tree-view'

  interface Props {
    node: TreeNode
    defaultFormatter?: (val: any) => string
  }

  let { node, defaultFormatter }: Props = $props()

  let value = $derived(node.value)
  let formatter = $derived(defaultFormatter || ((val: any) => String(val)))

  function replaceSpacesWithNonBreakingSpace(value: string) {
    return value.replace(/\s/gm, ' ')
  }
  function parseTextDiff(textDiff: string) {
    const diffByLines = textDiff.split(/\n/gm).slice(1)
    return diffByLines.map(line => {
      const type = line.startsWith('-') ? 'delete' : line.startsWith('+') ? 'add' : 'raw'

      return { [type]: replaceSpacesWithNonBreakingSpace(line.substr(1)) }
    })
  }
  function stringifyAndShrink(v: any) {
    if (v === null) {
      return 'null'
    }
    const str = JSON.stringify(v)
    if (typeof str === 'undefined') {
      return 'undefined'
    }
    return str.length > 22 ? `${str.substr(0, 15)}…${str.substr(-5)}` : str
  }

  function getValueString(raw: any) {
    if (typeof raw === 'string') {
      return raw
    }
    return stringifyAndShrink(raw)
  }
</script>

{#if Array.isArray(value)}
  <!-- The why https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md -->
  {#if value.length === 1}
    <span class="added">{getValueString(value[0])}</span>
  {:else if value.length === 2}
    <span class="updated">
      <span class="deleted">{getValueString(value[0])}</span>
      <span class="arrow"> =&gt;</span>
      <span class="added">{getValueString(value[1])}</span>
    </span>
  {:else if value.length === 3 && value[1] === 0 && value[2] === 0}
    <span class="deleted">{getValueString(value[0])}</span>
  {:else if value.length === 3 && value[2] === 2}
    <span class="updated">
      {#each parseTextDiff(value[0]) as item}
        {#if item.delete}
          <span class="deleted">{item.delete}</span>
        {:else if item.add}
          <span class="added">{item.add}</span>
        {:else}
          <span>{item.raw}</span>
        {/if}
      {/each}
    </span>
  {/if}
{:else}
  {formatter(value)}
{/if}

<style lang="postcss">
  @reference "#app.css";

  .added {
    display: inline-block;
    background: #87cc86;
    border-radius: 1px;
    color: #008000;
    padding: 1px 2px;
    text-indent: 0;
    min-height: 1ex;
  }
  .deleted {
    display: inline-block;
    background: #d66363;
    border-radius: 1px;
    color: #e2e2e2;
    padding: 1px 2px;
    text-decoration: line-through;
    text-indent: 0;
    min-height: 1ex;
  }
  .updated {
    word-break: break-all;
  }
  .updated .added {
    background: #eaea37;
  }
  .arrow {
    color: #87cc86;
  }
</style>
