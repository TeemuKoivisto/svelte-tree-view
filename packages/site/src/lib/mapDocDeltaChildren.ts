import type { ValueType } from 'svelte-tree-view'

/**
 * Magic function to transform jsondiffpatch array deltas
 * https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md
 * https://benjamine.github.io/jsondiffpatch/demo/index.html
 */
export function mapDocDeltaChildren(delta: any, type: ValueType) {
  // So due to the way the tree-view works, it will automatically map the children of an array
  // to their own nodes. For diff deltas, however, we want to omit those children and just show
  // a value wrapped with <span> to show either deleted or inserted content
  if (type === 'array' && delta[1] === 0 && delta[2] === 0) {
    // Remove operation is defined by two 0s in its delta [{ <deleted> }, 0, 0]
    return []
    // } else if (type === 'array' && typeof delta[0] === 'string' && typeof delta[1] === 'number' && delta[2] === 3) {
    // Move operation is almost the same as remove, except its value is empty and the second number
    // points to the moved index eg ["", 6, 3] AND the third value is always '3'
    // But since these seem to never occur (and they weren't handled in the previous version) we are not doing anything
    // with them for now.
  } else if (type === 'array' && typeof delta[0] === 'string' && delta[1] === 0 && delta[2] === 2) {
    // If a diff between two strings gets too long, a text diff algorithm is used which produces an array
    // with unidiff as the first value, 0 as the second and 2 as third.
    // Eg ["@@ -1,4 +1,9 @@\n-text\n+paragraph\n", 0, 2]
    return []
  } else if (type === 'array' && delta.length === 1 && typeof delta[0] === 'object') {
    // Insert operations do not have indexes (it's already indexed in the array) and carry
    // only an object payload eg [{ <inserted> }]
    return []
  }

  // The main delta objects are objects denoted by key '_t' with 'a' value which we shall omit.
  // DiffValue component handles the text diffs otherwise.
  if (type !== 'object' || delta._t !== 'a') return

  // We shall remap the values to omit '_t' and remove underscores from the keys
  const transformed: [string, any][] = []
  for (const key in delta) {
    if (key === '_t') continue
    // Remove or move operation is indicated by an underscore before the index eg '_2'
    if (key.charAt(0) === '_') {
      transformed.push([key.substr(1), delta[key]])
    } else {
      transformed.push([key, delta[key]])
    }
  }
  return transformed
}
