import { recurseObjectProperties } from './tree-recursion'
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
    opts: recursionOpts,
    usedIds: new Set<string>()
  })
  for (const id of oldIds) {
    delete treeMap[id]
  }
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
  recurseObjectProperties(
    node.index,
    node.key,
    node.getValue(),
    node.depth,
    !node.collapsed, // Ensure that when uncollapsed the node's children are always recursed
    parent,
    {
      treeMap,
      oldIds: new Set(),
      iteratedValues,
      recomputeExpandNode: false, // Never recompute shouldExpandNode since it may override the collapsing of this node
      opts: recursionOpts,
      usedIds: new Set<string>()
    }
  )
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
