import type { Base16Theme, TreeNode } from 'svelte-tree-view'

export const parseData = (str: string) => {
  try {
    return new Function(`return ${str}`)()
  } catch (e) {}
  return undefined
}

export const parseRecursionOpts = (
  str: string,
  testNode: any
): Record<string, unknown> | undefined => {
  try {
    const parsed = new Function(`return ${str}`)()
    if (parsed && typeof parsed === 'object') {
      parsed.isCircularNode(testNode, new Map())
      parsed.shouldExpandNode(testNode)
      parsed.mapChildren([], 'array', testNode)
      return parsed
    }
  } catch (e) {
    console.log(e)
  }
  return undefined
}

export const parseValueFormatter = (
  str: string,
  testNode: any
): ((val: any, n: TreeNode) => string | undefined) | undefined => {
  try {
    const parsed = new Function(`return ${str}`)()
    if (typeof parsed === 'function') {
      parsed(testNode.getValue(), testNode)
      return parsed
    }
  } catch (e) {
    console.log(e)
  }
  return undefined
}

export const parseTheme = (str: string): Base16Theme | undefined => {
  try {
    return new Function(`return ${str}`)()
  } catch (e) {}
  return undefined
}
