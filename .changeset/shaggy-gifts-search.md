---
'svelte-tree-view': major
---

migrate to Svelte 5, update all deps, switch valueComponent to snippet

BREAKING:

- incompatible with Svelte < 5
- `valueComponent` is now `treeNode` snippet
- `rootNode` snippet added
- default styles not applied to `:root` anymore but `ul.svelte-tree-view`
- changed `treeMap` from `Map` to `Record` to allow use of proxies
