import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))
}

test('manifest uses English default metadata with Simplified Chinese localization', async () => {
  const manifest = await readJson('../public/manifest.json')
  const english = await readJson('../public/_locales/en/messages.json')
  const chinese = await readJson('../public/_locales/zh_CN/messages.json')

  assert.equal(manifest.default_locale, 'en')
  assert.equal(manifest.name, '__MSG_appName__')
  assert.equal(manifest.description, '__MSG_appDescription__')
  assert.equal(english.appName.message, 'Pomelo Tab')
  assert.match(english.appDescription.message, /new tab/i)
  assert.equal(chinese.appName.message, 'Pomelo Tab')
  assert.match(chinese.appDescription.message, /新标签页/)
})
