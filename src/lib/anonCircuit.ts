// Shared localStorage helpers for anonymous Circuit saves
// Used by SaveBrandButton, SaveGemButton, SaveMarketButton, CircuitAnon

export const ANON_KEYS = {
  brands: 'wam_anon_brands',
  gems: 'wam_anon_gems',
  markets: 'wam_anon_markets',
}

export type AnonBrand = {
  id: string
  slug: string
  display_name: string
  avatar_url: string | null
  category: string | null
  saved_at: string
}

export type AnonGem = {
  id: string
  name: string
  category: string
  description: string | null
  address: string | null
  space_name: string | null
  saved_at: string
}

export type AnonMarket = {
  id: string
  title: string
  event_date: string
  starts_at: string
  ends_at: string
  space_name: string | null
  saved_at: string
}

export function anonGet<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[] }
  catch { return [] }
}

export function anonSet<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(items))
}

export function anonAdd<T extends { id: string }>(key: string, item: T) {
  const items = anonGet<T>(key)
  if (items.find(i => i.id === item.id)) return
  anonSet(key, [item, ...items])
}

export function anonRemove(key: string, id: string) {
  anonSet(key, anonGet<{ id: string }>(key).filter(i => i.id !== id))
}

export function anonIsSaved(key: string, id: string): boolean {
  return anonGet<{ id: string }>(key).some(i => i.id === id)
}

export function anonClear() {
  Object.values(ANON_KEYS).forEach(k => localStorage.removeItem(k))
}
