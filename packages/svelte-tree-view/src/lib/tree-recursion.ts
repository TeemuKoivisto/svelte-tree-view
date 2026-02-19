import { createNode, getValueType } from './tree-node.svelte'
import type { TreeNode, TreeRecursionOpts, ValueType } from './types'

export interface RecursionContext {
  treeMap: Record<string, TreeNode>
  oldIds: Set<string>
  iteratedValues: Map<any, TreeNode>
  recomputeExpandNode: boolean
  opts: TreeRecursionOpts
  updateNodeValue: (id: string, newValue: any) => void
  usedIds: Set<string>
}

function getChildren(value: any, type: ValueType): [string, any][] {
  switch (type) {
    case 'array':
      return value.map((v: any, i: number) => [i.toString(), v])
    case 'map':
      // eslint-disable-next-line no-case-declarations
      const entries: [any, any][] = Array.from(value.entries())
      return entries.map(([key, value], i: number) => [
        `[map entry ${i}]`,
        {
          '[key]': key,
          '[value]': value
        }
      ])
    case 'set':
      return Array.from(value.values()).map((v: any, i: number) => [`[set entry ${i}]`, v])
    case 'object':
      return Object.entries(value)
    default:
      return []
  }
}

function shouldRecurseChildren(
  node: TreeNode,
  parent: TreeNode | null,
  iteratedValues: Map<any, TreeNode>,
  opts: TreeRecursionOpts
) {
  if (!parent) {
    // The root node's children should always be recursed
    return true
  } else if (node.collapsed && parent?.collapsed) {
    // If the node's parent is uncollapsed the node's children should still be recursed
    // in order to compute its value properly eg "{} 4 keys" and to place clickable arrow caret.
    // Only when the node is completely hidden it should not be recursed
    return false
  } else if (!opts.stopCircularRecursion) {
    return true
  } else if (opts.isCircularNode) {
    return !opts.isCircularNode(node, iteratedValues)
  } else if (node.type === 'object' || node.type === 'array') {
    const existingNodeWithValue = iteratedValues.get(node.getValue())
    if (existingNodeWithValue && node.id !== existingNodeWithValue.id) {
      node.circularOfId = existingNodeWithValue.id
      return false
    }
    iteratedValues.set(node.getValue(), node)
  }
  return true
}

export function recurseObjectProperties(
  index: number,
  key: string,
  value: any,
  depth: number,
  ensureNotCollapsed: boolean,
  parent: TreeNode | null,
  ctx: RecursionContext
): TreeNode | null {
  if (ctx.opts.omitKeys?.includes(key) || (ctx.opts.maxDepth && depth > ctx.opts.maxDepth)) {
    return null
  }
  const [node, oldNode] = createNode(
    index,
    key,
    value,
    depth,
    parent,
    ctx.treeMap,
    ctx.updateNodeValue,
    ctx.opts.getNodeId,
    ctx.usedIds
  )
  if (ensureNotCollapsed) {
    // Used to ensure that either root node is always uncollapsed or when uncollapsing new nodes
    // with expandNodeChildren the node children are recursed (if applicable) with mapChildren
    node.collapsed = false
  } else if (oldNode && !ctx.recomputeExpandNode) {
    // Maintain the same expanded/collapsed toggle for a node in this path/id
    // EXCEPT when the shouldExpandNode prop is changed...
    node.collapsed = oldNode.collapsed
  } else if (ctx.opts.shouldExpandNode) {
    node.collapsed = !ctx.opts.shouldExpandNode(node)
  }

  ctx.treeMap[node.id] = node
  ctx.oldIds.delete(node.id)

  // Save old children before recursion overwrites them (copy to avoid proxy issues)
  const prevChildren = oldNode ? [...node.children] : []

  if (shouldRecurseChildren(node, parent, ctx.iteratedValues, ctx.opts)) {
    const mappedChildren =
      ctx.opts.mapChildren && ctx.opts.mapChildren(value, getValueType(value), node)
    const children = mappedChildren ?? getChildren(value, getValueType(value))
    const ids: string[] = []
    for (let i = 0; i < children.length; i += 1) {
      const [key, val] = children[i]
      const child = recurseObjectProperties(i, key, val, depth + 1, false, node, ctx)
      // Child is null if maxDepth reached or it's filtered
      if (child) {
        ids.push(child.id)
      }
    }
    node.children = ids
  } else {
    node.children = []
  }

  // Mark old children that are no longer referenced for cleanup,
  // but only if they haven't been reparented to a different node
  for (const id of prevChildren) {
    if (!node.children.includes(id)) {
      const child = ctx.treeMap[id]
      if (!child || child.parentId === node.id) {
        ctx.oldIds.add(id)
      }
    }
  }

  return node
}
