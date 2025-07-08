import { defineConfig } from 'cypress'

let shouldSkip = false

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5185',
    setupNodeEvents(on, config) {
      on('task', {
        resetShouldSkipFlag() {
          shouldSkip = false
          return null
        },
        shouldSkip(value) {
          if (value != null) shouldSkip = value
          return shouldSkip
        }
      })
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--hide-scrollbars')
          launchOptions.args.push('--high-dpi-support')
          launchOptions.args.push('--window-size=1280,800')
        }
        return launchOptions
      })
    }
  }
})
