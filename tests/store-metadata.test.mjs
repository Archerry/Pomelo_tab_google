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
  assert.equal(manifest.version, '1.0.2')
  assert.equal(manifest.name, '__MSG_appName__')
  assert.equal(manifest.description, '__MSG_appDescription__')
  assert.equal(english.appName.message, 'Pomelo Tab')
  assert.match(english.appDescription.message, /new tab/i)
  assert.equal(chinese.appName.message, 'Pomelo Tab')
  assert.match(chinese.appDescription.message, /新标签页/)
})

test('submission guide uses the current extension version', async () => {
  const guide = await readFile(new URL('../docs/chrome-web-store-submission-guide.md', import.meta.url), 'utf8')

  assert.match(guide, /pomelo-tab-v1\.0\.2\.zip/)
  assert.doesNotMatch(guide, /1\.0\.1/)
  assert.doesNotMatch(guide, /1\.0\.0/)
})

test('new-tab search respects Chrome search settings without overriding them', async () => {
  const manifest = await readJson('../public/manifest.json')
  const source = await readFile(new URL('../src/main.ts', import.meta.url), 'utf8')
  const guide = await readFile(new URL('../docs/chrome-web-store-submission-guide.md', import.meta.url), 'utf8')

  assert.ok(manifest.permissions.includes('search'))
  assert.equal(manifest.chrome_settings_overrides, undefined)
  assert.doesNotMatch(source, /google\.com\/search|Search Google/i)
  assert.match(source, /default provider/i)
  assert.match(guide, /Chrome Search API|chrome\.search/)
  assert.doesNotMatch(guide, /Search Google|使用 Google 搜索/)
  assert.match(guide, /Pomelo Tab's single purpose is to replace Chrome's new-tab page with one local workspace that helps users organize and resume their browsing\./)
})
