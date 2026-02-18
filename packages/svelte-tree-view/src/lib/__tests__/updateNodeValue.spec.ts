import { describe, expect, it } from 'vitest'

import { buildTree, expandNodeChildren, updateNodeValue } from '../store-methods'
import { createRootNode } from '../tree-node.svelte'
import { recurseObjectProperties } from '../tree-recursion'

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
  getNodeId: (_val: any, key: string, parent: TreeNode) =>
    `${parent.index !== -1 ? parent.id : ''}/${key}`,
  shouldExpandNode: () => true
}

function makeTree(data: unknown, opts: TreeRecursionOpts = defaultOpts) {
  const treeMap: Record<string, TreeNode> = {}
  const iteratedValues = new Map<any, TreeNode>()
  const rootNode = createRootNode()
  buildTree(data, rootNode, treeMap, iteratedValues, opts, false)
  return { treeMap, root: rootNode, iteratedValues }
}

function getChildKeys(node: TreeNode, treeMap: Record<string, TreeNode>) {
  return node.children.map(id => treeMap[id].key)
}

describe('updateNodeValue', () => {
  it('updates getValue and type for a leaf node', () => {
    const { treeMap } = makeTree(fileTree)
    const node = treeMap['/src/index.ts']

    expect(node.getValue()).toBe(fileTree['src']['index.ts'])
    expect(node.type).toBe('string')

    node.updateValue(42)

    expect(node.getValue()).toBe(42)
    expect(node.type).toBe('number')
  })

  it('updates getValue for an object node', () => {
    const { treeMap } = makeTree(fileTree)
    const node = treeMap['/docs']

    expect(node.getValue()).toBe(fileTree['docs'])
    expect(node.type).toBe('object')
    node.updateValue({ 'CHANGELOG.md': '# Changes' })

    expect(node.getValue()).toEqual({ 'CHANGELOG.md': '# Changes' })
    expect(node.type).toBe('object')
  })

  describe('drag-and-drop with stable IDs', () => {
    it('moves a file: only the moved node is new, siblings are reused', () => {
      const { treeMap, iteratedValues } = makeTree(fileTree)

      const srcComponents = treeMap['/src/components']
      const docs = treeMap['/docs']

      // Capture references to nodes that should be reused after the move
      const appNodeBefore = treeMap['/src/components/App.svelte']
      const readmeNodeBefore = treeMap['/docs/README.md']
      // Capture all lib/* nodes to confirm they're completely untouched
      const libBefore = treeMap['/lib']
      const utilsBefore = treeMap['/lib/utils']
      const counterBefore = treeMap['/lib/utils/counter.ts']
      const jwtBefore = treeMap['/lib/utils/jwt']
      const schemaBefore = treeMap['/lib/schema']

      // --- Move Nav.svelte from src/components → docs ---
      const movedValue = treeMap['/src/components/Nav.svelte'].getValue()

      const srcVal = { ...srcComponents.getValue() }
      delete srcVal['Nav.svelte']
      srcComponents.updateValue(srcVal)
      docs.updateValue({ ...docs.getValue(), 'Nav.svelte': movedValue })

      /** You must manually recurse a node's children after its value was changed */
      expandNodeChildren(srcComponents, treeMap, iteratedValues, defaultOpts)
      expandNodeChildren(docs, treeMap, iteratedValues, defaultOpts)

      expect(getChildKeys(srcComponents, treeMap)).toEqual(['App.svelte'])
      expect(getChildKeys(docs, treeMap)).toEqual(['README.md', 'Nav.svelte'])

      // Stable IDs: siblings that didn't move are the same object reference (reused via oldNode path)
      expect(treeMap['/src/components/App.svelte']).toBe(appNodeBefore)
      expect(treeMap['/docs/README.md']).toBe(readmeNodeBefore)

      // The moved file gets a new ID (/docs/Nav.svelte) — a fresh node
      expect(treeMap['/docs/Nav.svelte']).toBeDefined()

      // Old node is cleaned up — no orphans in treeMap
      expect(treeMap['/src/components/Nav.svelte']).toBeUndefined()

      // lib/ and everything under it was never touched by expandNodeChildren
      expect(treeMap['/lib']).toBe(libBefore)
      expect(treeMap['/lib/utils']).toBe(utilsBefore)
      expect(treeMap['/lib/utils/counter.ts']).toBe(counterBefore)
      expect(treeMap['/lib/utils/jwt']).toBe(jwtBefore)
      expect(treeMap['/lib/schema']).toBe(schemaBefore)
    })

    it('moves a folder: children of the moved folder get new IDs under the new parent', () => {
      const { treeMap, iteratedValues } = makeTree(fileTree)

      const src = treeMap['/src']
      const docs = treeMap['/docs']

      // Capture a deep child inside components before the move
      const appNodeBefore = treeMap['/src/components/App.svelte']
      const indexTsBefore = treeMap['/src/index.ts']

      // Move entire "components" folder from src → docs
      const componentsVal = treeMap['/src/components'].getValue()

      src.updateValue({ 'index.ts': src.getValue()['index.ts'] })
      docs.updateValue({ ...docs.getValue(), components: componentsVal })

      expandNodeChildren(src, treeMap, iteratedValues, defaultOpts)
      expandNodeChildren(docs, treeMap, iteratedValues, defaultOpts)

      expect(getChildKeys(src, treeMap)).toEqual(['index.ts'])
      expect(getChildKeys(docs, treeMap)).toEqual(['README.md', 'components'])

      // index.ts stayed in src — same object, reused
      expect(treeMap['/src/index.ts']).toBe(indexTsBefore)

      // Old path nodes and their descendants are cleaned up
      expect(treeMap['/src/components']).toBeUndefined()
      expect(treeMap['/src/components/App.svelte']).toBeUndefined()
      expect(treeMap['/src/components/Nav.svelte']).toBeUndefined()

      // New path nodes exist under docs
      expect(treeMap['/docs/components']).toBeDefined()
      expect(treeMap['/docs/components/App.svelte']).toBeDefined()

      // New nodes are different references (new IDs → fresh nodes)
      expect(treeMap['/docs/components/App.svelte']).not.toBe(appNodeBefore)

      // Children of the moved folder are intact
      const movedComponents = treeMap['/docs/components']
      expect(getChildKeys(movedComponents, treeMap)).toEqual(['App.svelte', 'Nav.svelte'])
    })
  })

  describe('drag-and-drop with index-based IDs (no getNodeId)', () => {
    const indexOpts: TreeRecursionOpts = {
      shouldExpandNode: () => true
    }

    it('index IDs shift when a sibling is removed, causing wrong node reuse', () => {
      // lib/utils has: counter.ts[0], format.ts[1], helper.ts[2], jwt[3]
      const { treeMap, iteratedValues } = makeTree(fileTree, indexOpts)

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

      expandNodeChildren(utils, treeMap, iteratedValues, indexOpts)
      expandNodeChildren(docs, treeMap, iteratedValues, indexOpts)

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

    it('cleans up deep orphans when a reused node has fewer children than before', () => {
      // lib has: utils[0], schema[1], tmp[2]
      // schema has children: schema.ts[2,1,0], parse.ts[2,1,1]
      // tmp is an empty object with no children
      const { treeMap, iteratedValues } = makeTree(fileTree, indexOpts)

      const lib = treeMap['[2]'] // lib
      expect(getChildKeys(lib, treeMap)).toEqual(['utils', 'schema', 'tmp'])

      // Verify schema's children exist
      expect(treeMap['[2,1]'].key).toBe('schema')
      expect(treeMap['[2,1,0]'].key).toBe('schema.ts')
      expect(treeMap['[2,1,1]'].key).toBe('parse.ts')

      // --- Move schema out of lib to docs ---
      const docs = treeMap['[1]']
      const libVal = lib.getValue() as Record<string, any>
      const { schema: schemaVal, ...restLib } = libVal

      lib.updateValue(restLib)
      docs.updateValue({ ...docs.getValue(), schema: schemaVal })

      expandNodeChildren(lib, treeMap, iteratedValues, indexOpts)
      expandNodeChildren(docs, treeMap, iteratedValues, indexOpts)

      // After removal, lib's children shift: utils[0], tmp[1]
      expect(getChildKeys(lib, treeMap)).toEqual(['utils', 'tmp'])

      // tmp now occupies index 1 → ID [2,1] which was schema's old ID.
      // tmp is an empty object (0 children), but the old schema had 2 children.
      expect(treeMap['[2,1]'].key).toBe('tmp')
      expect(treeMap['[2,1]'].children).toEqual([])

      // Deep orphan bug: schema's old children at [2,1,0] and [2,1,1] must be
      // cleaned up. Without the prevChildren tracking in recurseObjectProperties,
      // these would remain as orphans in treeMap.
      expect(treeMap['[2,1,0]']).toBeUndefined()
      expect(treeMap['[2,1,1]']).toBeUndefined()

      // The old schema at [2,2] (tmp's old index) should also be cleaned up
      expect(treeMap['[2,2]']).toBeUndefined()
    })

    it('stable IDs preserve collapsed state correctly after the same move', () => {
      const { treeMap, iteratedValues } = makeTree(fileTree) // uses defaultOpts with getNodeId

      const utils = treeMap['/lib/utils']
      expect(getChildKeys(utils, treeMap)).toEqual(['counter.ts', 'format.ts', 'helper.ts', 'jwt'])

      // Uncollapse jwt
      treeMap['/lib/utils/jwt'].collapsed = false

      // Same move: remove format.ts from utils, add to docs
      const docs = treeMap['/docs']
      const utilsVal = utils.getValue() as Record<string, any>
      const { 'format.ts': formatVal, ...restUtils } = utilsVal

      utils.updateValue(restUtils)
      docs.updateValue({ ...docs.getValue(), 'format.ts': formatVal })

      expandNodeChildren(utils, treeMap, iteratedValues, defaultOpts)
      expandNodeChildren(docs, treeMap, iteratedValues, defaultOpts)

      expect(getChildKeys(utils, treeMap)).toEqual(['counter.ts', 'helper.ts', 'jwt'])

      // With stable IDs, jwt keeps its ID regardless of index shift
      // → collapsed state is preserved correctly
      expect(treeMap['/lib/utils/jwt'].collapsed).toBe(false)

      // helper.ts also keeps its own ID and state
      expect(treeMap['/lib/utils/helper.ts']).toBeDefined()
      expect(treeMap['/lib/utils/helper.ts'].key).toBe('helper.ts')
    })
  })
})
