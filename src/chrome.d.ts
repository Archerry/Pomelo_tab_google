declare const chrome: {
  storage?: {
    local: {
      get(key: string): Promise<Record<string, unknown>>
      set(items: Record<string, unknown>): Promise<void>
    }
  }
  tabs?: {
    query(queryInfo: Record<string, unknown>): Promise<Array<{ id?: number; windowId?: number; title?: string; url?: string; favIconUrl?: string; active?: boolean }>>
    update(tabId: number, updateProperties: { active: boolean }): Promise<unknown>
    remove(tabId: number): Promise<void>
    onCreated: { addListener(callback: () => void): void }
    onRemoved: { addListener(callback: () => void): void }
    onUpdated: { addListener(callback: () => void): void }
  }
  windows?: {
    update(windowId: number, updateInfo: { focused: boolean }): Promise<unknown>
  }
  runtime?: {
    getURL(path: string): string
  }
  bookmarks?: {
    getTree(): Promise<Array<{ id: string; title: string; url?: string; children?: Array<unknown> }>>
  }
  history?: {
    search(query: { text: string; maxResults: number; startTime?: number }): Promise<Array<{ id: string; title?: string; url?: string; lastVisitTime?: number }>>
  }
}
