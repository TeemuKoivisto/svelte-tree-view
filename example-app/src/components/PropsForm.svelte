<script>
  export let leftIndent,
    showLogButton,
    showCopyButton,
    valueComponent,
    recursionOpts,
    valueFormatter,
    theme
</script>

<fieldset class="container-sm flex flex-col border-2 p-2 text-sm">
  <legend class="px-2 text-0A text-base">Available props</legend>
  <div class="m-2 mt-0">
    <div class="field">
      <label for="leftIndent">--tree-view-left-indent</label>
      <input id="leftIndent" class="w-20 pl-1 bg-01 text-0B" bind:value={leftIndent}/>
    </div>
    <div class="field">
      <label for="showLogButton">showLogButton</label>
      <input id="showLogButton" type="checkbox" bind:checked={showLogButton}/>
    </div>
    <div class="field">
      <label for="showCopyButton">showCopyButton</label>
      <input id="showCopyButton" type="checkbox" bind:checked={showCopyButton}/>
    </div>
    <div class="field">
      <label>valueComponent</label>
      <button class="btn-example">example</button>
    </div>
  </div>
  <div class="flex flex-col m-2 mt-0">
    <div class="col-field">
      <label for="recursionOpts">recursionOpts</label>
      <textarea id="recursionOpts" class="h-44 bg-01 text-0B" bind:value={recursionOpts}></textarea>
    </div>
    <div class="col-field">
      <label for="valueFormatter">valueFormatter</label>
      <textarea id="valueFormatter" class="h-44 bg-01 text-0B" bind:value={valueFormatter}></textarea>
    </div>
    <div class="col-field">
      <label for="theme">
        theme
        <a target="_blank" href="https://github.com/reduxjs/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes">examples</a>
      </label>
      <textarea id="theme" class="w-full h-44 bg-01 text-0B" bind:value={theme}></textarea>
    </div>
  </div>
</fieldset>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
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
  .btn-example {
    background-color: var(--tree-view-base02);
    color: var(--tree-view-base0B);

    @apply px-1 py-0.5 rounded-sm transition-colors duration-100 tracking-wide text-xs;
  }
</style>