import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

test('Quick Access allows 20 shortcuts and guards both add entry points', async () => {
  const source = await read('../src/main.ts')

  assert.match(source, /const shortcutLimit = 20/)
  assert.match(source, /state\.shortcuts\.length < shortcutLimit/)
  assert.match(source, /state\.shortcuts\.length >= shortcutLimit/)
})

test('Quick Access wraps fixed-size tiles according to available width', async () => {
  const styles = await read('../src/style.css')
  const compactSection = styles.slice(styles.indexOf('/* Compact Quick Access and single-screen workspace */'))

  assert.match(compactSection, /\.quick-grid\{[^}]*display:grid;[^}]*grid-template-columns:repeat\(auto-fill,156px\);[^}]*gap:8px/)
  assert.match(compactSection, /\.quick-grid \.quick-item,\.quick-grid \.quick-add\{width:156px;height:54px/)
  assert.doesNotMatch(compactSection, /flex-wrap:nowrap/)
  assert.doesNotMatch(compactSection, /\.quick-grid \.quick-item,\.quick-grid \.quick-add\{width:(?:132px|100%)/)
})

test('Chrome Web Store copy advertises the 20-shortcut capacity', async () => {
  const guide = await read('../docs/chrome-web-store-submission-guide.md')

  assert.match(guide, /Create up to 20 Quick Access shortcuts/)
  assert.match(guide, /添加最多 20 个 Quick Access 快捷入口/)
  assert.doesNotMatch(guide, /up to eight Quick Access shortcuts/)
  assert.doesNotMatch(guide, /最多 8 个 Quick Access 快捷入口/)
})
