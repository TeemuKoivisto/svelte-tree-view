import { TreeView } from 'svelte-tree-view'

const treeView = new TreeView({
  target: document.querySelector('#mount-point') as HTMLElement,
  props: {
    data: {
      a: [1, 2, 3],
      b: new Map([
        ['c', { d: null }],
        ['e', { f: [9, 8, 7] }]
      ])
    },
    recursionOpts: {
      maxDepth: 4
    }
  }
})
