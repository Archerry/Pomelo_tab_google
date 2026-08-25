import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const issuesUrl = 'https://github.com/Archerry/Pomelo_tab_google/issues'

test('packaged and hosted privacy policies are identical and publishable', async () => {
  const packaged = await readFile(new URL('../public/privacy.html', import.meta.url), 'utf8')
  const hosted = await readFile(new URL('../docs/privacy.html', import.meta.url), 'utf8')
  const markdown = await readFile(new URL('../PRIVACY.md', import.meta.url), 'utf8')

  assert.equal(hosted, packaged)
  assert.match(hosted, /<title>Pomelo Tab Privacy Policy<\/title>/)
  assert.ok(hosted.includes(issuesUrl))
  assert.ok(markdown.includes(issuesUrl))
  assert.doesNotMatch(`${hosted}\n${markdown}`, /REPLACE BEFORE PUBLISHING|PUBLISHER SUPPORT EMAIL/)
})

test('Pages root redirects to the canonical policy', async () => {
  const index = await readFile(new URL('../docs/index.html', import.meta.url), 'utf8')
  assert.match(index, /url=privacy\.html/)
  assert.match(index, /href="\.\/privacy\.html"/)
})
