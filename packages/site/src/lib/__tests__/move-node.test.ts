import { vi } from 'vitest'
import { createStore, type TreeNode } from 'svelte-tree-view'

import { moveNode } from '../move-utils'

import dndData from '$lib/example_dnd.json'

const instructions = [
  { operation: 'combine', blocked: false, axis: 'vertical' },
  { operation: 'reorder-before', blocked: false, axis: 'vertical' },
  { operation: 'reorder-after', blocked: false, axis: 'vertical' }
] as const

const DEFAULT_RECURSION_OPTS = {
  maxDepth: 16,
  omitKeys: [],
  stopCircularRecursion: false,
  shouldExpandNode: () => true
}

const snapPath = (i: number, j: number, name?: string) =>
  `./__snapshots__/${i}-${j}${name ? '-' + name : ''}.json`

const intoJSON = (map: Record<string, TreeNode<any>>) =>
  Object.entries(map).reduce<Record<string, any>>(
    (acc, [id, { getValue, updateValue, ...node }]) => {
      acc[id] = { ...node, value: getValue() }
      return acc
    },
    {}
  )

describe('moveNode', () => {
  const store = createStore({ recursionOpts: DEFAULT_RECURSION_OPTS })
  store.createTree(structuredClone(dndData), DEFAULT_RECURSION_OPTS, false)
  const treeMap = store.treeMap

  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(1704060000000))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    store.createTree(structuredClone(dndData), DEFAULT_RECURSION_OPTS, false)
    // treeMap = store.treeMap
  })

  describe('with instruction reorder-before', () => {
    it('should correctly insert elements above target', async () => {
      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node'))
      moveNode(treeMap['[1,2,0,2,1]'], treeMap['[1,2,0,2,0]'], instructions[1], treeMap)
      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node-before'))
    })
  })

  // "[0,2,0,2,0]": {
  //   "children": [
  //     "[0,2,0,2,0,0]",
  //     "[0,2,0,2,0,1]",
  //   ],
  //   "circularOfId": null,
  //   "collapsed": false,
  //   "depth": 5,
  //   "id": "[0,2,0,2,0]",
  //   "index": 0,
  //   "key": "0",
  //   "parentId": "[0,2,0,2]",
  //   "path": [
  //     0,
  //     2,
  //     0,
  //     2,
  //     0,
  //   ],
  //   "type": "object",
  //   "value": {
  //     "children": [],
  //     "id": "n1-c1-gc1",
  //   },
  // },
  // "[0,2,0,2,1,0]": {
  //   "children": [],
  //   "circularOfId": null,
  //   "collapsed": false,
  //   "depth": 6,
  //   "id": "[0,2,0,2,1,0]",
  //   "index": 0,
  //   "key": "id",
  //   "parentId": "[0,2,0,2,1]",
  //   "path": [
  //     0,
  //     2,
  //     0,
  //     2,
  //     1,
  //     0,
  //   ],
  //   "type": "string",
  //   "value": "n1-c1-gc2",
  // },
  // "[0,2,0,2,1,1]": {
  //   "children": [],
  //   "circularOfId": null,
  //   "collapsed": false,
  //   "depth": 6,
  //   "id": "[0,2,0,2,1,1]",
  //   "index": 1,
  //   "key": "isDraft",
  //   "parentId": "[0,2,0,2,1]",
  //   "path": [
  //     0,
  //     2,
  //     0,
  //     2,
  //     1,
  //     1,
  //   ],
  //   "type": "boolean",
  //   "value": true,
  // },
  // "[0,2,0,2,1,2]": {
  //   "children": [],
  //   "circularOfId": null,
  //   "collapsed": false,
  //   "depth": 6,
  //   "id": "[0,2,0,2,1,2]",
  //   "index": 2,
  //   "key": "children",
  //   "parentId": "[0,2,0,2,1]",
  //   "path": [
  //     0,
  //     2,
  //     0,
  //     2,
  //     1,
  //     2,
  //   ],
  //   "type": "array",
  //   "value": [],
  // },

  describe.only('with instruction reorder-after', () => {
    it('should correctly insert elements below target', async () => {
      // orig [0,2,1] -> {"children": [],"id": "n1-c2" }
      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node'))
      moveNode(treeMap['[0,2,1]'], treeMap['[0,2,0,2,1]'], instructions[1], treeMap)
      // insertoi [0,2,1] [0,2,0,2,1] ennen?
      // EI POISTA VANHAA(!) salee
      // "[0,2]": {"children": [ "[0,2,0]" ] }
      // "[0,2,1]": {"children": ["[0,2,1,0]","[0,2,1,1]" ],
      // "[0,2,1]" -> {"children": [], "id": "n1-c2" }
      // "[0,2,0]": {"children": ["[0,2,0,0]","[0,2,0,1]","[0,2,0,2]",],
      // "[0,2,0,2,0]" -> {"children": [],"id": "n1-c2" }

      // must jos deletoin koko höskän vaik vaan siirrän niin tyhmää?
      // teen jo nyt tyhmiä asioita kun rekursoin SIIRRETYN jo uudestaan...
      // mut KÄYTÄNNÖSSÄ on pakko koska path ON muuttunut molemmissa tapauksissa
      // -> koko index path pitää laskea uusiks
      // niin no voisin silti tehdä vaan 1 rekursion -> vaatis spesiaalin semantiikan koska en voi tietää
      // onko node:n getValue sama (kutsuin jo updateValue, all bets are off)
      // voin antaa shouldRecursen suoraan updateValuessa? jolloin jos siirtää niin voi skipata lapset PAITSI
      // ne pitää rekursoida koska mistäs löydän ne nodet muuten? XDDD lol
      // MYÖS onko järkeä tehdä tämmönen häkkyrä kun AINA muutoin data-muuttujan kautta triggeröidään muutos
      // eli optimoin sen mieluummin -> skippaat jo rekursoidut haarat
      // hmm onko käytännössä mahdotonta koska en tiedä kun data muuttuu et mitkä haarat pitää laskea uusiks?
      // ai ai ai
      // onko nää ProseMirror ongelmia? LOL puu vs rope viddu
      // fundamentaalinen ongelma: jos value/data on muuttunut, mistä tiedän mitä rekursoida uudestaan
      // tarvii omat primitiivit joilla muuttaa treeMapin tilaa jos haluaa minimoida rekursion
      // hmm path id:n sijaan UUID? tällöin voi reparentoida 1 operaatiolla
      // voi antaa createID(val) parametrin?
      // hmmmm niin siis jos päivitän dataa, niin TreeViewNodessa pitäis olla se rekursio
      // -> ajaa sen vanaan kun noden value on muuttunut -> voinko tehdä shallow update checkin?
      // -> ancestor nodet ei aja sitä eikä myöskään lapset (käytännössä, )

      // inserted node {
      //   id: '[0,2,0,2,2]',
      //   index: 2,
      //   key: '2',
      //   value: { id: 'n1-c1-gc2', isDraft: true, children: [] }
      //   updateValue: [Function: updateValue],
      //   depth: 5,
      //   collapsed: true,
      //   type: 'object',
      //   path: [ 0, 2, 0, 2, 2 ],
      //   parentId: '[0,2,0,2]',
      //   circularOfId: null,
      //   children: []
      // }
      // inserted node {
      //   id: '[0,2,0,2,2,0]',
      //   index: 0,
      //   key: 'id',
      //   value: 'n1-c1-gc2'
      //   updateValue: [Function: updateValue],
      //   depth: 6,
      //   collapsed: true,
      //   type: 'string',
      //   path: [ 0, 2, 0, 2, 2, 0 ],
      //   parentId: '[0,2,0,2,2]',
      //   circularOfId: null,
      //   children: []
      // }
      // inserted node {
      //   id: '[0,2,0,2,2,1]',
      //   index: 1,
      //   key: 'isDraft',
      //   getValue: [Function: getValue],
      //   updateValue: [Function: updateValue],
      //   depth: 6,
      //   collapsed: true,
      //   type: 'boolean',
      //   path: [ 0, 2, 0, 2, 2, 1 ],
      //   parentId: '[0,2,0,2,2]',
      //   circularOfId: null,
      //   children: []
      // }
      // inserted node {
      //   id: '[0,2,0,2,2,2]',
      //   index: 2,
      //   key: 'children',
      //   getValue: [Function: getValue],
      //   updateValue: [Function: updateValue],
      //   depth: 6,
      //   collapsed: true,
      //   type: 'array',
      //   path: [ 0, 2, 0, 2, 2, 2 ],
      //   parentId: '[0,2,0,2,2]',
      //   circularOfId: null,
      //   children: []
      // }

      await expect(intoJSON(treeMap)).toMatchFileSnapshot(snapPath(0, 0, 'move-node-after'))
    })
  })
})
