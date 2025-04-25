#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

// Read package.json to get the current version
const packageJsonPath = path.resolve(import.meta.dirname, '../package.json')
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
const version = packageJson.version

// Path to the index.js file
const indexPath = path.resolve(import.meta.dirname, '../src/index.js')

// Read the current content
let content = await fs.readFile(indexPath, 'utf8')

// Replace the version in the USER_AGENT constant
const updatedContent = content.replace(
  /const USER_AGENT = 'picosanity@[^\s]+'/,
  `const USER_AGENT = 'picosanity@${version}'`,
)

// Write the updated content back to the file
await fs.writeFile(indexPath, updatedContent, 'utf8')

console.log(`Updated version in src/index.js to picosanity@${version}`)
