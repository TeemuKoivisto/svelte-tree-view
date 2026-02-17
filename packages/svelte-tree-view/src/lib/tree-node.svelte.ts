import type { TreeNode, ValueType } from './types'

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
    oldNode.key = key
    oldNode.getValue = () => value
    oldNode.depth = depth
    oldNode.type = getValueType(value)
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

// /** Optional hook called by updateValue after the node value is set. Registered by the store. */
// let _onNodeValueUpdated: ((node: TreeNode) => void) | null = null

// export function setOnNodeValueUpdated(fn: (node: TreeNode) => void) {
//   _onNodeValueUpdated = fn
// }

// function updateNodeValue(node: TreeNode, newValue: any) {
//   node.getValue = () => newValue
//   node.type = getValueType(newValue)
//   _onNodeValueUpdated?.(node)
// }
