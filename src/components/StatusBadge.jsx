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
  green: 'badge badge-green',
  yellow: 'badge badge-yellow',
  red: 'badge badge-red',
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
