module.exports = {
  mode: 'jit',
  theme: {
    extend: {},
  },
  variants: {},
  darkMode: 'class',
  purge: ['./src/**/*.svelte'],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  plugins: [],
}
