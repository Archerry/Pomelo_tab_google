import './style.css'
import { defaultState, loadState, saveState, type AppState } from './storage'
import { loadPrivacyConsent, savePrivacyConsent } from './privacy-consent'

let state: AppState = structuredClone(defaultState)
type OpenTab = { id: number; windowId: number; title: string; url: string; favicon: string; domain: string }
type LinkItem = { id: string; title: string; url: string; domain: string; meta?: string }
type ViewName = 'tabs' | 'bookmarks' | 'history' | 'insights'
type UsageEntry = { total: number; days: Record<string, number> }
let openTabs: OpenTab[] = []
let bookmarks: LinkItem[] = []
let historyItems: LinkItem[] = []
let siteUsage: Record<string, UsageEntry> = {}
let activeView: ViewName = 'tabs'
let librarySearch = ''
let usagePeriod: '7' | '30' | 'all' = '7'
let editingShortcutId: string | null = null
let privacyConsentGranted = false
let clockTimer = 0
let tabListenersBound = false
const usageKey = 'pomelo-site-usage-v1'
const shortcutLimit = 8
const shortcutNameLimit = 12

const app = document.querySelector<HTMLDivElement>('#app')!

function icon(name: 'search' | 'plus' | 'check' | 'trash' | 'settings' | 'sun' | 'moon' | 'tabs' | 'arrow' | 'spark' | 'bookmark' | 'history' | 'grid' | 'close' | 'more') {
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.94 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.57 15 1.7 1.7 0 0 0 3 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.57 1.7 1.7 0 0 0 10 3h4v.08a1.7 1.7 0 0 0 1.06 1.52 1.7 1.7 0 0 0 1.88-.34L17 4.2 19.8 7l-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 21 10h.08v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    moon: '<path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z"/>',
    tabs: '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M7 5V3h14v14h-4"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    spark: '<path d="m12 3 1.2 4.1a5 5 0 0 0 3.4 3.4l4.1 1.2-4.1 1.2a5 5 0 0 0-3.4 3.4L12 20.4l-1.2-4.1a5 5 0 0 0-3.4-3.4l-4.1-1.2 4.1-1.2a5 5 0 0 0 3.4-3.4L12 3Z"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"/><path d="M12 7v5l3 2"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    close: '<path d="m7 7 10 10M17 7 7 17"/>',
    more: '<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`
}

function pomeloMark() {
  return `<svg viewBox="0 0 128 128" aria-hidden="true">
    <rect x="14" y="14" width="100" height="100" rx="31" fill="#684386" stroke="none"/>
    <path d="M64 64V28A36 36 0 0 0 32.8 82Z" fill="#b48bc5" stroke="#fffdfa" stroke-width="5.5" stroke-linejoin="round"/>
    <path d="M64 64 32.8 82A36 36 0 0 0 64 100Z" fill="#d8a4c4" stroke="#fffdfa" stroke-width="5.5" stroke-linejoin="round"/>
    <path d="M64 64V28A36 36 0 0 1 95.2 46Z" fill="#f29a61" stroke="#fffdfa" stroke-width="5.5" stroke-linejoin="round"/>
    <path d="M64 64 95.2 46A36 36 0 0 1 95.2 82Z" fill="#eb8b4f" stroke="#fffdfa" stroke-width="5.5" stroke-linejoin="round"/>
    <path d="M64 64 95.2 82A36 36 0 0 1 64 100Z" fill="#f2bda7" stroke="#fffdfa" stroke-width="5.5" stroke-linejoin="round"/>
    <circle cx="64" cy="64" r="36" fill="none" stroke="#fffdfa" stroke-width="6.5"/>
  </svg>`
}

function escapeHtml(value: string) {
  const el = document.createElement('div')
  el.textContent = value
  return el.innerHTML
}

function domainOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') || '本地页面' } catch { return '其他' }
}

async function loadOpenTabs() {
  if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
    const tabs = await chrome.tabs.query({})
    openTabs = tabs
      .filter(tab => tab.id != null && tab.url && !tab.url.startsWith('chrome://newtab'))
      .map(tab => ({ id: tab.id!, windowId: tab.windowId ?? 0, title: tab.title || '无标题', url: tab.url!, favicon: tab.favIconUrl || '', domain: domainOf(tab.url!) }))
  } else {
    openTabs = [
      { id: 1, windowId: 1, title: 'Pomelo 产品设计稿', url: 'https://figma.com/design/pomelo', favicon: '', domain: 'figma.com' },
      { id: 2, windowId: 1, title: 'Design system components', url: 'https://figma.com/design/system', favicon: '', domain: 'figma.com' },
      { id: 3, windowId: 1, title: 'Homepage explorations', url: 'https://figma.com/design/homepage', favicon: '', domain: 'figma.com' },
      { id: 4, windowId: 1, title: 'Chrome Extensions documentation', url: 'https://developer.chrome.com/docs/extensions', favicon: '', domain: 'developer.chrome.com' },
      { id: 5, windowId: 1, title: 'Tabs API reference', url: 'https://developer.chrome.com/docs/extensions/reference/api/tabs', favicon: '', domain: 'developer.chrome.com' },
      { id: 6, windowId: 1, title: 'Publish in the Chrome Web Store', url: 'https://developer.chrome.com/docs/webstore/publish', favicon: '', domain: 'developer.chrome.com' },
      { id: 7, windowId: 1, title: 'Pull requests · Pomelo', url: 'https://github.com/pomelo/pulls', favicon: '', domain: 'github.com' },
      { id: 8, windowId: 1, title: 'Issues · Pomelo', url: 'https://github.com/pomelo/issues', favicon: '', domain: 'github.com' },
      { id: 9, windowId: 1, title: 'Pomelo Launch Notes', url: 'https://notion.so/pomelo-launch', favicon: '', domain: 'notion.so' },
      { id: 10, windowId: 1, title: 'Product roadmap', url: 'https://notion.so/pomelo-roadmap', favicon: '', domain: 'notion.so' },
      { id: 11, windowId: 1, title: 'Ambient Focus Mix', url: 'https://youtube.com/watch', favicon: '', domain: 'youtube.com' },
    ]
  }
}

function flattenBookmarks(nodes: Array<{ id: string; title: string; url?: string; children?: Array<unknown> }>, output: LinkItem[] = []) {
  for (const node of nodes) {
    if (node.url) output.push({ id: node.id, title: node.title || node.url, url: node.url, domain: domainOf(node.url) })
    if (node.children) flattenBookmarks(node.children as Array<{ id: string; title: string; url?: string; children?: Array<unknown> }>, output)
  }
  return output
}

async function loadLibraryData() {
  if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.history) {
    const [tree, recent] = await Promise.all([
      chrome.bookmarks.getTree(),
      chrome.history.search({ text: '', maxResults: 160, startTime: Date.now() - 1000 * 60 * 60 * 24 * 30 }),
    ])
    bookmarks = flattenBookmarks(tree)
    historyItems = recent.filter(item => item.url).map(item => ({ id: item.id, title: item.title || item.url!, url: item.url!, domain: domainOf(item.url!), meta: item.lastVisitTime ? new Date(item.lastVisitTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '' }))
  } else {
    bookmarks = [
      { id: 'b1', title: 'Type scale experiments', url: 'https://type-scale.com', domain: 'type-scale.com' },
      { id: 'b2', title: 'Design resources', url: 'https://figma.com/community', domain: 'figma.com' },
      { id: 'b3', title: 'Chrome API reference', url: 'https://developer.chrome.com/docs/extensions/reference/api', domain: 'developer.chrome.com' },
    ]
    historyItems = openTabs.slice(0, 8).map((tab, index) => ({ id: `h${index}`, title: tab.title, url: tab.url, domain: tab.domain, meta: index < 3 ? 'Today' : 'Yesterday' }))
  }
}

function siteFavicon(url: string, size = 32) {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    const favicon = new URL(chrome.runtime.getURL('/_favicon/'))
    favicon.searchParams.set('pageUrl', url)
    favicon.searchParams.set('size', String(size))
    return favicon.toString()
  }
  try { return new URL('/favicon.ico', url).toString() } catch { return '' }
}

function tabsMarkup() {
  const query = librarySearch.toLowerCase()
  const filtered = openTabs.filter(tab => `${tab.title} ${tab.domain}`.toLowerCase().includes(query))
  const groups = new Map<string, OpenTab[]>()
  filtered.forEach(tab => groups.set(tab.domain, [...(groups.get(tab.domain) ?? []), tab]))
  if (!filtered.length) return '<div class="tabs-empty"><span>⌕</span><p>No matching tabs</p></div>'
  return [...groups].map(([domain, tabs]) => `
    <section class="domain-collection">
      <div class="collection-head"><span class="domain-icon"><span>${escapeHtml(domain.charAt(0).toUpperCase())}</span><img class="domain-favicon" src="${escapeHtml(siteFavicon(`https://${domain}`, 32))}" alt=""/></span><div><strong>${escapeHtml(domain)}</strong><small>${tabs.length} ${tabs.length === 1 ? 'tab' : 'tabs'}</small></div></div>
      <div class="collection-tabs">${tabs.map(tab => `<button class="tab-item" data-tab-id="${tab.id}" data-window-id="${tab.windowId}" data-url="${escapeHtml(tab.url)}" title="${escapeHtml(tab.url)}">
        <span class="favicon">${tab.favicon ? `<img src="${escapeHtml(tab.favicon)}" alt=""/>` : escapeHtml(tab.domain.charAt(0).toUpperCase())}</span>
        <span class="tab-copy"><strong>${escapeHtml(tab.title)}</strong><small>Window ${tab.windowId} · ${escapeHtml(tab.url.replace(/^https?:\/\//, '').split('/')[0])}</small></span>
        <span class="tab-actions"><span class="tab-arrow">${icon('arrow')}</span><span class="close-tab" data-close-tab="${tab.id}" title="Close tab">${icon('close')}</span></span>
      </button>`).join('')}</div>
    </section>`).join('')
}

function linksMarkup(items: LinkItem[]) {
  const query = librarySearch.toLowerCase()
  const filtered = items.filter(item => `${item.title} ${item.domain}`.toLowerCase().includes(query))
  const groups = new Map<string, LinkItem[]>()
  filtered.forEach(item => groups.set(item.domain, [...(groups.get(item.domain) ?? []), item]))
  if (!filtered.length) return '<div class="tabs-empty"><span>⌕</span><p>No matching items</p></div>'
  return [...groups].map(([domain, links]) => `<section class="domain-collection">
    <div class="collection-head"><span class="domain-icon"><span>${escapeHtml(domain.charAt(0).toUpperCase())}</span><img class="domain-favicon" src="${escapeHtml(siteFavicon(`https://${domain}`, 32))}" alt=""/></span><div><strong>${escapeHtml(domain)}</strong><small>${links.length} ${links.length === 1 ? 'item' : 'items'}</small></div></div>
    <div class="collection-tabs">${links.map(link => `<a class="tab-item link-item" href="${escapeHtml(link.url)}"><span class="favicon"><img src="${escapeHtml(siteFavicon(link.url))}" alt=""/></span><span class="tab-copy"><strong>${escapeHtml(link.title)}</strong><small>${escapeHtml(link.meta || domain)}</small></span><span class="tab-arrow">${icon('arrow')}</span></a>`).join('')}</div>
  </section>`).join('')
}

function shortcutsMarkup() {
  const query = librarySearch.toLowerCase()
  const items = state.shortcuts.filter(item => `${item.name} ${item.url}`.toLowerCase().includes(query))
  return `<div class="shortcut-collection">${items.map(item => `<a class="shortcut large-shortcut" href="${escapeHtml(item.url)}"><span class="shortcut-icon"><span>${escapeHtml(item.name.charAt(0).toUpperCase())}</span><img class="site-icon" src="${escapeHtml(siteFavicon(item.url, 48))}" alt=""/></span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(domainOf(item.url))}</small></a>`).join('')}<button class="add-tile" id="add-shortcut">${icon('plus')}<span>Add shortcut</span></button></div>`
}

function currentContent() {
  if (activeView === 'tabs') return tabsMarkup()
  if (activeView === 'bookmarks') return linksMarkup(bookmarks)
  if (activeView === 'history') return linksMarkup(historyItems)
  return insightsMarkup()
}

function usageSeconds(entry: UsageEntry) {
  if (usagePeriod === 'all') return entry.total
  const cutoff = Date.now() - Number(usagePeriod) * 86400000
  return Object.entries(entry.days).reduce((sum, [day, seconds]) => sum + (new Date(`${day}T00:00:00`).getTime() >= cutoff ? seconds : 0), 0)
}

function formatDuration(seconds: number) {
  if (seconds < 60) return '< 1m'
  const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60)
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

function insightsMarkup() {
  const rows = Object.entries(siteUsage).map(([domain, entry]) => ({ domain, seconds: usageSeconds(entry) })).filter(item => item.seconds > 0).sort((a, b) => b.seconds - a.seconds)
  const max = rows[0]?.seconds || 1
  const total = rows.reduce((sum, item) => sum + item.seconds, 0)
  return `<div class="insights-view">
    <div class="insights-summary"><div><span>Total browsing</span><strong>${formatDuration(total)}</strong></div><div><span>Sites visited</span><strong>${rows.length}</strong></div><div class="period-switch">${(['7','30','all'] as const).map(period => `<button data-period="${period}" class="${usagePeriod === period ? 'active' : ''}">${period === 'all' ? 'All time' : `${period} days`}</button>`).join('')}</div></div>
    <div class="usage-list">${rows.length ? rows.slice(0, 30).map((item, index) => `<div class="usage-row"><span class="usage-rank">${String(index + 1).padStart(2, '0')}</span><span class="usage-domain"><span class="favicon"><img src="${escapeHtml(siteFavicon(`https://${item.domain}`))}" alt=""/></span><strong>${escapeHtml(item.domain)}</strong></span><span class="usage-track"><i style="--usage:${Math.max(4, item.seconds / max * 100)}%"></i></span><span class="usage-time">${formatDuration(item.seconds)}</span></div>`).join('') : '<div class="tabs-empty"><span>◷</span><p>Usage data will appear as you browse</p></div>'}</div>
  </div>`
}

async function loadUsage() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get(usageKey); siteUsage = (result[usageKey] as Record<string, UsageEntry>) || {}
  } else {
    siteUsage = {
      'github.com': { total: 18420, days: { [new Date().toISOString().slice(0,10)]: 4260 } },
      'figma.com': { total: 13200, days: { [new Date().toISOString().slice(0,10)]: 3180 } },
      'developer.chrome.com': { total: 8760, days: { [new Date().toISOString().slice(0,10)]: 2040 } },
      'notion.so': { total: 6540, days: { [new Date().toISOString().slice(0,10)]: 1380 } },
    }
  }
}

type CommandItem = { kind: string; title: string; meta: string; url?: string; tabId?: number; windowId?: number; action?: 'theme' | 'settings' }
function commandItems(query = ''): CommandItem[] {
  const items: CommandItem[] = [
    ...openTabs.map(tab => ({ kind: 'TAB', title: tab.title, meta: `${tab.domain} · Window ${tab.windowId}`, tabId: tab.id, windowId: tab.windowId })),
    ...bookmarks.map(item => ({ kind: 'BOOKMARK', title: item.title, meta: item.domain, url: item.url })),
    ...historyItems.map(item => ({ kind: 'HISTORY', title: item.title, meta: item.domain, url: item.url })),
    ...state.shortcuts.map(item => ({ kind: 'SHORTCUT', title: item.name, meta: domainOf(item.url), url: item.url })),
    { kind: 'ACTION', title: 'Toggle appearance', meta: 'Switch light or dark theme', action: 'theme' },
    { kind: 'ACTION', title: 'Open settings', meta: 'Personalize Pomelo', action: 'settings' },
  ]
  const normalized = query.trim().toLowerCase()
  return (normalized ? items.filter(item => `${item.title} ${item.meta} ${item.kind}`.toLowerCase().includes(normalized)) : items).slice(0, 12) as CommandItem[]
}

function commandMarkup(query = '') {
  const items = commandItems(query)
  const kindIcon = (kind: string) => kind === 'TAB' ? icon('tabs') : kind === 'BOOKMARK' ? icon('bookmark') : kind === 'HISTORY' ? icon('history') : kind === 'SHORTCUT' ? icon('grid') : icon('spark')
  return items.length ? items.map((item, index) => `<button class="command-item kind-${item.kind.toLowerCase()} ${index === 0 ? 'selected' : ''}" data-command-index="${index}"><span class="command-kind">${kindIcon(item.kind)}<em>${item.kind}</em></span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></span><kbd>↵</kbd></button>`).join('') : '<div class="command-empty">No results</div>'
}

function render() {
  document.documentElement.dataset.theme = state.theme
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Pomelo 首页"><span class="brand-mark">${pomeloMark()}</span><span>pomelo<span class="brand-dot">.</span></span></a>
        <nav class="view-nav" aria-label="Library views">
          <button data-view="tabs" class="${activeView === 'tabs' ? 'active' : ''}">${icon('tabs')}<span>Open tabs</span></button>
          <button data-view="bookmarks" class="${activeView === 'bookmarks' ? 'active' : ''}">${icon('bookmark')}<span>Bookmarks</span></button>
          <button data-view="history" class="${activeView === 'history' ? 'active' : ''}">${icon('history')}<span>History</span></button>
          <button data-view="insights" class="${activeView === 'insights' ? 'active' : ''}">${icon('spark')}<span>Insights</span></button>
        </nav>
        <div class="top-actions">
          <button class="command-trigger" id="command-trigger">${icon('search')}<span>Search everything</span><kbd>⌘ K</kbd></button>
          <button class="icon-button" id="theme" aria-label="切换主题">${icon(state.theme === 'light' ? 'moon' : 'sun')}</button>
          <button class="icon-button" id="settings" aria-label="设置">${icon('settings')}</button>
        </div>
      </header>

      <section class="hero">
        <div class="hero-orbit orbit-one"></div><div class="hero-orbit orbit-two"></div>
        <p class="date" id="date"></p>
        <div class="hero-title"><h1><span id="greeting"></span>${state.name ? `, ${escapeHtml(state.name)}` : ''}</h1><p class="time" id="time"></p></div>
        <form class="search" id="search-form">
          ${icon('search')}
          <input id="search-input" autocomplete="off" placeholder="Search Google or enter a URL" aria-label="Search Google or enter a URL" />
          <span class="search-spark">${icon('spark')}</span><kbd>↵</kbd>
        </form>
        <section class="quick-access">
          <div class="quick-access-head"><span>Quick access</span></div>
          <div class="quick-grid">
            ${state.shortcuts.map(item => `<div class="quick-item"><a href="${escapeHtml(item.url)}" title="${escapeHtml(item.name)}"><span class="mini-favicon"><span>${escapeHtml(item.name.charAt(0).toUpperCase())}</span><img class="site-icon" src="${escapeHtml(siteFavicon(item.url, 48))}" alt=""/></span><strong>${escapeHtml(item.name)}</strong></a><button class="quick-more" data-shortcut-more aria-expanded="false" aria-label="Manage ${escapeHtml(item.name)}">${icon('more')}</button><div class="shortcut-menu" data-shortcut-menu hidden><button data-edit-shortcut="${item.id}">${icon('settings')}<span>Edit</span></button><button data-delete-shortcut="${item.id}">${icon('trash')}<span>Delete</span></button></div></div>`).join('')}
            ${state.shortcuts.length < shortcutLimit ? `<button id="add-shortcut" class="quick-add" title="Add shortcut">${icon('plus')}<span>Add shortcut</span></button>` : ''}
          </div>
        </section>
      </section>

      <section class="workspace single-workspace">
        <article class="panel library-panel reveal" style="--delay:0ms">
          <div class="panel-heading tabs-heading"><h2>${activeView === 'tabs' ? 'Open tabs' : activeView === 'bookmarks' ? 'Bookmarks' : activeView === 'history' ? 'Recent history' : 'Usage insights'}</h2></div>
          ${activeView === 'insights' ? '' : `<label class="tab-search">${icon('search')}<input id="tab-search" value="${escapeHtml(librarySearch)}" placeholder="Search this view"/><kbd>/</kbd></label>`}
          <div class="tab-groups view-content${activeView === 'insights' ? ' insights-content' : ''}" id="tab-groups">${currentContent()}</div>
        </article>
      </section>
    </main>

    <dialog id="shortcut-dialog"><form id="shortcut-form" novalidate><div class="dialog-head"><div><span class="eyebrow" id="shortcut-mode">NEW SHORTCUT</span><h2 id="shortcut-title">Add shortcut</h2></div><button type="button" data-close-dialog="shortcut-dialog" class="close" aria-label="Close">×</button></div><label><span class="field-label-row"><span>Name</span><small class="field-count" id="shortcut-name-count" aria-live="polite">0 / ${shortcutNameLimit}</small></span><input name="name" maxlength="${shortcutNameLimit}" required placeholder="e.g. GitHub"/><small class="field-error" aria-live="polite"></small></label><label>URL<input name="url" inputmode="url" required placeholder="https://example.com"/><small class="field-error" aria-live="polite"></small></label><div class="dialog-actions"><button type="button" data-close-dialog="shortcut-dialog" class="secondary">Cancel</button><button type="submit" id="save-shortcut">Save</button></div></form></dialog>
    <dialog id="settings-dialog"><form id="settings-form"><div class="dialog-head"><div><span class="eyebrow">PREFERENCES</span><h2>Settings</h2></div><button type="button" data-close-dialog="settings-dialog" class="close" aria-label="Close">×</button></div><label>Your name<input name="name" maxlength="20" value="${escapeHtml(state.name)}" placeholder="Used in the greeting"/></label><section class="privacy-control"><div><strong>Browser data access</strong><small>Pause access and delete locally stored usage insights.</small></div><button type="button" id="pause-browser-access">Pause access</button></section><section class="danger-zone"><div><strong>Browsing usage</strong><small>Delete all locally stored site usage statistics.</small></div><button type="button" id="clear-usage">Clear data</button></section><div class="dialog-actions"><button type="button" data-close-dialog="settings-dialog" class="secondary">Cancel</button><button type="submit" id="save-settings">Save</button></div></form></dialog>
    <dialog id="command-dialog" class="command-dialog"><div class="command-box"><div class="command-input">${icon('search')}<input id="command-input" autocomplete="off" placeholder="Search tabs, bookmarks, history and shortcuts"/><kbd>ESC</kbd></div><div class="command-results" id="command-results">${commandMarkup()}</div><footer><span>↑↓ Navigate</span><span>↵ Open</span><span>ESC Close</span></footer></div></dialog>
  `
  bindEvents()
  updateClock()
}

function bindEvents() {
  bindDynamicAssets()
  const closeShortcutMenus = () => {
    document.querySelectorAll<HTMLElement>('[data-shortcut-menu]').forEach(menu => { menu.hidden = true })
    document.querySelectorAll<HTMLButtonElement>('[data-shortcut-more]').forEach(button => { button.ariaExpanded = 'false' })
  }
  document.querySelectorAll<HTMLButtonElement>('[data-shortcut-more]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation()
    const menu = button.parentElement?.querySelector<HTMLElement>('[data-shortcut-menu]')
    const willOpen = Boolean(menu?.hidden)
    closeShortcutMenus()
    if (menu && willOpen) { menu.hidden = false; button.ariaExpanded = 'true' }
  }))
  document.onclick = event => {
    const target = event.target as HTMLElement
    if (!target.closest('[data-shortcut-menu]') && !target.closest('[data-shortcut-more]')) closeShortcutMenus()
  }
  document.querySelector('#theme')?.addEventListener('click', async () => {
    document.documentElement.classList.add('theme-changing')
    state.theme = state.theme === 'light' ? 'dark' : 'light'
    await saveState(state); render(); setTimeout(() => document.documentElement.classList.remove('theme-changing'), 650)
  })
  document.querySelector('#settings')?.addEventListener('click', () => (document.querySelector('#settings-dialog') as HTMLDialogElement).showModal())
  document.querySelector('#command-trigger')?.addEventListener('click', openCommand)
  document.querySelector('#add-shortcut')?.addEventListener('click', () => openShortcutDialog())
  document.querySelectorAll<HTMLElement>('[data-edit-shortcut]').forEach(button => button.addEventListener('click', () => {
    const item = state.shortcuts.find(shortcut => shortcut.id === button.dataset.editShortcut)
    closeShortcutMenus()
    if (item) openShortcutDialog(item)
  }))
  document.querySelectorAll<HTMLElement>('[data-delete-shortcut]').forEach(button => button.addEventListener('click', async () => {
    const item = state.shortcuts.find(shortcut => shortcut.id === button.dataset.deleteShortcut)
    closeShortcutMenus()
    if (!item || !window.confirm(`Delete “${item.name}” from Quick Access?`)) return
    state.shortcuts = state.shortcuts.filter(shortcut => shortcut.id !== item.id)
    await saveState(state); render()
  }))
  document.querySelectorAll<HTMLElement>('[data-close-dialog]').forEach(button => button.addEventListener('click', () => {
    const dialog = document.querySelector<HTMLDialogElement>(`#${button.dataset.closeDialog}`)
    const form = dialog?.querySelector<HTMLFormElement>('form')
    form?.reset(); clearFormErrors(form); editingShortcutId = null; dialog?.close()
  }))
  document.querySelectorAll<HTMLElement>('[data-view]').forEach(button => button.addEventListener('click', () => {
    activeView = button.dataset.view as ViewName; librarySearch = ''; render()
  }))
  document.querySelectorAll<HTMLElement>('[data-period]').forEach(button => button.addEventListener('click', () => {
    usagePeriod = button.dataset.period as typeof usagePeriod; render()
  }))
  document.querySelector('#clear-usage')?.addEventListener('click', async () => {
    if (!window.confirm('Clear all locally stored browsing usage data? This cannot be undone.')) return
    siteUsage = {}
    if (typeof chrome !== 'undefined' && chrome.storage?.local) await chrome.storage.local.set({ [usageKey]: {} })
    ;(document.querySelector('#settings-dialog') as HTMLDialogElement)?.close(); render()
  })
  document.querySelector('#pause-browser-access')?.addEventListener('click', async () => {
    if (!window.confirm('Pause browser data access and delete local usage insights?')) return
    privacyConsentGranted = false
    siteUsage = {}
    await savePrivacyConsent(false)
    if (typeof chrome !== 'undefined' && chrome.storage?.local) await chrome.storage.local.set({ [usageKey]: {} })
    renderPrivacyGate(true)
  })
  document.querySelector('#search-form')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const query = (document.querySelector('#search-input') as HTMLInputElement).value.trim()
    if (!query) return
    const looksLikeUrl = /^(https?:\/\/|localhost|([\w-]+\.)+[a-z]{2,})(\/|$)/i.test(query)
    location.href = looksLikeUrl ? (/^https?:\/\//i.test(query) ? query : `https://${query}`) : `https://www.google.com/search?q=${encodeURIComponent(query)}`
  })
  const tabInput = document.querySelector<HTMLInputElement>('#tab-search')
  tabInput?.addEventListener('input', () => {
    librarySearch = tabInput.value
    const groups = document.querySelector('#tab-groups')
    if (groups) { groups.classList.add('filtering'); groups.innerHTML = currentContent(); bindTabClicks(); bindDynamicAssets(); requestAnimationFrame(() => groups.classList.remove('filtering')) }
  })
  tabInput?.addEventListener('keydown', event => {
    const items = [...document.querySelectorAll<HTMLElement>('.tab-item')]
    if (!items.length) return
    const current = items.findIndex(item => item.classList.contains('keyboard-active'))
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault(); items.forEach(item => item.classList.remove('keyboard-active')); items[(current + 1) % items.length].classList.add('keyboard-active')
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault(); items.forEach(item => item.classList.remove('keyboard-active')); items[(current <= 0 ? items.length : current) - 1].classList.add('keyboard-active')
    } else if (event.key === 'Enter' && current >= 0) {
      event.preventDefault(); items[current].click()
    } else if (event.key === 'Escape') {
      tabInput.blur(); items.forEach(item => item.classList.remove('keyboard-active'))
    }
  })
  const shortcutNameInput = document.querySelector<HTMLInputElement>('#shortcut-form input[name="name"]')
  shortcutNameInput?.addEventListener('input', () => updateShortcutNameCount(shortcutNameInput))
  document.onkeydown = event => {
    if (event.key === 'Escape' && document.querySelector('[data-shortcut-menu]:not([hidden])')) { event.preventDefault(); closeShortcutMenus(); return }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommand() }
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault()
      const views: ViewName[] = ['tabs', 'bookmarks', 'history', 'insights']
      const direction = event.key === 'ArrowRight' ? 1 : -1
      activeView = views[(views.indexOf(activeView) + direction + views.length) % views.length]
      librarySearch = ''; render()
    }
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) {
      event.preventDefault(); document.querySelector<HTMLInputElement>('#tab-search')?.focus()
    }
  }
  bindTabClicks()
  bindCommandPalette()
  document.querySelector('#shortcut-form')?.addEventListener('submit', async event => {
    event.preventDefault()
    const form = document.querySelector('#shortcut-form') as HTMLFormElement
    if (!validateShortcutForm(form)) return
    const data = new FormData(form); let url = String(data.get('url')).trim()
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    const colors = ['#e75b4f', '#566d89', '#6f8054', '#8b6658', '#695c8e']
    const existing = state.shortcuts.find(item => item.id === editingShortcutId)
    if (existing) { existing.name = String(data.get('name')).trim(); existing.url = url }
    else state.shortcuts.push({ id: crypto.randomUUID(), name: String(data.get('name')).trim(), url, color: colors[state.shortcuts.length % colors.length] })
    editingShortcutId = null
    await saveState(state); (document.querySelector('#shortcut-dialog') as HTMLDialogElement)?.close(); render()
  })
  document.querySelector('#settings-form')?.addEventListener('submit', async event => {
    event.preventDefault()
    const data = new FormData(document.querySelector('#settings-form') as HTMLFormElement)
    state.name = String(data.get('name')).trim()
    await saveState(state); (document.querySelector('#settings-dialog') as HTMLDialogElement)?.close(); render()
  })
}

function clearFormErrors(form?: HTMLFormElement | null) {
  form?.querySelectorAll<HTMLInputElement>('input').forEach(input => { input.setCustomValidity(''); input.removeAttribute('aria-invalid') })
  form?.querySelectorAll<HTMLElement>('.field-error').forEach(error => { error.textContent = '' })
}

function openShortcutDialog(item?: AppState['shortcuts'][number]) {
  const dialog = document.querySelector<HTMLDialogElement>('#shortcut-dialog')
  const form = document.querySelector<HTMLFormElement>('#shortcut-form')
  if (!dialog || !form) return
  if (!item && state.shortcuts.length >= shortcutLimit) return
  editingShortcutId = item?.id ?? null; form.reset(); clearFormErrors(form)
  ;(form.elements.namedItem('name') as HTMLInputElement).value = item?.name ?? ''
  ;(form.elements.namedItem('url') as HTMLInputElement).value = item?.url ?? ''
  updateShortcutNameCount(form.elements.namedItem('name') as HTMLInputElement)
  const mode = document.querySelector('#shortcut-mode'); const title = document.querySelector('#shortcut-title')
  if (mode) mode.textContent = item ? 'EDIT SHORTCUT' : 'NEW SHORTCUT'
  if (title) title.textContent = item ? 'Edit shortcut' : 'Add shortcut'
  dialog.showModal(); requestAnimationFrame(() => (form.elements.namedItem('name') as HTMLInputElement).focus())
}

function validateShortcutForm(form: HTMLFormElement) {
  clearFormErrors(form)
  const name = form.elements.namedItem('name') as HTMLInputElement
  const urlInput = form.elements.namedItem('url') as HTMLInputElement
  if (!name.value.trim()) setFieldError(name, 'Enter a name.')
  else if (name.value.trim().length > shortcutNameLimit) setFieldError(name, `Use ${shortcutNameLimit} characters or fewer.`)
  if (!urlInput.value.trim()) setFieldError(urlInput, 'Enter a URL.')
  if (urlInput.value.trim()) {
    try {
      const value = /^https?:\/\//i.test(urlInput.value.trim()) ? urlInput.value.trim() : `https://${urlInput.value.trim()}`
      const url = new URL(value)
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error('Invalid URL')
    } catch { setFieldError(urlInput, 'Enter a valid website URL.') }
  }
  const firstInvalid = form.querySelector<HTMLInputElement>('[aria-invalid="true"]')
  firstInvalid?.focus()
  return !firstInvalid
}

function updateShortcutNameCount(input: HTMLInputElement) {
  const counter = document.querySelector<HTMLElement>('#shortcut-name-count')
  if (!counter) return
  counter.textContent = `${input.value.length} / ${shortcutNameLimit}`
  counter.classList.toggle('over-limit', input.value.trim().length > shortcutNameLimit)
}

function setFieldError(input: HTMLInputElement, message: string) {
  input.setCustomValidity(message); input.setAttribute('aria-invalid', 'true')
  const error = input.parentElement?.querySelector<HTMLElement>('.field-error')
  if (error) error.textContent = message
}

function bindDynamicAssets() {
  document.querySelectorAll<HTMLImageElement>('.site-icon, .link-item img, .domain-favicon').forEach(image => image.addEventListener('error', () => image.remove()))
}

function openCommand() {
  const dialog = document.querySelector<HTMLDialogElement>('#command-dialog')
  if (!dialog?.open) dialog?.showModal()
  requestAnimationFrame(() => document.querySelector<HTMLInputElement>('#command-input')?.focus())
}

function bindCommandPalette() {
  const input = document.querySelector<HTMLInputElement>('#command-input')
  const results = document.querySelector<HTMLElement>('#command-results')
  if (!input || !results) return
  const redraw = () => { results.innerHTML = commandMarkup(input.value); bindCommandResultClicks() }
  input.addEventListener('input', redraw)
  input.addEventListener('keydown', event => {
    const items = [...results.querySelectorAll<HTMLElement>('.command-item')]
    const current = items.findIndex(item => item.classList.contains('selected'))
    if (event.key === 'ArrowDown') { event.preventDefault(); items.forEach(item => item.classList.remove('selected')); items[(current + 1) % items.length]?.classList.add('selected') }
    if (event.key === 'ArrowUp') { event.preventDefault(); items.forEach(item => item.classList.remove('selected')); items[(current <= 0 ? items.length : current) - 1]?.classList.add('selected') }
    if (event.key === 'Enter') { event.preventDefault(); items[Math.max(0, current)]?.click() }
  })
  bindCommandResultClicks()
}

function bindCommandResultClicks() {
  document.querySelectorAll<HTMLElement>('[data-command-index]').forEach(button => button.addEventListener('click', async () => {
    const input = document.querySelector<HTMLInputElement>('#command-input')
    const item = commandItems(input?.value)[Number(button.dataset.commandIndex)]
    if (!item) return
    document.querySelector<HTMLDialogElement>('#command-dialog')?.close()
    if (item.tabId != null && typeof chrome !== 'undefined' && chrome.tabs?.update) {
      if (item.windowId != null && chrome.windows?.update) await chrome.windows.update(item.windowId, { focused: true })
      await chrome.tabs.update(item.tabId, { active: true }); return
    }
    if (item.url) { location.href = item.url; return }
    if (item.action === 'theme') { document.querySelector<HTMLElement>('#theme')?.click(); return }
    if (item.action === 'settings') document.querySelector<HTMLDialogElement>('#settings-dialog')?.showModal()
  }))
}

function bindTabClicks() {
  document.querySelectorAll<HTMLElement>('[data-close-tab]').forEach(close => close.addEventListener('click', async event => {
    event.preventDefault(); event.stopPropagation()
    if (typeof chrome !== 'undefined' && chrome.tabs?.remove) await chrome.tabs.remove(Number(close.dataset.closeTab))
  }))
  document.querySelectorAll<HTMLElement>('.tab-item').forEach(item => item.addEventListener('click', async () => {
    const tabId = Number(item.dataset.tabId); const windowId = Number(item.dataset.windowId)
    if (typeof chrome !== 'undefined' && chrome.tabs?.update) {
      try {
        if (chrome.windows?.update) await chrome.windows.update(windowId, { focused: true })
        await chrome.tabs.update(tabId, { active: true })
      } catch (error) {
        console.error('Unable to activate tab', error)
      }
      return
    }
    const url = item.dataset.url
    if (url) location.href = url
  }))
}

function updateClock() {
  const now = new Date()
  const hours = now.getHours()
  const greeting = hours < 6 ? 'Good night' : hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening'
  const time = document.querySelector('#time'); const date = document.querySelector('#date'); const greetingEl = document.querySelector('#greeting')
  if (time) time.textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (date) date.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  if (greetingEl) greetingEl.textContent = greeting
}

function renderPrivacyGate(paused = false) {
  document.documentElement.dataset.theme = state.theme
  app.innerHTML = `<main class="consent-shell">
    <header class="topbar consent-topbar">
      <a class="brand" href="#" aria-label="Pomelo Tab"><span class="brand-mark">${pomeloMark()}</span><span>pomelo<span class="brand-dot">.</span></span></a>
      <a class="consent-policy-link" href="./privacy.html" target="_blank" rel="noreferrer">Privacy policy ${icon('arrow')}</a>
    </header>
    <section class="privacy-gate ${paused ? 'is-paused' : ''}">
      <div class="privacy-mark-stage" aria-hidden="true"><span>${pomeloMark()}</span><i></i><i></i><i></i></div>
      <div class="privacy-gate-copy">
        <span class="eyebrow">${paused ? 'POMELO IS PAUSED' : 'PRIVATE BY DEFAULT'}</span>
        <h1>${paused ? 'Your browser data remains untouched.' : 'Your browser data stays on this device.'}</h1>
        <p>${paused ? 'Pomelo Tab is waiting for your permission. Enable it whenever you want the complete new-tab workspace.' : 'Pomelo Tab uses your open tabs, bookmarks, recent history, and active website domain to organize your workspace and calculate local usage insights.'}</p>
        <div class="privacy-promise"><span>${icon('check')}Stored only in Chrome on this device</span><span>${icon('check')}Never transmitted or sold</span><span>${icon('check')}Never used for advertising</span></div>
        <div class="consent-actions">
          ${paused ? '<button class="consent-primary" id="review-consent">Review and enable</button>' : '<button class="consent-primary" id="enable-consent">Enable Pomelo Tab</button><button class="consent-secondary" id="decline-consent">Not now</button>'}
        </div>
        <small class="consent-note">You can pause access and clear local usage insights at any time in Settings.</small>
      </div>
    </section>
  </main>`
  bindPrivacyGateEvents()
}

function bindPrivacyGateEvents() {
  document.querySelector('#enable-consent')?.addEventListener('click', async () => {
    await savePrivacyConsent(true)
    privacyConsentGranted = true
    await initializeWorkspace()
  })
  document.querySelector('#decline-consent')?.addEventListener('click', async () => {
    await savePrivacyConsent(false)
    privacyConsentGranted = false
    renderPrivacyGate(true)
  })
  document.querySelector('#review-consent')?.addEventListener('click', () => renderPrivacyGate())
}

function bindChromeTabListeners() {
  if (tabListenersBound || typeof chrome === 'undefined') return
  chrome.tabs?.onCreated?.addListener(refreshTabs)
  chrome.tabs?.onRemoved?.addListener(refreshTabs)
  chrome.tabs?.onUpdated?.addListener(refreshTabs)
  tabListenersBound = true
}

async function initializeWorkspace() {
  await loadOpenTabs()
  await Promise.all([loadLibraryData(), loadUsage()])
  render()
  bindChromeTabListeners()
}

Promise.all([loadState(), loadPrivacyConsent()]).then(async ([value, consent]) => {
  state = value
  privacyConsentGranted = consent
  if (!clockTimer) clockTimer = window.setInterval(updateClock, 1000)
  if (!privacyConsentGranted) { renderPrivacyGate(); return }
  await initializeWorkspace()
})

let refreshTimer = 0
function refreshTabs() {
  if (!privacyConsentGranted) return
  clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(async () => { await loadOpenTabs(); render() }, 120)
}
