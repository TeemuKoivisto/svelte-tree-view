<script lang="ts">
  import { treeOpts, update } from '$lib/store'
</script>

<fieldset class="container-sm flex flex-col border-2 p-2 text-sm">
  <legend class="text-0A px-2 text-base">Available props</legend>
  <div class="m-2 mt-0">
    <div class="field">
      <label for="leftIndent">--tree-view-left-indent</label>
      <input id="leftIndent" class="bg-01 text-0B w-20 pl-1" bind:value={$treeOpts.leftIndent} />
    </div>
    <div class="field">
      <label for="lineHeight">--tree-view-li-line-height</label>
      <input id="lineHeight" class="bg-01 text-0B w-20 pl-1" bind:value={$treeOpts.lineHeight} />
    </div>
    <div class="field">
      <label for="fontFamily">--tree-view-font-family</label>
      <input id="fontFamily" class="bg-01 text-0B w-48 pl-1" bind:value={$treeOpts.fontFamily} />
    </div>
    <div class="field">
      <label for="fontSize">--tree-view-font-size</label>
      <input id="fontSize" class="bg-01 text-0B w-20 pl-1" bind:value={$treeOpts.fontSize} />
    </div>
    <div class="field">
      <label for="keyMarginRight">--tree-view-key-margin-right</label>
      <input
        id="keyMarginRight"
        class="bg-01 text-0B w-20 pl-1"
        bind:value={$treeOpts.keyMarginRight}
      />
    </div>
    <div class="field">
      <label for="showLogButton">showLogButton</label>
      <input id="showLogButton" type="checkbox" bind:checked={$treeOpts.showLogButton} />
    </div>
    <div class="field">
      <label for="showCopyButton">showCopyButton</label>
      <input id="showCopyButton" type="checkbox" bind:checked={$treeOpts.showCopyButton} />
    </div>
    <div class="field">
      <label>treeNode</label>
      <div
        class="text-0B rounded-sm px-1 py-0.5 text-xs tracking-wide transition-colors duration-100"
      >
        See Diff and Tailwind
      </div>
    </div>
  </div>
  <div class="m-2 mt-0 flex flex-col">
    <div class="col-field">
      <label for="recursionOpts">recursionOpts</label>
      <textarea
        id="recursionOpts"
        class="bg-01 text-0B h-44"
        value={$treeOpts.recursionOpts}
        oninput={e => update('recursionOpts', e.currentTarget.value)}
      ></textarea>
    </div>
    <div class="col-field">
      <label for="valueFormatter">valueFormatter</label>
      <textarea
        id="valueFormatter"
        class="bg-01 text-0B h-44"
        value={$treeOpts.valueFormatter}
        oninput={e => update('valueFormatter', e.currentTarget.value)}
      ></textarea>
    </div>
    <div class="col-field">
      <label for="theme">
        theme
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/reduxjs/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes"
          >examples</a
        >
      </label>
      <textarea
        id="theme"
        class="bg-01 text-0B h-44 w-full"
        value={$treeOpts.theme}
        oninput={e => update('theme', e.currentTarget.value)}
      ></textarea>
    </div>
  </div>
</fieldset>

<style lang="postcss">
  @reference "#app.css";

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }
  .field {
    @apply flex items-center;
  }
  .field > label {
    @apply mr-2;
  }
  .field + .field {
    @apply mt-2;
  }
  .col-field {
    @apply flex flex-col;
  }
  .col-field + .col-field {
    @apply mt-2;
  }
  .col-field > label {
    @apply mb-2;
  }
  textarea {
    @apply p-2;
  }
</style>
