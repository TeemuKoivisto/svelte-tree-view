import type { TreeNode, ValueType } from './types'

export function getValueType(value: any): ValueType {
  if (Array.isArray(value)) {
    return 'array'
  } else if (value instanceof RegExp) {
    return 'regexp'
  } else if (value instanceof Error) {
    return 'error'
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

export const createRootNode = () => createNode(-1, 'root', [], 0, null, {}, () => {})[0]

export function createNode(
  index: number,
  key: string,
  value: any,
  depth: number,
  parent: TreeNode | null,
  treeMap: Record<string, TreeNode>,
  updateNodeValue: (id: string, val: any) => void,
  getNodeId?: (value: any, key: string, parent: TreeNode) => string,
  usedIds?: Set<string>
): [TreeNode, TreeNode | undefined] {
  const path = parent ? [...parent.path, index] : []
  let id: string
  if (getNodeId && parent) {
    id = getNodeId(value, key, parent)
    if (usedIds?.has(id)) {
      console.error(
        `[svelte-tree-view]: Duplicate node id "${id}" for key "${key}". Falling back to generated id.`
      )
      id = crypto.randomUUID()
    }
  } else {
    id = `[${path.join(',')}]`
  }
  usedIds?.add(id)
  const oldNode = treeMap[id]
  if (oldNode) {
    const sameValue = oldNode.getValue() === value
    oldNode.index = index
    oldNode.key = key
    oldNode.getValue = () => value
    oldNode.depth = depth
    oldNode.type = getValueType(value)
    oldNode.path = path
    oldNode.parentId = parent ? parent.id : null
    oldNode.circularOfId = sameValue ? oldNode.circularOfId : null
    return [oldNode, oldNode]
  }
  const node = $state({
    id,
    index,
    key,
    getValue: () => value,
    updateValue: function (val: any) {
      return updateNodeValue(this.id, val)
    },
    depth,
    collapsed: true,
    type: getValueType(value),
    path,
    parentId: parent ? parent.id : null,
    circularOfId: null,
    children: []
  })
  return [node, oldNode]
}
