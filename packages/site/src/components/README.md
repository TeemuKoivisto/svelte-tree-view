# Tree Node Components

This directory contains different tree node implementations for the svelte-tree-view library.

## Components

### DefaultNode.svelte

The default tree node component with traditional styling using CSS variables and SCSS.

### DiffValue.svelte

A specialized tree node component for displaying diff data with color-coded additions and deletions.

### TailwindNode.svelte

A modern, card-based tree node component using Tailwind CSS with the following features:

#### Features

- **Modern Card Design**: Each node is displayed as a card with rounded corners and subtle borders
- **Hover Effects**: Smooth transitions and hover states for better user interaction
- **Type-based Color Coding**: Different data types are color-coded for better readability
- **Responsive Design**: Adapts to different screen sizes with mobile-optimized controls
- **Dark Mode Support**: Full dark mode compatibility with appropriate color schemes
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Action Buttons**: Log and copy buttons with hover effects that appear on interaction
- **Diff Support**: Handles diff data with color-coded additions and deletions

#### Styling Approach

- Uses Tailwind CSS utility classes for consistent styling
- Card-based layout with proper spacing and visual hierarchy
- Smooth transitions and animations for better UX
- Type-specific color coding for different data types
- Responsive design with mobile-first approach

#### Usage

```svelte
<script>
  import { TreeView } from 'svelte-tree-view'
  import TailwindNode from './TailwindNode.svelte'
</script>

<TreeView data={yourData}>
  {#snippet treeNode(props)}
    <TailwindNode {...props} />
  {/snippet}
</TreeView>
```

#### Demo

Visit `/tailwind` to see the TailwindNode component in action with various data examples.

## Comparison

| Feature           | DefaultNode   | DiffValue     | TailwindNode |
| ----------------- | ------------- | ------------- | ------------ |
| Styling           | CSS Variables | CSS Variables | Tailwind CSS |
| Layout            | Traditional   | Traditional   | Card-based   |
| Hover Effects     | Basic         | Basic         | Advanced     |
| Dark Mode         | Limited       | Limited       | Full Support |
| Mobile Responsive | No            | No            | Yes          |
| Type Color Coding | Basic         | Basic         | Advanced     |
| Diff Support      | No            | Yes           | Yes          |
