import { get, writable } from 'svelte/store'

export const createRootElementStore = () => {
  const rootElementStore = writable<any | null>(null)

  return {
		set: rootElementStore.set,
		subscribe: rootElementStore.subscribe,
  }
}
