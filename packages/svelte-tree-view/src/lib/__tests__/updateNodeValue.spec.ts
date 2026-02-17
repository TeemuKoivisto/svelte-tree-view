import { describe, expect, it } from 'vitest'

import { recurseObjectProperties } from '../tree-recursion'
import { expandNodeChildren, updateNodeValue } from '../store-methods'

import type { TreeNode, TreeRecursionOpts } from '../types'

const fileTree = {
  src: {
    'index.ts': 'export {}',
    components: {
      'App.svelte': '<div>App</div>',
      'Nav.svelte': '<nav />'
    }
  },
  docs: {
    'README.md': '# Docs'
  },
  lib: {
    utils: {
      'counter.ts': 'function count() {}',
      'format.ts': 'function format() {}',
      'helper.ts': 'function helper() {}',
      jwt: {
        'decode.ts': 'function decode() {}',
        'encode.ts': 'function encode() {}'
      }
    },
    schema: {
      'schema.ts': 'const schema = {}',
      'parse.ts': 'function parse() {}'
    },
    tmp: {}
  }
}

const defaultOpts: TreeRecursionOpts = {
  getNodeId: (_val: any, key: string, parent: TreeNode) => `${parent.id}/${key}`,
  shouldExpandNode: () => true
}

function buildTree(data: unknown, opts: TreeRecursionOpts = defaultOpts) {
  const treeMap: Record<string, TreeNode> = {}
  const iteratedValues = new Map<any, TreeNode>()
  const root = recurseObjectProperties(-1, 'root', data, 0, true, null, {
    treeMap,
    oldIds: new Set(),
    iteratedValues,
    recomputeExpandNode: false,
    updateNodeValue: (id, newValue) => updateNodeValue(id, newValue, treeMap, iteratedValues),
    opts,
    usedIds: new Set<string>()
  })
  return { treeMap, root: root!, iteratedValues }
}

/** Re-recurse a node's children after its value was changed */
function reexpand(
  node: TreeNode,
  treeMap: Record<string, TreeNode>,
  iteratedValues: Map<any, TreeNode>,
  opts: TreeRecursionOpts
) {
  expandNodeChildren(node, treeMap, iteratedValues, opts)
}

function getChildKeys(node: TreeNode, treeMap: Record<string, TreeNode>) {
  return node.children.map(id => treeMap[id].key)
}

describe('updateNodeValue', () => {
  it('updates getValue and type for a leaf node', () => {
    const { treeMap } = buildTree(fileTree)
    const node = treeMap['[]/src/index.ts']

    expect(node.getValue()).toBe('export {}')
    expect(node.type).toBe('string')

    node.updateValue(42)

    expect(node.getValue()).toBe(42)
    expect(node.type).toBe('number')
  })

  it('updates getValue for an object node', () => {
    const { treeMap } = buildTree(fileTree)
    const node = treeMap['[]/docs']

    expect(node.type).toBe('object')
    node.updateValue({ 'CHANGELOG.md': '# Changes' })

    expect(node.getValue()).toEqual({ 'CHANGELOG.md': '# Changes' })
    expect(node.type).toBe('object')
  })

  describe('drag-and-drop with stable IDs', () => {
    it('moves a file: only the moved node is new, siblings are reused', () => {
      const { treeMap, iteratedValues } = buildTree(fileTree)

      const srcComponents = treeMap['[]/src/components']
      const docs = treeMap['[]/docs']

      // Capture references to nodes that should be reused after the move
      const appNodeBefore = treeMap['[]/src/components/App.svelte']
      const readmeNodeBefore = treeMap['[]/docs/README.md']
      // Capture all lib/* nodes to confirm they're completely untouched
      const libBefore = treeMap['[]/lib']
      const utilsBefore = treeMap['[]/lib/utils']
      const counterBefore = treeMap['[]/lib/utils/counter.ts']
      const jwtBefore = treeMap['[]/lib/utils/jwt']
      const schemaBefore = treeMap['[]/lib/schema']

      // --- Move Nav.svelte from src/components → docs ---
      const movedValue = treeMap['[]/src/components/Nav.svelte'].getValue()

      const srcVal = { ...srcComponents.getValue() }
      delete srcVal['Nav.svelte']
      srcComponents.updateValue(srcVal)
      docs.updateValue({ ...docs.getValue(), 'Nav.svelte': movedValue })

      reexpand(srcComponents, treeMap, iteratedValues, defaultOpts)
      reexpand(docs, treeMap, iteratedValues, defaultOpts)

      expect(getChildKeys(srcComponents, treeMap)).toEqual(['App.svelte'])
      expect(getChildKeys(docs, treeMap)).toEqual(['README.md', 'Nav.svelte'])

      // Stable IDs: siblings that didn't move are the same object reference (reused via oldNode path)
      expect(treeMap['[]/src/components/App.svelte']).toBe(appNodeBefore)
      expect(treeMap['[]/docs/README.md']).toBe(readmeNodeBefore)

      // The moved file gets a new ID ([]/docs/Nav.svelte) — a fresh node
      expect(treeMap['[]/docs/Nav.svelte']).toBeDefined()

      // Old node is cleaned up — no orphans in treeMap
      expect(treeMap['[]/src/components/Nav.svelte']).toBeUndefined()

      // lib/ and everything under it was never touched by reexpand
      expect(treeMap['[]/lib']).toBe(libBefore)
      expect(treeMap['[]/lib/utils']).toBe(utilsBefore)
      expect(treeMap['[]/lib/utils/counter.ts']).toBe(counterBefore)
      expect(treeMap['[]/lib/utils/jwt']).toBe(jwtBefore)
      expect(treeMap['[]/lib/schema']).toBe(schemaBefore)
    })

    it('moves a folder: children of the moved folder get new IDs under the new parent', () => {
      const { treeMap, iteratedValues } = buildTree(fileTree)

      const src = treeMap['[]/src']
      const docs = treeMap['[]/docs']

      // Capture a deep child inside components before the move
      const appNodeBefore = treeMap['[]/src/components/App.svelte']
      const indexTsBefore = treeMap['[]/src/index.ts']

      // Move entire "components" folder from src → docs
      const componentsVal = treeMap['[]/src/components'].getValue()

      src.updateValue({ 'index.ts': src.getValue()['index.ts'] })
      docs.updateValue({ ...docs.getValue(), components: componentsVal })

      reexpand(src, treeMap, iteratedValues, defaultOpts)
      reexpand(docs, treeMap, iteratedValues, defaultOpts)

      expect(getChildKeys(src, treeMap)).toEqual(['index.ts'])
      expect(getChildKeys(docs, treeMap)).toEqual(['README.md', 'components'])

      // index.ts stayed in src — same object, reused
      expect(treeMap['[]/src/index.ts']).toBe(indexTsBefore)

      // Old path nodes and their descendants are cleaned up
      expect(treeMap['[]/src/components']).toBeUndefined()
      expect(treeMap['[]/src/components/App.svelte']).toBeUndefined()
      expect(treeMap['[]/src/components/Nav.svelte']).toBeUndefined()

      // New path nodes exist under docs
      expect(treeMap['[]/docs/components']).toBeDefined()
      expect(treeMap['[]/docs/components/App.svelte']).toBeDefined()

      // New nodes are different references (new IDs → fresh nodes)
      expect(treeMap['[]/docs/components/App.svelte']).not.toBe(appNodeBefore)

      // Children of the moved folder are intact
      const movedComponents = treeMap['[]/docs/components']
      expect(getChildKeys(movedComponents, treeMap)).toEqual(['App.svelte', 'Nav.svelte'])
    })
  })

  describe('drag-and-drop with index-based IDs (no getNodeId)', () => {
    const indexOpts: TreeRecursionOpts = {
      shouldExpandNode: () => true
    }

    it('index IDs shift when a sibling is removed, causing wrong node reuse', () => {
      // lib/utils has: counter.ts[0], format.ts[1], helper.ts[2], jwt[3]
      const { treeMap, iteratedValues } = buildTree(fileTree, indexOpts)

      // With index-based IDs, lib is at index 2 and utils is at [2,0]
      // lib/utils children are at [2,0,0]=counter, [2,0,1]=format, [2,0,2]=helper, [2,0,3]=jwt
      const utils = treeMap['[2,0]'] // lib/utils
      expect(getChildKeys(utils, treeMap)).toEqual(['counter.ts', 'format.ts', 'helper.ts', 'jwt'])

      // Give jwt and helper.ts distinct collapsed states:
      // helper.ts (index 2) → collapsed=true, jwt (index 3) → collapsed=false
      treeMap['[2,0,2]'].collapsed = true
      expect(treeMap['[2,0,2]'].key).toBe('helper.ts')
      treeMap['[2,0,3]'].collapsed = false
      expect(treeMap['[2,0,3]'].key).toBe('jwt')

      // Capture identity of helper.ts before the move
      const helperBefore = treeMap['[2,0,2]']

      // --- Move format.ts (index 1) out to docs ---
      const docs = treeMap['[1]'] // docs
      const utilsVal = utils.getValue() as Record<string, any>
      const { 'format.ts': formatVal, ...restUtils } = utilsVal

      utils.updateValue(restUtils)
      docs.updateValue({ ...docs.getValue(), 'format.ts': formatVal })

      reexpand(utils, treeMap, iteratedValues, indexOpts)
      reexpand(docs, treeMap, iteratedValues, indexOpts)

      // After removal, indices shift: counter.ts[0], helper.ts[1], jwt[2]
      expect(getChildKeys(utils, treeMap)).toEqual(['counter.ts', 'helper.ts', 'jwt'])

      // Problem: helper.ts is now at index 1 → ID [2,0,1] which was format.ts's old ID.
      // createNode finds the old format.ts node and reuses it, so helper.ts gets format.ts's
      // object reference instead of its own.
      expect(treeMap['[2,0,1]'].key).toBe('helper.ts')
      expect(treeMap['[2,0,1]']).not.toBe(helperBefore)

      // jwt shifted from index 3 to 2 → ID [2,0,2] which was helper.ts's old ID.
      // The old jwt at [2,0,3] is cleaned up since it's no longer referenced.
      expect(treeMap['[2,0,3]']).toBeUndefined()

      // jwt at its new index [2,0,2] inherits helper.ts's collapsed=true state
      // because createNode reuses the old node at that ID and preserves its collapsed value.
      // jwt was collapsed=false but now gets helper.ts's collapsed=true — state got clobbered!
      expect(treeMap['[2,0,2]'].key).toBe('jwt')
      expect(treeMap['[2,0,2]'].collapsed).toBe(true) // Was false! Clobbered by index shift
    })

    it('stable IDs preserve collapsed state correctly after the same move', () => {
      const { treeMap, iteratedValues } = buildTree(fileTree) // uses defaultOpts with getNodeId

      const utils = treeMap['[]/lib/utils']
      expect(getChildKeys(utils, treeMap)).toEqual(['counter.ts', 'format.ts', 'helper.ts', 'jwt'])

      // Uncollapse jwt
      treeMap['[]/lib/utils/jwt'].collapsed = false

      // Same move: remove format.ts from utils, add to docs
      const docs = treeMap['[]/docs']
      const utilsVal = utils.getValue() as Record<string, any>
      const { 'format.ts': formatVal, ...restUtils } = utilsVal

      utils.updateValue(restUtils)
      docs.updateValue({ ...docs.getValue(), 'format.ts': formatVal })

      reexpand(utils, treeMap, iteratedValues, defaultOpts)
      reexpand(docs, treeMap, iteratedValues, defaultOpts)

      expect(getChildKeys(utils, treeMap)).toEqual(['counter.ts', 'helper.ts', 'jwt'])

      // With stable IDs, jwt keeps its ID regardless of index shift
      // → collapsed state is preserved correctly
      expect(treeMap['[]/lib/utils/jwt'].collapsed).toBe(false)

      // helper.ts also keeps its own ID and state
      expect(treeMap['[]/lib/utils/helper.ts']).toBeDefined()
      expect(treeMap['[]/lib/utils/helper.ts'].key).toBe('helper.ts')
    })
  })
})
