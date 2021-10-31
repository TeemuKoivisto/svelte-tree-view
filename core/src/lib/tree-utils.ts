import type { TreeNode, TreeRecursionOpts, ValueType } from './types'

export function createNode(
  index: number,
  key: string,
  value: any,
  depth: number,
  parent: TreeNode | null
): TreeNode {
  const path = parent ? [...parent.path, index] : []
  return {
    id: `[${path.join(',')}]`,
    index,
    key,
    value,
    depth,
    collapsed: true,
    type: getValueType(value),
    path,
    parentId: parent ? parent.id : null,
    circularOfId: null,
    children: []
  }
}

export function getValueType(value: any): ValueType {
  if (Array.isArray(value)) {
    return 'array'
  } else if (value instanceof Map) {
    return 'map'
  } else if (value instanceof Set) {
    return 'set'
  } else if (value instanceof Date) {
    return 'date'
  } else if (value === null) {
    return 'null'
  } else {
    return typeof value
  }
}

// From redux-dev-tools
// case 'Object':
//   case 'Error':
//   case 'Array':
//   case 'Iterable':
//   case 'Map':
//   case 'Set':
//   case 'MapEntry':
//   case 'Number':
//     return undefined;
//   case 'String':
//     return raw => `"${raw}"`;
//   case 'Boolean':
//     return raw => (raw ? 'true' : 'false');
//   case 'Date':
//     return raw => raw.toISOString();
//   case 'Null':
//     return () => 'null';
//   case 'Undefined':
//     return () => 'undefined';
//   case 'Function':
//   case 'Symbol':
// export function objType(obj: any) {
//   const type = Object.prototype.toString.call(obj).slice(8, -1)
//   if (type === 'Object') {
//     if (typeof obj[Symbol.iterator] === 'function') {
//       return 'Iterable'
//     }
//     return obj.constructor.name
//   }
//   return type
// }

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
    return opts.isCircularNode(node, iteratedValues)
  } else if (node.type === 'object' || node.type === 'array') {
    const existingNodeWithValue = iteratedValues.get(node.value)
    if (existingNodeWithValue && node.id !== existingNodeWithValue.id) {
      node.circularOfId = existingNodeWithValue.id
      return false
    }
    iteratedValues.set(node.value, node)
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
  treeMap: Map<string, TreeNode>,
  oldTreeMap: Map<string, TreeNode>,
  iteratedValues: Map<any, TreeNode>,
  recomputeExpandNode: boolean,
  opts: TreeRecursionOpts
): TreeNode | null {
  if (opts.omitKeys?.includes(key) || (opts.maxDepth && depth > opts.maxDepth)) {
    return null
  }
  const node = createNode(index, key, value, depth, parent)
  const oldNode = oldTreeMap.get(node.id)
  if (ensureNotCollapsed) {
    // Used to ensure that either root node is always uncollapsed or when uncollapsing new nodes
    // with expandNodeChildren the node children are recursed (if applicable) with mapChildren
    node.collapsed = false
  } else if (oldNode && !recomputeExpandNode) {
    // Maintain the same expanded/collapsed toggle for a node in this path/id
    // EXCEPT when the shouldExpandNode prop is changed...
    node.collapsed = oldNode.collapsed
  } else if (opts.shouldExpandNode) {
    node.collapsed = !opts.shouldExpandNode(node)
  }

  treeMap.set(node.id, node)

  if (shouldRecurseChildren(node, parent, iteratedValues, opts)) {
    const mappedChildren = opts.mapChildren && opts.mapChildren(value, getValueType(value), node)
    const children = mappedChildren ?? getChildren(value, getValueType(value))
    node.children = children
      .map(([key, val], idx) =>
        recurseObjectProperties(
          idx,
          key,
          val,
          depth + 1,
          false,
          node,
          treeMap,
          oldTreeMap,
          iteratedValues,
          recomputeExpandNode,
          opts
        )
      )
      .filter(n => n !== null) as TreeNode[]
  }

  return node
}

export function recomputeTree(
  data: unknown,
  oldTreeMap: Map<string, TreeNode>,
  recursionOpts: TreeRecursionOpts,
  recomputeExpandNode: boolean
) {
  const treeMap = new Map<string, TreeNode>()
  const iteratedValues = new Map<any, TreeNode>()
  const newTree = recurseObjectProperties(
    -1,
    'root',
    data,
    0,
    true,
    null,
    treeMap,
    oldTreeMap,
    iteratedValues,
    recomputeExpandNode,
    recursionOpts
  )
  return { treeMap, tree: newTree, iteratedValues }
}
