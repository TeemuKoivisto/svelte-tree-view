declare global {
  interface Window {
    _node?: any
  }
}

export * from './types'
export { default as DefaultNode } from './DefaultNode.svelte'
export { default as TreeView } from './TreeView.svelte'
export { default } from './TreeView.svelte'
