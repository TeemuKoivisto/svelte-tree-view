import type { SnapshotSerializer } from 'vitest'
// import type { Plugin } from '@vitest/pretty-format'

// implements Plugin from '@vitest/pretty-format' but can't annotate it here directly as it's not a direct dependency
export default {
  serialize(
    val: unknown,
    config: unknown,
    indentation: unknown,
    depth: unknown,
    refs: unknown,
    printer: unknown
  ) {
    return JSON.stringify(val, null, 2)
  },
  test(val) {
    return typeof val === 'object' && val !== null
  }
} satisfies SnapshotSerializer
