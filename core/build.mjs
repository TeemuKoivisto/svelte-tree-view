#!/usr/bin/env node

import { promisify } from 'util'
import { exec as rawExec } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

const exec = promisify(rawExec)

const arg = process.argv[2]

async function readJson(path) {
  const pkg = await fs.readFile(path, 'utf-8').catch(err => console.error(err))
  if (!pkg) return undefined
  return JSON.parse(pkg)
}

async function cleanCurrentExports() {
  const pkg = await readJson('./package.json')
  pkg.exports = {}
  await fs.writeFile('./package.json', JSON.stringify(pkg, null, 2))
}

async function setExportsForDevelopment() {
  const pkg = await readJson('./package.json')
  pkg.exports = {
    '.': './src/lib/index.ts'
  }
  await fs.writeFile('./package.json', JSON.stringify(pkg, null, 2))
}

async function writePackageExports() {
  const oldPkg = await readJson('./package.json')
  const newPkg = await readJson('./package/package.json')
  oldPkg.exports = Object.keys(newPkg.exports).reduce((acc, key) => {
    const newPath = path.join('./package', newPkg.exports[key])
    acc[key] = `./${newPath}`
    return acc
  }, {})
  await fs.writeFile('./package.json', JSON.stringify(oldPkg, null, 2))
}

async function build() {
  await cleanCurrentExports()
  await exec('yarn build:pkg')
  await exec('yarn build:dist')
  await exec('rm ./package/.npmignore')
  await writePackageExports()
  await exec('rm ./package/package.json')
}

if (!arg) {
  build()
} else if (arg === 'dev') {
  setExportsForDevelopment()
} else {
  throw Error(`Unknown command '${arg}' for build.mjs, available commands: <none> | dev`)
}
