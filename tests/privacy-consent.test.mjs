import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  isPrivacyConsentGranted,
  privacyConsentKey,
} from '../src/privacy-consent.ts'

test('uses one stable privacy consent storage key', () => {
  assert.equal(privacyConsentKey, 'pomelo-privacy-consent-v1')
})

test('grants browser-data access only for literal true', () => {
  assert.equal(isPrivacyConsentGranted(true), true)
  assert.equal(isPrivacyConsentGranted(false), false)
  assert.equal(isPrivacyConsentGranted(undefined), false)
  assert.equal(isPrivacyConsentGranted('true'), false)
})

test('background checks consent before browser state', async () => {
  const source = await readFile(new URL('../public/background.js', import.meta.url), 'utf8')
  const consentCheck = source.indexOf("stored[CONSENT_KEY] !== true")
  const browserQuery = source.indexOf('chrome.windows.getLastFocused')

  assert.ok(consentCheck >= 0, 'background must exit when consent is not granted')
  assert.ok(browserQuery >= 0, 'background must query the focused window after consent')
  assert.ok(consentCheck < browserQuery, 'consent check must happen before browser state access')
})
