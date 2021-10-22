# [svelte-tree-view](https://github.com/TeemuKoivisto/svelte-tree-view) [![version](https://img.shields.io/npm/v/svelte-tree-view?style=flat-square)](https://www.npmjs.com/package/svelte-tree-view) [![package minified size](https://img.shields.io/bundlephobia/min/svelte-tree-view?style=flat-square&color=important)](https://bundlephobia.com/result?p=svelte-tree-view) [![package size](https://img.shields.io/bundlephobia/minzip/svelte-tree-view?style=flat-square)](https://bundlephobia.com/result?p=svelte-tree-view)

Library to show Javascript objects in a nice tree layout. It's written in Svelte but since it compiles to pure JS it can be used anywhere (although to customize the rendered nodes you must Svelte).

## [Demo](https://teemukoivisto.github.io/svelte-tree-view/)

`npm i svelte-tree-view`

## How to use

NOTE: I've written this library completely in TypeScript and I'm standing by that decision. However, since Svelte tooling is not quite there yet in processing Svelte files from TS into JS, you might need to use TypeScript yourself too. Once the bugs are sorted out, I hope this won't be an issue anymore. https://github.com/sveltejs/kit/issues/2450 https://github.com/sveltejs/component-template/issues/29 https://stackoverflow.com/questions/69274093/how-to-import-svelte-library-written-in-typescript

Basically what you probably need to do is add `typescript` block to your `svelte.config.js` eg:

```js
import autoPreprocess from 'svelte-preprocess'

const preprocessOptions = {
  typescript: {
    tsconfigFile: './tsconfig.json'
  }
}

export default {
  preprocess: autoPreprocess(preprocessOptions),
  preprocessOptions,
}
```

Sorry about the hassle! Will update this library once I find a solution.

You can import the library as:

```ts
import TreeView from 'svelte-tree-view'
```

And use it as:

```tsx
<TreeView
  data={selectedEntry.contentDiff}
  showLogButton
  showCopyButton
  valueComponent={DiffValue}
  recursionOpts={{
    maxDepth: 16,
    mapChildren: mapDocDeltaChildren,
    shouldExpandNode: () => true
  }}
/>
```

Or if you are not using Svelte (NOTE: to use it with TS you must have svelte installed as a devDependency for the typings):

```ts
import { TreeView } from 'svelte-tree-view'
import 'svelte-tree-view/dist/index.css'

const treeView = new TreeView({
  target: document.querySelector('#mount-point') as HTMLElement,
  props: {
    data: {
      a: [1, 2, 3],
      b: new Map([['c', { d: null }], ['e', { f: [9, 8, 7] }]])
    },
    recursionOpts: {
      maxDepth: 4
    }
  }
})
```

To override default styles I suggest using child or element selector to get enough specificity:

```tsx
<div class="tree-view-wrapper">
  <TreeView/>
</div>

<style>
  .tree-view-wrapper > :global(.svelte-tree-view) {
    ...
  }
  /* OR */
  :global(ul.svelte-tree-view) {
    ...
  }
</style>
```

## API

The full typings as copied from the source are:

```ts
export type ValueType =
  | 'array'
  | 'map'
  | 'set'
  | 'date'
  | 'object'
  | 'function'
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'null'
  | 'undefined'

export interface TreeNode<T = any> {
  id: string // ID generated from the path to this node eg "[0,1,2]"
  index: number // Index of this node in the parent object as its values are iterated
  key: string // Key of this node eg "1" for an array key or "foo" for an object
  value: T // The value mapped to this key
  depth: number
  collapsed: boolean
  type: ValueType
  path: number[]
  parentId: string | null
  // Circularity is checked by object identity to prevent recursing the same values again
  circularOfId: string | null
  children: TreeNode[]
}

export interface Base16Theme {
  scheme?: string
  author?: string
  base00: string // Default Background
  base01: string // Lighter Background (Used for status bars, line number and folding marks)
  base02: string // Selection Background
  base03: string // Comments, Invisibles, Line Highlighting
  base04: string // Dark Foreground (Used for status bars)
  base05: string // Default Foreground, Caret, Delimiters, Operators
  base06: string // Light Foreground (Not often used)
  base07: string // Light Background (Not often used)
  base08: string // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
  base09: string // Integers, Boolean, Constants, XML Attributes, Markup Link Url
  base0A: string // Classes, Markup Bold, Search Text Background
  base0B: string // Strings, Inherited Class, Markup Code, Diff Inserted
  base0C: string // Support, Regular Expressions, Escape Characters, Markup Quotes
  base0D: string // Functions, Methods, Attribute IDs, Headings
  base0E: string // Keywords, Storage, Selector, Markup Italic, Diff Changed
  base0F: string // Deprecated, Opening/Closing Embedded Language Tags, e.g. <?php ?>
}

// As described in https://stackoverflow.com/questions/67697298/svelte-components-as-object-properties/67737182#67737182
export type ValueComponent = new (...args: any) => SvelteComponentTyped<{
  value: any
  node: TreeNode
  defaultFormatter?: (val: any) => string | undefined
}>

export interface TreeViewProps {
  data: object // Data can be basically any non-primitive value
  class?: string // Top node has 'svelte-tree-view' class by default
  theme?: Base16Theme
  showLogButton?: boolean
  showCopyButton?: boolean
  valueComponent?: ValueComponent // The Svelte component to replace the default value-as-string presentation
  recursionOpts?: TreeRecursionOpts
  // For custom formatting of the value string. Returning undefined will pass the value to the default formatter
  valueFormatter?: (val: any, n: TreeNode) => string | undefined
}

export interface TreeRecursionOpts {
  maxDepth?: number // The default maxDepth is 16
  // Quick and dirty way to prevent recursing certain object keys instead of overriding shouldExpandNode
  omitKeys?: string[]
  stopCircularRecursion?: boolean // Stops recursing objects already recursed
  isCircularNode?: (n: TreeNode, iteratedValues: Map<any, TreeNode>) => boolean // For custom circularity detection magic
  shouldExpandNode?: (n: TreeNode) => boolean // Will auto-expand or collapse values as data is provided
  mapChildren?: (val: any, type: ValueType, parent: TreeNode) => [string, any][] | undefined // For customizing the created key-value pairs
}

export class TreeView extends SvelteComponentTyped<TreeViewProps> {}
export default TreeView
```

## Theming

This library uses base16 theming, similar to react-json-tree. So basically instead of theming each type (string, number, undefined etc) separately, you use the same color for all similar values. Here's a repo that might explain it better https://github.com/chriskempson/base16

The current default theme is the example monokai theme from react-json-tree with changed background color. You can define your own theme or use one from for example here https://github.com/reduxjs/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes

To use a theme, you can either provide an object or set CSS variables (recommended).

So either

```tsx
const theme = {
  scheme: 'google',
  author: 'seth wright (http://sethawright.com)',
  base00: '#1d1f21',
  base01: '#282a2e',
  base02: '#373b41',
  base03: '#969896',
  base04: '#b4b7b4',
  base05: '#c5c8c6',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#CC342B',
  base09: '#F96A38',
  base0A: '#FBA922',
  base0B: '#198844',
  base0C: '#3971ED',
  base0D: '#3971ED',
  base0E: '#A36AC7',
  base0F: '#3971ED'
}
...
<TreeView theme={theme} />
```

or

```css
:root {
  --tree-view-base00: #1d1f21;
  --tree-view-base01: #282a2e;
  --tree-view-base02: #373b41;
  --tree-view-base03: #969896;
  --tree-view-base04: #b4b7b4;
  --tree-view-base05: #c5c8c6;
  --tree-view-base06: #e0e0e0;
  --tree-view-base07: #ffffff;
  --tree-view-base08: #CC342B;
  --tree-view-base09: #F96A38;
  --tree-view-base0A: #FBA922;
  --tree-view-base0B: #198844;
  --tree-view-base0C: #3971ED;
  --tree-view-base0D: #3971ED;
  --tree-view-base0E: #A36AC7;
  --tree-view-base0F: #3971ED;
}
```

works.

## Other

[A little explanation](https://github.com/TeemuKoivisto/svelte-tree-view/blob/master/HOW.md) on the internal logic.

## Caveats

Rendering very large trees is not fast. The same happens with say react-json-tree but I assume that by using some clever hacks you _could_ make it faster. Like VSCode fast. In general, it seems the use of recursive components is non-optimal regardless of the framework.

## How to develop locally

You must have yarn installed globally.

1. `yarn`
2. `yarn start`

This should start the example-app at http://localhost:3000 that hot-reloads changes to the library inside `core`. NOTE: Since I'm using `svelte-kit package` command to build the library it uses the `"exports"` of `package.json` to make importing the package from Svelte app as efficient as possible. However, in development I'm doing this trick of manually setting the exports to `".": "./src/lib/index.ts"` which enables the example-app to auto-import the changes without having to constantly package the app. It's a bit hackish but hey, it works really well and avoids having to use `package` in development completely!

## Similar libraries

While this library was basically written from scratch, its UI and API borrows from some existing libraries.

- [react-json-tree](https://github.com/reduxjs/redux-devtools/tree/master/packages/react-json-tree)
- [react-json-view](https://github.com/mac-s-g/react-json-view)
- [svelte-json-tree](https://github.com/tanhauhau/svelte-json-tree)

## Contributing

PRs & issues are welcome!
