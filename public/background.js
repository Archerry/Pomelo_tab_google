const USAGE_KEY = 'pomelo-site-usage-v1'
const ALARM_NAME = 'pomelo-usage-tick'

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 })
})

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 })
})

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== ALARM_NAME) return
  const window = await chrome.windows.getLastFocused()
  if (!window.focused) return
  const [tab] = await chrome.tabs.query({ active: true, windowId: window.id })
  if (!tab?.url || !/^https?:\/\//.test(tab.url)) return
  const domain = new URL(tab.url).hostname.replace(/^www\./, '')
  if (!domain) return
  const day = new Date().toISOString().slice(0, 10)
  const stored = await chrome.storage.local.get(USAGE_KEY)
  const usage = stored[USAGE_KEY] || {}
  const entry = usage[domain] || { total: 0, days: {} }
  entry.total += 60
  entry.days[day] = (entry.days[day] || 0) + 60
  usage[domain] = entry
  await chrome.storage.local.set({ [USAGE_KEY]: usage })
})
