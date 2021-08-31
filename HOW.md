# How it works

The way `svelte-tree-view` works is it iterates over each object's key-value pair, often using the index as the key (or in the case of Maps, create [key, value] pairs) and renders the value as it is for primitives (string, number, undefined) or as a summary of the object's contents eg `{} 7 keys`. Each node receives as its unique ID the stringified path to it eg `[0,1,4,0,1]` which is quite handy compared to generating an uuid that may or may have to be recomputed each time data changes.

The node's values are mapped over to generate a list of children that are basically `[string, any]` tuples. Each of these key-value pairs correspond to their respective TreeNodes. The mapping of the children can be defined by the user.

To prevent unnecessary rendering, the tree is generated only to the nodes that are shown. Expanding more nodes then iterates over them as usual. You can additionally prevent recursing over circular nodes and instead a `circular` tag is added to the node and clicking them scrolls the viewport the first encountered node with that value (the checking of circularity is done with `val1 === val2` comparison).

Both the rendering of the keys and the values can be user-defined. For values a custom Svelte component can also be provided that can perform complicated rendering instead of a simple string. An example here:

```tsx
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
  {defaultFormatter(value)}
{/if}
```

This should be the general gist of it. I hope the source code is quite easy to grasp and to extend for any future improvements and so forth. Svelte is quite a great match for creating snappy UI components since it comes batteries included and you don't have to depend on some external framework as a dependency. Perhaps one day they can be turned into real web components but in any case, it's quite awesome already.