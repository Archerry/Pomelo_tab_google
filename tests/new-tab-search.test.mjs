import assert from 'node:assert/strict'
import test from 'node:test'
import { directUrlFor, submitNewTabSearch } from '../src/new-tab-search.ts'

test('directUrlFor preserves URL navigation', () => {
  assert.equal(directUrlFor('example.com/docs'), 'https://example.com/docs')
  assert.equal(directUrlFor('https://example.com/docs'), 'https://example.com/docs')
  assert.equal(directUrlFor('localhost:5173'), 'https://localhost:5173')
  assert.equal(directUrlFor('privacy respecting search'), null)
})

test('ordinary text uses the supplied default-provider search operation', async () => {
  const calls = []
  await submitNewTabSearch('  privacy respecting search  ', {
    navigate: url => calls.push(['navigate', url]),
    search: async text => calls.push(['search', text]),
  })

  assert.deepEqual(calls, [['search', 'privacy respecting search']])
})

test('URL-like input navigates without invoking web search', async () => {
  const calls = []
  await submitNewTabSearch('example.com/docs', {
    navigate: url => calls.push(['navigate', url]),
    search: async text => calls.push(['search', text]),
  })

  assert.deepEqual(calls, [['navigate', 'https://example.com/docs']])
})

test('blank input does nothing', async () => {
  const calls = []
  await submitNewTabSearch('   ', {
    navigate: url => calls.push(['navigate', url]),
    search: async text => calls.push(['search', text]),
  })

  assert.deepEqual(calls, [])
})
