/**
 * @jest-environment jsdom
 */

import { render, fireEvent, findAllByText } from '@testing-library/svelte'
import TreeView from '../TreeView.svelte'

import example1 from './__fixtures__/example1.json'
import { generateObj } from './generateObj'

import type { TreeNode } from '../types'

// https://sveltesociety.dev/recipes/testing-and-debugging/unit-testing-svelte-component/

async function clickByText(container: HTMLElement, text: string, index = 0) {
  const el = (await findAllByText(container, text))[index]
  if (el) {
    return fireEvent(
      el,
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
    )
  }
}

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

    expect(results.container.querySelectorAll('ul').length).toEqual(37)
    expect(results.container.querySelectorAll('li').length).toEqual(270)
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
          isCircularNode(node: TreeNode, iteratedValues: Map<any, TreeNode>) {
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
        valueFormatter: (val: any, node: TreeNode) => {
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

    expect(results.container.querySelectorAll('ul').length).toEqual(34)
    expect(results.container.querySelectorAll('li').length).toEqual(118)
    expect(results.container).toBeInTheDocument()
    expect(results.container).toMatchSnapshot()
  })

  it('should respect maxDepth and collapse nodes correctly', async () => {
    const data = {
      a: [1, 2, 3],
      b: new Map<string, any>([
        ['c', { d: null }],
        ['e', { f: [9, 8, 7] }]
      ])
    }
    const results = render(TreeView, {
      props: {
        data,
        recursionOpts: {
          maxDepth: 4
        }
      }
    })
    window.HTMLElement.prototype.scrollIntoView = jest.fn()

    expect(results.container.querySelectorAll('li').length).toEqual(2)
    expect(results.container).toBeInTheDocument()

    await clickByText(results.container, 'b:')
    expect(results.container.querySelectorAll('li').length).toEqual(5)

    await clickByText(results.container, '[map entry 1]:')
    expect(results.container.querySelectorAll('li').length).toEqual(8)

    await clickByText(results.container, '[value]:')
    expect(results.container.querySelectorAll('li').length).toEqual(10)

    // Here should not expand the 'f:' value since it's beyond maxDepth
    await clickByText(results.container, 'f:')
    expect(results.container.querySelectorAll('li').length).toEqual(10)

    // Collapsing and uncollapsing should not change anything
    await clickByText(results.container, '[value]:')
    await clickByText(results.container, '[value]:')
    expect(results.container.querySelectorAll('li').length).toEqual(10)

    await clickByText(results.container, 'b:')
    await clickByText(results.container, 'b:')
    expect(results.container.querySelectorAll('li').length).toEqual(10)

    // Add circular node to the data and use stopCircularRecursion
    data.b = data.b.set('g', data.b.get('e'))
    results.rerender({
      props: {
        data,
        recursionOpts: {
          maxDepth: 5,
          stopCircularRecursion: true
        }
      }
    })

    // Rerendering should collapse again everything
    expect(results.container.querySelectorAll('li').length).toEqual(2)

    await clickByText(results.container, 'b:')
    expect(results.container.querySelectorAll('li').length).toEqual(6)

    await clickByText(results.container, '[map entry 1]:')
    expect(results.container.querySelectorAll('li').length).toEqual(9)

    await clickByText(results.container, '[value]:')
    expect(results.container.querySelectorAll('li').length).toEqual(11)

    // Now clicking f: should expand more nodes since maxDepth was increased
    await clickByText(results.container, 'f:')
    expect(results.container.querySelectorAll('li').length).toEqual(15)

    // Clicking the added 'g' value open
    await clickByText(results.container, '[map entry 2]:')
    expect(results.container.querySelectorAll('li').length).toEqual(18)

    // Should not expand since it's a circular value
    await clickByText(results.container, '[value]:', 1)
    expect(results.container.querySelectorAll('li').length).toEqual(18)
  })

  it('should respect maxDepth and collapse nodes correctly', async () => {
    const results = render(TreeView, {
      props: {
        data: undefined
      }
    })
    window.HTMLElement.prototype.scrollIntoView = jest.fn()

    expect(results.container.querySelectorAll('li').length).toEqual(0)

    const nonTreeValues = [
      null,
      Symbol('foo'),
      NaN,
      123,
      BigInt('0x1fffffffffffff'),
      'asdf',
      /\w+/,
      () => undefined,
      function () {
        return 0
      },
      document.createElement('li')
    ]
    nonTreeValues.forEach(val => {
      results.rerender({
        props: {
          data: val
        }
      })
      expect(results.container.querySelectorAll('li').length).toEqual(0)
    })

    results.rerender({
      props: {
        data: nonTreeValues
      }
    })
    expect(results.container.querySelectorAll('li').length).toEqual(10)
  })
})
