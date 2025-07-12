<script lang="ts">
  import { onMount } from 'svelte'
  import { TreeView } from 'svelte-tree-view'
  import TailwindNode from '$components/TailwindNode.svelte'

  import {
    state,
    parsedData,
    parsedRecursionOpts,
    parsedTheme,
    parsedValueFormatter,
    update
  } from '$lib/store'

  onMount(() => {
    // parsedData.set(example2)
    parsedRecursionOpts.set({
      shouldExpandNode: () => true
    })
  })

  let selectedExample = 'example1'

  // Create custom examples that better showcase the truncated preview
  const customExamples = {
    complexObject: {
      user: {
        id: 12345,
        name: 'John Doe',
        email: 'john.doe@example.com',
        profile: {
          avatar: 'https://example.com/avatar.jpg',
          bio: 'Software developer with 10+ years of experience',
          preferences: {
            theme: 'dark',
            notifications: true,
            language: 'en'
          }
        },
        settings: {
          privacy: 'public',
          notifications: {
            email: true,
            push: false,
            sms: true
          }
        },
        metadata: {
          createdAt: '2023-01-15T10:30:00Z',
          lastLogin: '2024-01-20T14:45:00Z',
          loginCount: 156
        }
      }
    },
    nestedArrays: {
      matrix: [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25]
      ],
      users: [
        { id: 1, name: 'Alice', role: 'admin' },
        { id: 2, name: 'Bob', role: 'user' },
        { id: 3, name: 'Charlie', role: 'moderator' },
        { id: 4, name: 'Diana', role: 'user' },
        { id: 5, name: 'Eve', role: 'admin' }
      ],
      config: {
        features: ['auth', 'api', 'websockets', 'caching', 'logging'],
        limits: {
          requests: 1000,
          storage: '1GB',
          users: 10000
        }
      }
    },
    mixedData: {
      strings: ['hello', 'world', 'this', 'is', 'a', 'long', 'string', 'array'],
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      booleans: [true, false, true, false, true],
      nulls: [null, null, null],
      objects: [
        { type: 'user', data: { name: 'John' } },
        { type: 'post', data: { title: 'Hello World' } },
        { type: 'comment', data: { text: 'Great post!' } }
      ]
    }
  }

  const examples = {
    example1: customExamples.complexObject,
    example2: customExamples.nestedArrays,
    example3: customExamples.mixedData
  }

  $: currentData = examples[selectedExample as keyof typeof examples]
</script>

<div class="flex flex-col">
  <div class="demo-controls">
    <div class="control-group">
      <label class="control-label">Example Data:</label>
      <select bind:value={selectedExample} class="control-select">
        <option value="example1">Complex Object - Nested user data</option>
        <option value="example2">Nested Arrays - Matrix and user lists</option>
        <option value="example3">Mixed Data - Various data types</option>
      </select>
    </div>
  </div>

  <div class="p-4">
    <TreeView
      data={currentData}
      showLogButton={$state.showLogButton}
      showCopyButton={$state.showCopyButton}
      recursionOpts={$parsedRecursionOpts}
      valueFormatter={$parsedValueFormatter}
      theme={$parsedTheme}
    >
      {#snippet treeNode(props)}
        <TailwindNode {...props} />
      {/snippet}
    </TreeView>
  </div>

  <div class="demo-info">
    <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">How it works:</h3>
    <ul class="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
      <li>
        When collapsed, objects show a preview like: <code
          class="rounded bg-gray-100 px-1 dark:bg-gray-700">object with keys</code
        >
      </li>
      <li>
        When collapsed, arrays show a preview like: <code
          class="rounded bg-gray-100 px-1 dark:bg-gray-700">[ 1, 2, 3, ... ]</code
        >
      </li>
      <li>When expanded, full details are displayed as normal</li>
      <li>Strings longer than 10 characters are truncated with "..."</li>
      <li>Nested objects are shown as "object" in previews</li>
    </ul>
  </div>
</div>

<style lang="postcss">
  @reference "#app.css";

  .demo-controls {
    @apply mb-6 rounded-lg border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800;
  }

  .control-group {
    @apply mb-4 last:mb-0;
  }

  .control-label {
    @apply mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300;
  }

  .control-select {
    @apply w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400;
  }

  .demo-info {
    @apply mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800;
  }
</style>
