<script lang="ts">
  import { setContext, untrack } from 'svelte'
  import { get } from 'svelte/store'

  import RootNode from './RootNode.svelte'
  import { createPropsStore, createRootElementStore, createTreeStore } from './stores'

  import type { HTMLAttributes } from 'svelte/elements'
  import type { Stores } from './stores'
  import type { TreeViewProps } from './types'

  type Props = TreeViewProps & HTMLAttributes<HTMLElement>

  const DEFAULT_RECURSION_OPTS = {
    maxDepth: 16,
    omitKeys: [],
    stopCircularRecursion: false,
    shouldExpandNode: () => false
  }

  let {
    data,
    theme,
    showLogButton,
    showCopyButton,
    valueComponent,
    recursionOpts,
    valueFormatter,
    ...rest
  }: Props = $props()

  let propsObj: Omit<TreeViewProps, 'data'> = {
    showLogButton,
    showCopyButton,
    valueComponent,
    recursionOpts: { ...DEFAULT_RECURSION_OPTS, ...recursionOpts },
    valueFormatter,
    restProps: rest
  }
  const propsStore = createPropsStore(propsObj)
  const rootElementStore = createRootElementStore()
  const treeStore = createTreeStore(propsStore)
  const newRecOpts = $derived({ ...DEFAULT_RECURSION_OPTS, ...recursionOpts })

  setContext<Stores>('svelte-tree-view', {
    propsStore,
    rootElementStore,
    treeStore
  })

  $effect(() => {
    // To keep things less messy all props are joined to one object _except_ the recursionOpts
    // which is picked from the old props. This is to allow checking between the old and new recursionOpts
    // in the recomputeTree.
    propsObj = {
      showLogButton,
      showCopyButton,
      valueComponent,
      recursionOpts: propsObj.recursionOpts,
      valueFormatter,
      restProps: rest
    }
    propsStore.setProps(propsObj)
  })

  $effect(() => {
    const oldRecOptions = get(propsStore.recursionOpts)
    // console.log('recursionOpts effect! oldRecOpts', oldRecOptions)
    const opts = { ...newRecOpts }
    const newData = data
    const shouldRecompute = oldRecOptions?.shouldExpandNode !== opts.shouldExpandNode
    // console.log(`newRecOpts ${shouldRecompute}`, opts)
    // Use untrack to prevent triggering this effect again
    untrack(() => {
      treeStore.update(newData, opts, shouldRecompute)
      propsStore.setProps(propsObj)
      propsObj.recursionOpts = opts
    })
  })

  // $effect(() => {
  //   const newRecOpts = untrack(() => recursionOpts)
  //   treeStore.update(
  //     untrack(() => data),
  //     newRecOpts,
  //     $currentRecOpts?.shouldExpandNode !== newRecOpts.shouldExpandNode
  //   )
  // })
</script>

<RootNode />
