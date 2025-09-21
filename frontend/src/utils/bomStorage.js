const LS_KEY = 'boms'
const COUNTER_KEY = 'boms_counter'

export function loadBOMs() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveBOMs(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

export function getBOMById(id) {
  return loadBOMs().find(b => b.id === id) || null
}

export function upsertBOM(bom) {
  const list = loadBOMs()
  const idx = list.findIndex(b => b.id === bom.id)
  if (idx >= 0) list[idx] = { ...list[idx], ...bom }
  else list.push(bom)
  saveBOMs(list)
  return bom
}

export function deleteBOM(id) {
  const list = loadBOMs().filter(b => b.id !== id)
  saveBOMs(list)
}

export function nextBOMId() {
  let n = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10)
  n += 1
  localStorage.setItem(COUNTER_KEY, String(n))
  return `BOM-${String(n).padStart(6, '0')}`
}

export function ensureBOMSeed() {
  const existing = loadBOMs()
  if (existing.length) return existing
  const seed = [
    { id: 'BOM-000001', productName: 'Wooden Table', quantity: 1, unit: 'pcs', reference: 'TBLE001', components: [], workOrders: [] },
    { id: 'BOM-000002', productName: 'Chair Set', quantity: 1, unit: 'set', reference: 'CHAIR001', components: [], workOrders: [] },
  ]
  saveBOMs(seed)
  localStorage.setItem(COUNTER_KEY, '2')
  return seed
}
