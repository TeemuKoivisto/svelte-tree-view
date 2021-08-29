import { get, writable } from 'svelte/store'

export const createRootElementStore = () => {
  const rootElementStore = writable<HTMLElement | null>(null)

  return {
		set: rootElementStore.set,
		subscribe: rootElementStore.subscribe,
  }
}
