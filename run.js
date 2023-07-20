import { exec } from 'node:child_process'

async function run() {
  const controller = new AbortController()
  const { signal } = controller
  exec('pnpm --filter site dev', { signal }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
  })
  exec('pnpm --filter svelte-tree-view cy run --browser=chrome --config baseUrl=http://localhost:5185', { signal }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    console.log('HELLO', stdout)
    controller.abort()
  })
}

run()
