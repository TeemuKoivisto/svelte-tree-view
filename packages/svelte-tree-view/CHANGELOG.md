# svelte-tree-view

## 2.0.0

### Major Changes

- ef98d90: migrate to Svelte 5, update all deps, switch valueComponent to snippet

  BREAKING:
  - incompatible with Svelte < 5
  - `valueComponent` is now `treeNode` snippet
  - `rootNode` snippet added
  - default styles not applied to `:root` anymore but `ul.svelte-tree-view`
  - changed `treeMap` from `Map` to `Record` to allow use of proxies

### Minor Changes

- 2571374: make treeNode required, update site to use new API
- 8d6dc20: move showCopy & showLogButton to DefaultNode, add regexp & error types
- 92ed815: move base16 theming, utility methods from core to DefaultNode export, refactor internal logic
- c911f1e: use user defined / stable ids for nodes to better handle dragn drop
- f1a0f8c: invert isCircularNode return value for node collapsing, make DefaultNode ESM export, refactor stores into one
- 05b33fc: move default root styles to default.css, use css layer for importing it in site

### Patch Changes

- 05b33fc: improve aria of DefaultNode.svelte, nest children ul within same li
- 6f67518: perf: remove $derived from TreeViewNode, expose createStore, update comments
- 5d204c8: update all dependencies to latest

## 1.4.2

### Patch Changes

- 0559625: fix: set css variables with :root

## 1.4.1

### Patch Changes

- 5d28a68: refactor: remove '**tests**' from npm distribution

## 1.4.0

### Minor Changes

- 34f49d9: refactor: update deps, svelte-package flow

### Patch Changes

- 34f49d9: chore: update deps, switch types.ts comments to jsdoc format

## 1.3.3

### Patch Changes

- b8b7ad7: fix: update deps, switch from rollup to vite, remove install script

## 1.3.2

### Patch Changes

- 6b14678: fix(a11y): add role=presentation to non-interactive clickable divs

## 1.3.1

### Patch Changes

- b20e9d9: refactor: migrate to pnpm
- b20e9d9: style: run prettier & lint
- 7048d12: fix: install script, missing jest-dom package, switch rollup ts library
