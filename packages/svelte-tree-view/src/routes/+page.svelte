<script lang="ts">
  import TreeView from '../lib'
  import DefaultNode from '../lib/DefaultNode.svelte'
</script>

<div>
  <main>
    <h1>svelte-tree-view</h1>
    <TreeView
      data={{
        a: [1, 2, 3],
        b: new Map([
          ['c', { d: null }],
          ['e', { f: [9, 8, 7] }]
        ])
      }}
      recursionOpts={{
        maxDepth: 4
      }}
    >
      {#snippet treeNode(props)}
        <DefaultNode {...props} />
      {/snippet}
    </TreeView>
  </main>
</div>
