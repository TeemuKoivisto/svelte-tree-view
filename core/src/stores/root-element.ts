import { get, writable } from 'svelte/store'

export const rootElementStore = (() => {
  const rootElementStore = writable<HTMLElement | null>(null)

  return {
		set: rootElementStore.set,
		subscribe: rootElementStore.subscribe,
  }
})()
