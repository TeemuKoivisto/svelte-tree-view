import { writable } from 'svelte/store'

export type RootElementStore = ReturnType<typeof createRootElementStore>

export const createRootElementStore = () => {
  const rootElementStore = writable<HTMLElement | null>(null)

  return {
    set: rootElementStore.set,
    subscribe: rootElementStore.subscribe
  }
}
