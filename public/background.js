const USAGE_KEY = 'pomelo-site-usage-v1'
const ALARM_NAME = 'pomelo-usage-tick'
const CONSENT_KEY = 'pomelo-privacy-consent-v1'

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 })
})

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 })
})

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== ALARM_NAME) return
  const stored = await chrome.storage.local.get([CONSENT_KEY, USAGE_KEY])
  if (stored[CONSENT_KEY] !== true) return
  const window = await chrome.windows.getLastFocused()
  if (!window.focused) return
  const [tab] = await chrome.tabs.query({ active: true, windowId: window.id })
  if (!tab?.url || !/^https?:\/\//.test(tab.url)) return
  const domain = new URL(tab.url).hostname.replace(/^www\./, '')
  if (!domain) return
  const day = new Date().toISOString().slice(0, 10)
  const usage = stored[USAGE_KEY] || {}
  const entry = usage[domain] || { total: 0, days: {} }
  entry.total += 60
  entry.days[day] = (entry.days[day] || 0) + 60
  usage[domain] = entry
  await chrome.storage.local.set({ [USAGE_KEY]: usage })
})
