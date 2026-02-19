import { createNode, getValueType } from './tree-node.svelte'
import { getChildren, recurseObjectProperties } from './tree-recursion'
import type { TreeNode, TreeRecursionOpts, TreeViewProps } from './types'

export function formatValue(
  val: any,
  node: TreeNode,
  valueFormatter?: TreeViewProps['valueFormatter']
): string {
  const customFormat = valueFormatter ? valueFormatter(val, node) : undefined
  if (customFormat) {
    return customFormat
  }
  switch (node.type) {
    case 'array':
      return `${node.circularOfId ? 'circular' : ''} [] ${val.length} items`
    case 'object':
      return `${node.circularOfId ? 'circular' : ''} {} ${Object.keys(val).length} keys`
    case 'map':
    case 'set':
      return `${node.circularOfId ? 'circular' : ''} () ${val.size} entries`
    case 'date':
      return `${val.toISOString()}`
    case 'regexp':
      return `${val}`
    case 'error':
      return `${val.name}: ${val.message}`
    case 'string':
      return `"${val}"`
    case 'number':
    case 'boolean':
    case 'symbol':
      return String(val)
    default:
      return node.type
  }
}

export function buildTree(
  data: unknown,
  rootNode: TreeNode,
  treeMap: Record<string, TreeNode>,
  iteratedValues: Map<any, TreeNode>,
  recursionOpts: TreeRecursionOpts<any>,
  recomputeExpandNode: boolean
) {
  iteratedValues.clear()
  const oldIds = new Set(Object.keys(treeMap))
  recurseObjectProperties(rootNode.index, rootNode.key, data, rootNode.depth, true, null, {
    treeMap,
    oldIds,
    iteratedValues,
    recomputeExpandNode,
    updateNodeValue: (id, newValue) => updateNodeValue(id, newValue, treeMap, iteratedValues),
    opts: recursionOpts,
    usedIds: new Set<string>()
  })
  for (const id of oldIds) {
    delete treeMap[id]
  }
}

function deleteNodeAndDescendants(id: string, treeMap: Record<string, TreeNode>) {
  const node = treeMap[id]
  if (!node) return
  for (const childId of node.children) {
    deleteNodeAndDescendants(childId, treeMap)
  }
  delete treeMap[id]
}

export function expandNodeChildren(
  node: TreeNode,
  treeMap: Record<string, TreeNode>,
  iteratedValues: Map<any, TreeNode>,
  recursionOpts: TreeRecursionOpts
) {
  const parent = treeMap[node.parentId || '']
  if (!parent) {
    // Only root node has no parent and it should not be expandable
    throw Error('No parent in expandNodeChildren for node: ' + JSON.stringify(node))
  }
  const oldIds = new Set<string>()
  recurseObjectProperties(
    node.index,
    node.key,
    node.getValue(),
    node.depth,
    !node.collapsed, // Ensure that when uncollapsed the node's children are always recursed
    parent,
    {
      treeMap,
      oldIds,
      iteratedValues,
      // Never recompute shouldExpandNode since it may override the collapsing of this node
      recomputeExpandNode: false,
      updateNodeValue: (id, newValue) => updateNodeValue(id, newValue, treeMap, iteratedValues),
      opts: recursionOpts,
      usedIds: new Set<string>()
    }
  )
  for (const id of oldIds) {
    deleteNodeAndDescendants(id, treeMap)
  }
}

export function expandAllNodesToNode(id: string, treeMap: Record<string, TreeNode>) {
  function recurseNodeUpwards(node?: TreeNode | null) {
    if (!node) return
    treeMap[node.id]!.collapsed = false
    if (node.parentId) {
      recurseNodeUpwards(treeMap[node.parentId])
    }
  }
  recurseNodeUpwards(treeMap[id])
}

export function updateNodeValue(
  id: string,
  newValue: any,
  treeMap: Record<string, TreeNode>,
  iteratedValues: Map<any, TreeNode>
) {
  const node = treeMap[id]
  const oldValue = node.getValue()
  node.getValue = () => newValue
  node.type = getValueType(newValue)
  iteratedValues.delete(oldValue)
}

export function refreshNodeChildren(
  ids: string[],
  treeMap: Record<string, TreeNode>,
  iteratedValues: Map<any, TreeNode>,
  recursionOpts: TreeRecursionOpts,
  depth = -1
) {
  const maxDepth = depth === -1 ? (recursionOpts.maxDepth ?? 16) : depth
  const refreshed = new Set<string>()
  const toDelete = new Set<string>()
  const usedIds = new Set<string>()
  const _updateNodeValue = (id: string, newValue: any) =>
    updateNodeValue(id, newValue, treeMap, iteratedValues)

  function refreshNode(node: TreeNode, remainingDepth: number) {
    if (refreshed.has(node.id)) return
    if (remainingDepth <= 0) {
      console.warn(
        `refreshNodeChildren: maxDepth ${maxDepth} reached at node "${node.id}" (depth ${node.depth}). Children beyond this point may be stale.`
      )
      return
    }
    refreshed.add(node.id)

    const value = node.getValue()
    const type = getValueType(value)
    node.type = type

    const mappedChildren = recursionOpts.mapChildren && recursionOpts.mapChildren(value, type, node)
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
        treeMap,
        _updateNodeValue,
        recursionOpts.getNodeId,
        usedIds
      )
      if (!oldChild && recursionOpts.shouldExpandNode) {
        child.collapsed = !recursionOpts.shouldExpandNode(child)
      }
      treeMap[child.id] = child
      newChildIds.push(child.id)

      refreshNode(child, remainingDepth - 1)
    }

    node.children = newChildIds

    for (const childId of prevChildren) {
      if (!newChildIds.includes(childId)) {
        const child = treeMap[childId]
        if (!child || child.parentId === node.id) {
          toDelete.add(childId)
        }
      }
    }
  }

  for (const id of ids) {
    const node = treeMap[id]
    if (node) refreshNode(node, maxDepth)
  }

  for (const id of toDelete) {
    deleteNodeAndDescendants(id, treeMap)
  }
}
