export type Shortcut = { id: string; name: string; url: string; color: string }
export type Todo = { id: string; text: string; done: boolean }

export type AppState = {
  name: string
  theme: 'light' | 'dark'
  shortcuts: Shortcut[]
  todos: Todo[]
}

export const defaultState: AppState = {
  name: '',
  theme: 'light',
  shortcuts: [
    { id: '1', name: 'Gmail', url: 'https://mail.google.com', color: '#e75b4f' },
    { id: '2', name: 'YouTube', url: 'https://youtube.com', color: '#f24b40' },
    { id: '3', name: 'GitHub', url: 'https://github.com', color: '#20252b' },
    { id: '4', name: 'Notion', url: 'https://notion.so', color: '#6f716f' },
  ],
  todos: [],
}

const key = 'pomelo-state-v1'

export async function loadState(): Promise<AppState> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get(key)
    return { ...defaultState, ...(result[key] as Partial<AppState> | undefined) }
  }
  const saved = localStorage.getItem(key)
  return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState
}

export async function saveState(state: AppState) {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [key]: state })
    return
  }
  localStorage.setItem(key, JSON.stringify(state))
}
