declare global {
  interface Window {
    _node?: any
  }
}

export * from './types'
export { default as TreeView } from './TreeView.svelte'
export { default } from './TreeView.svelte'
export { createStore } from './store'
