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
  recomputeRange?: {
    from: number
    to: number
    remainingDepth: number
    scannedAtDepths: Map<string, number>
  }
  // recomputeToDepths?: Map<string, number>
  /** When true, nodes beyond maxDepth are created/updated but their existing children are preserved */
  preserveChildrenBeyondMaxDepth?: boolean
}

export function getChildren(value: any, type: ValueType): [string, any][] {
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
  maxDepth: number,
  ensureNotCollapsed: boolean,
  parent: TreeNode | null,
  ctx: RecursionContext
): TreeNode | null {
  // if (ctx.opts.omitKeys?.includes(key)) {
  if (ctx.opts.omitKeys?.includes(key) || (ctx.opts.maxDepth && depth > ctx.opts.maxDepth)) {
    return null
  }
  // if at maxDepth && ctx.remcomputeRange -> continue
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

  const prevDepth = ctx.recomputeRange?.scannedAtDepths.get(node.id)
  // || node.depth >= maxDepth
  if (prevDepth && prevDepth >= node.depth) {
    // Terminate early incase the node was already recursed at enough depth
    return node
  } else if (ctx.recomputeRange) {
    // We are tracking node depths to limit our scan range to only recompute what's needed
    // const remainingDepth = Math.max(ctx.recomputeRange.to - node.depth, 0)
    ctx.recomputeRange.scannedAtDepths.set(node.id, maxDepth)
  }

  // Save old children before recursion overwrites them (copy to avoid proxy issues)
  const prevChildren = oldNode ? [...node.children] : []

  if (shouldRecurseChildren(node, parent, ctx.iteratedValues, ctx.opts)) {
    const mappedChildren =
      ctx.opts.mapChildren && ctx.opts.mapChildren(value, getValueType(value), node)
    const children = mappedChildren ?? getChildren(value, getValueType(value))
    const ids: string[] = []
    for (let i = 0; i < children.length; i += 1) {
      const [key, val] = children[i]
      if (ctx.recomputeRange) {
        ctx.recomputeRange.remainingDepth -= 1
      }
      const child = recurseObjectProperties(i, key, val, depth + 1, maxDepth, false, node, ctx)
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

export function recomputeNodeChildrenToDepth(ids: string[], ctx: RecursionContext, depth = -1) {
  const maxDepth = depth === -1 ? (ctx.opts.maxDepth ?? 16) : depth
  const refreshedAt = new Map<string, number>()
  const toDelete = new Set<string>()
  const usedIds = new Set<string>()

  function refreshNode(node: TreeNode, remainingDepth: number) {
    const prevDepth = refreshedAt.get(node.id)
    if (prevDepth !== undefined && prevDepth >= remainingDepth) {
      // Already recursed to the max depth allowed
      return
    } else if (remainingDepth <= 0) {
      console.warn(
        `refreshNodeChildren: maxDepth ${maxDepth} reached at node "${node.id}" (depth ${node.depth}). Children beyond this point may be stale.`
      )
      return
    }
    refreshedAt.set(node.id, remainingDepth)

    const value = node.getValue()
    const type = getValueType(value)
    node.type = type

    const mappedChildren = ctx.opts.mapChildren && ctx.opts.mapChildren(value, type, node)
    const childEntries = mappedChildren ?? getChildren(value, type)

    const prevChildren = [...node.children]
    const newChildIds: string[] = []

    for (let i = 0; i < childEntries.length; i++) {
      const [key, val] = childEntries[i]
      const [child, oldChild] = createNode(
        i,
        key,
        val,
        node.depth + 1,
        node,
        ctx.treeMap,
        ctx.updateNodeValue,
        ctx.opts.getNodeId,
        usedIds
      )
      if (!oldChild && ctx.opts.shouldExpandNode) {
        child.collapsed = !ctx.opts.shouldExpandNode(child)
      }
      ctx.treeMap[child.id] = child
      newChildIds.push(child.id)

      refreshNode(child, remainingDepth - 1)
    }

    node.children = newChildIds

    for (const childId of prevChildren) {
      if (!newChildIds.includes(childId)) {
        const child = ctx.treeMap[childId]
        if (!child || child.parentId === node.id) {
          toDelete.add(childId)
        }
      }
    }
  }

  for (const id of ids) {
    const node = ctx.treeMap[id]
    if (!node) continue
    // Max depth is relative as node.depth + given depth OR maxDepth - node's current depth
    const maxDepth = depth === -1 ? (ctx.opts.maxDepth ?? 16) : node.depth + depth
    refreshNode(node, maxDepth)
  }

  for (const id of toDelete) {
    deleteNodeAndDescendants(id, ctx.treeMap)
  }
}
