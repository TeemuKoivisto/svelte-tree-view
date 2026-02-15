export type TreeItem = {
  id: string
  isDraft?: boolean
  children: TreeItem[]
  isOpen?: boolean
}

export const treeUtils = {
  remove(data: TreeItem[], id: string): TreeItem[] {
    return data
      .filter(item => item.id !== id)
      .map(item => {
        if (item.children.length > 0) {
          return {
            ...item,
            children: treeUtils.remove(item.children, id)
          }
        }
        return item
      })
  },
  insertBefore(data: TreeItem[], targetId: string, newItem: TreeItem): TreeItem[] {
    return data.flatMap(item => {
      if (item.id === targetId) {
        return [newItem, item]
      } else if (item.children.length > 0) {
        return {
          ...item,
          children: treeUtils.insertBefore(item.children, targetId, newItem)
        }
      }
      return item
    })
  },
  insertAfter(data: TreeItem[], targetId: string, newItem: TreeItem): TreeItem[] {
    return data.flatMap(item => {
      if (item.id === targetId) {
        return [item, newItem]
      } else if (item.children.length > 0) {
        return {
          ...item,
          children: treeUtils.insertAfter(item.children, targetId, newItem)
        }
      }
      return item
    })
  },
  insertChild(data: TreeItem[], targetId: string, newItem: TreeItem): TreeItem[] {
    return data.flatMap(item => {
      if (item.id === targetId) {
        // already a parent: add as first child
        return {
          ...item,
          // opening item so you can see where item landed
          isOpen: true,
          children: [newItem, ...item.children]
        }
      } else if (item.children.length === 0) {
        return item
      }
      return {
        ...item,
        children: treeUtils.insertChild(item.children, targetId, newItem)
      }
    })
  },
  findItem(data: TreeItem[], itemId: string): TreeItem | undefined {
    for (const item of data) {
      if (item.id === itemId) {
        return item
      }
      const found = treeUtils.findItem(item.children, itemId)
      if (found) return found
    }
  },
  getPathToItem({
    current,
    targetId,
    parentIds = []
  }: {
    current: TreeItem[]
    targetId: string
    parentIds?: string[]
  }): string[] | undefined {
    for (const item of current) {
      if (item.id === targetId) {
        return parentIds
      }
      const nested = treeUtils.getPathToItem({
        current: item.children,
        targetId: targetId,
        parentIds: [...parentIds, item.id]
      })
      if (nested) {
        return nested
      }
    }
  }
}
