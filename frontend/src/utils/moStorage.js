// Simple localStorage-based persistence for Manufacturing Orders (MOs)

const LS_KEY = 'manufacturing_orders'
const COUNTER_KEY = 'manufacturing_orders_counter'

export function loadMOs() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveMOs(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

export function getMOById(id) {
  return loadMOs().find(m => m.id === id) || null
}

export function upsertMO(mo) {
  const list = loadMOs()
  const idx = list.findIndex(m => m.id === mo.id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...mo }
  } else {
    list.push(mo)
  }
  saveMOs(list)
  return mo
}

export function deleteMO(id) {
  const list = loadMOs().filter(m => m.id !== id)
  saveMOs(list)
}

export function nextReference() {
  let n = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10)
  n += 1
  localStorage.setItem(COUNTER_KEY, String(n))
  return `MO-${String(n).padStart(6, '0')}`
}

export function ensureSeedData() {
  // Seed initial MOs only if none exist
  const existing = loadMOs()
  if (existing.length > 0) return existing

  const seed = [
    {
      id: 'MO-000001',
      product: 'Wooden Table',
      quantity: 10,
      unit: 'pcs',
      state: 'In Progress',
      startDate: '2025-09-20',
      scheduleDate: '2025-09-21',
      assignee: 'John Doe',
      components: [
        { name: 'Wood Plank', availability: 'Available', toConsume: 10, unit: 'pcs', consumed: 7 },
        { name: 'Screws', availability: 'Available', toConsume: 40, unit: 'pcs', consumed: 30 },
      ],
      workOrders: [
        { id: 'WO-1', operation: 'Assembly-1', workCenter: 'WC-1', durationPlan: 60, durationReal: 30, status: 'In Progress' },
      ],
    },
    {
      id: 'MO-000002',
      product: 'Chair Set',
      quantity: 25,
      unit: 'pcs',
      state: 'Confirmed',
      startDate: '2025-09-22',
      scheduleDate: '2025-09-23',
      assignee: 'Jane Smith',
      components: [
        { name: 'Chair Seat', availability: 'Not Available', toConsume: 25, unit: 'pcs', consumed: 0 },
      ],
      workOrders: [
        { id: 'WO-2', operation: 'Assembly-1', workCenter: 'WC-2', durationPlan: 120, durationReal: 0, status: 'To Do' },
      ],
    },
  ]
  saveMOs(seed)
  // Set counter to last index
  localStorage.setItem(COUNTER_KEY, '2')
  return seed
}

export function computeComponentStatus(mo) {
  if (!mo?.components || mo.components.length === 0) return 'Available'
  const allAvail = mo.components.every(c => (c.availability || '').toLowerCase().includes('available'))
  return allAvail ? 'Available' : 'Not Available'
}
