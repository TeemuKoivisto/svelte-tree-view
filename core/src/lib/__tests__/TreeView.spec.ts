/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/svelte'
import TreeView from '../TreeView.svelte'

import example1 from './__fixtures__/example1.json'
import { generateObj } from './generateObj'

import type { ITreeNode } from '../types'

// https://sveltesociety.dev/recipes/testing-and-debugging/unit-testing-svelte-component/

describe('TreeView', () => {
  it('should render', async () => {
    const results = render(TreeView, {
      props: {
        data: example1,
        recursionOpts: {
          shouldExpandNode: () => true
        }
      }
    })

    const lists = results.container.querySelectorAll('ul')
    const rows = results.container.querySelectorAll('li')

    expect(lists.length).toEqual(37)
    expect(rows.length).toEqual(270)
    expect(results.container).toBeInTheDocument()
    expect(results.container).toMatchSnapshot()
  })

  it('should render with almost all props defined', async () => {
    const results = render(TreeView, {
      props: {
        data: generateObj(0, 4),
        showLogButton: true,
        showCopyButton: true,
        recursionOpts: {
          maxDepth: 6,
          omitKeys: ['3-c'],
          stopCircularRecursion: true,
          isCircularNode(node: ITreeNode, iteratedValues: Map<any, ITreeNode>) {
            if (node.type === 'object' || node.type === 'array') {
              const existingNodeWithValue = iteratedValues.get(node.value)
              if (existingNodeWithValue) {
                node.circularOfId = existingNodeWithValue.id
                return false
              }
              iteratedValues.set(node.value, node)
            }
            return true
          },
          shouldExpandNode: () => true
        },
        valueFormatter: (val: any, node: ITreeNode) => {
          switch (node.type) {
            case 'array':
              return `${node.circularOfId ? 'circular-array' : ''} [] ${val.length} items`
            case 'object':
              return `${node.circularOfId ? 'circular-object' : ''} {} ${
                Object.keys(val).length
              } keys`
            case 'map':
            case 'set':
              return `${node.circularOfId ? 'circular-map-or-set' : ''} () ${val.size} entries`
            case 'date':
              return `${val.toISOString()}`
            case 'string':
              return `"${val}"`
            case 'boolean':
              return val ? 'true' : 'false'
            default:
              return val
          }
        },
        theme: {
          scheme: 'embers',
          author: 'jannik siebert (https://github.com/janniks)',
          base00: '#16130F',
          base01: '#2C2620',
          base02: '#433B32',
          base03: '#5A5047',
          base04: '#8A8075',
          base05: '#A39A90',
          base06: '#BEB6AE',
          base07: '#DBD6D1',
          base08: '#826D57',
          base09: '#828257',
          base0A: '#6D8257',
          base0B: '#57826D',
          base0C: '#576D82',
          base0D: '#6D5782',
          base0E: '#82576D',
          base0F: '#825757'
        }
      }
    })

    const lists = results.container.querySelectorAll('ul')
    const rows = results.container.querySelectorAll('li')

    expect(lists.length).toEqual(34)
    expect(rows.length).toEqual(118)
    expect(results.container).toBeInTheDocument()
    expect(results.container).toMatchSnapshot()
  })
})
