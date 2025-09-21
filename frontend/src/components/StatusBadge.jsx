import React from 'react'

/*
Contract:
- props.status: string (e.g., 'Completed', 'In Progress', 'Planned', 'Pending', 'Canceled')
- Output: monochrome-friendly badge using only green/yellow/red colors
*/

const mapToRYG = (status) => {
  const s = (status || '').toLowerCase()
  if (['completed', 'done', 'success'].includes(s)) return 'green'
  if (['canceled', 'cancelled', 'failed', 'error'].includes(s)) return 'red'
  // default "active/neutral" states go yellow
  return 'yellow'
}

const classByColor = {
  green: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200',
  yellow: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200',
  red: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200',
}

const labelByStatus = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'inprogress' || s === 'in progress') return 'In Progress'
  if (s === 'planned') return 'Planned'
  if (s === 'pending') return 'Pending'
  if (s === 'completed') return 'Completed'
  if (s === 'done') return 'Done'
  if (s === 'toclose' || s === 'to close') return 'To Close'
  if (s === 'confirmed') return 'Confirmed'
  if (s === 'draft') return 'Draft'
  if (s === 'canceled' || s === 'cancelled') return 'Cancelled'
  return status || 'Status'
}

export default function StatusBadge({ status }) {
  const color = mapToRYG(status)
  const cls = classByColor[color] || classByColor.yellow
  return <span className={cls}>{labelByStatus(status)}</span>
}
