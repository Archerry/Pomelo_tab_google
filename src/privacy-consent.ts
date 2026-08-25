export const privacyConsentKey = 'pomelo-privacy-consent-v1'

export function isPrivacyConsentGranted(value: unknown) {
  return value === true
}

export async function loadPrivacyConsent() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get(privacyConsentKey)
    return isPrivacyConsentGranted(result[privacyConsentKey])
  }
  return isPrivacyConsentGranted(JSON.parse(localStorage.getItem(privacyConsentKey) ?? 'null'))
}

export async function savePrivacyConsent(granted: boolean) {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [privacyConsentKey]: granted })
    return
  }
  localStorage.setItem(privacyConsentKey, JSON.stringify(granted))
}
