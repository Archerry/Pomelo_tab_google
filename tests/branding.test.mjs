import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('inline Pomelo field explicitly disables inherited SVG strokes', async () => {
  const source = await readFile(new URL('../src/main.ts', import.meta.url), 'utf8')
  assert.match(source, /<rect x="14" y="14" width="100" height="100" rx="31" fill="#684386" stroke="none"\/\>/)
})
