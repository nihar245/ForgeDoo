import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Play, Package, Calendar, User, AlertTriangle, XCircle } from 'lucide-react'
import StatusBadge from '../../components/StatusBadge'
import { getMOById, upsertMO, nextReference, computeComponentStatus, deleteMO } from '../../utils/moStorage'
import { useAuth } from '../../context/AuthContext'

const STATES = ['Draft', 'Confirmed', 'In Progress', 'To Close', 'Done', 'Cancelled']

export default function MODetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mo, setMo] = useState(null)
  const [activeTab, setActiveTab] = useState('components')

  const isNew = id === 'new'
  const isAdmin = (user?.role || '').toLowerCase() === 'admin'

  const products = [
    { id: 'P-001', name: 'Wooden Table' },
    { id: 'P-002', name: 'Chair Set' },
    { id: 'P-003', name: 'Dining Set' },
    { id: 'P-004', name: 'Office Desk' },
    { id: 'P-005', name: 'Bookshelf' },
  ]

  const assigneesAll = [
    { id: 'U-INV', name: 'Inventory Manager', role: 'inventory' },
    { id: 'U-OPR', name: 'Operator User', role: 'operator' },
    { id: 'U-MGR', name: 'Manager User', role: 'manager' },
  ]
  const assignees = assigneesAll.filter(u => ['inventory','operator'].includes(u.role))

  useEffect(() => {
    if (isNew) {
      // create a draft shell
      const draft = {
        id: nextReference(),
        product: '',
        quantity: 1,
        unit: 'pcs',
        state: 'Draft',
        startDate: new Date().toISOString().slice(0,10),
        scheduleDate: '',
        assignee: '',
        components: [],
        workOrders: [],
      }
      setMo(draft)
    } else {
      const found = getMOById(id)
      setMo(found)
    }
  }, [id, isNew])

  const compStatus = useMemo(() => computeComponentStatus(mo), [mo])

  const update = (patch) => setMo(prev => ({ ...prev, ...patch }))

  const save = () => {
    if (!mo) return
    upsertMO({ ...mo })
  }

  const onConfirm = () => { update({ state: 'Confirmed' }); save() }
  const onStart = () => { update({ state: 'In Progress' }); save() }
  const onProduce = () => { update({ state: 'Done' }); save() }
  const onCancel = () => { if (!isAdmin) return; update({ state: 'Cancelled' }); save() }

  const onDelete = () => {
    if (!isAdmin) return
    deleteMO(mo.id)
    navigate('/manufacturing-orders')
  }

  // To Close rule: when all work orders are in Done
  useEffect(() => {
    if (!mo) return
    if (mo.state === 'In Progress' || mo.state === 'Confirmed') {
      const allDone = (mo.workOrders || []).every(w => (w.status || '').toLowerCase() === 'done')
      if (allDone) {
        update({ state: 'To Close' })
        save()
      }
    }
  }, [mo?.workOrders])

  if (!mo) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/manufacturing-orders')} className="neomorphism px-3 py-2 rounded-lg inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="px-3 py-2 rounded-lg bg-gray-50 ring-1 ring-gray-200 text-gray-800 text-sm">
            {mo.id}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* state buttons per spec */}
          <button disabled={mo.state !== 'Draft'} onClick={onConfirm} className={`px-4 py-2 rounded-lg text-sm font-medium ${mo.state === 'Draft' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}>Confirm</button>
          <button disabled={!['Confirmed','In Progress'].includes(mo.state)} onClick={onStart} className={`px-4 py-2 rounded-lg text-sm font-medium ${['Confirmed','In Progress'].includes(mo.state) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}>Start</button>
          <button disabled={!['To Close','In Progress','Confirmed'].includes(mo.state)} onClick={onProduce} className={`px-4 py-2 rounded-lg text-sm font-medium ${['To Close','In Progress','Confirmed'].includes(mo.state) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}>Produce</button>
          <button disabled={mo.state === 'Done'} onClick={onCancel} className={`px-4 py-2 rounded-lg text-sm font-medium ${mo.state !== 'Done' ? 'bg-gray-50 ring-1 ring-gray-200 text-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Cancel</button>
        </div>
      </div>

      {/* State badges bar */}
      <div className="flex items-center gap-3">
        {STATES.map(s => (
          <div key={s} className={`px-3 py-2 rounded-lg text-sm font-medium ${mo.state === s ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>{s}</div>
        ))}
      </div>

      {/* Form */}
      <div className="glass p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Finished product *</label>
              <div className="relative">
                <Package className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select value={mo.product} onChange={e=>update({product: e.target.value})} className="neomorphism-inset w-full pl-9 pr-3 py-2 rounded-lg">
                  <option value="" disabled>Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Quantity *</label>
                <input type="number" min={1} value={mo.quantity} onChange={e=>update({quantity: Number(e.target.value)})} className="neomorphism-inset w-full px-3 py-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Units</label>
                <input value={mo.unit} onChange={e=>update({unit: e.target.value})} className="neomorphism-inset w-24 px-3 py-2 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bill of Material</label>
              <input value={mo.bom || ''} onChange={e=>update({bom: e.target.value})} placeholder="Select BoM (optional)" className="neomorphism-inset w-full px-3 py-2 rounded-lg" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Schedule Date *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="date" value={mo.scheduleDate || ''} onChange={e=>update({scheduleDate: e.target.value})} className="neomorphism-inset w-full pl-9 pr-3 py-2 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Assignee</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select value={mo.assignee || ''} onChange={e=>update({assignee: e.target.value})} className="neomorphism-inset w-full pl-9 pr-3 py-2 rounded-lg">
                  <option value="">Select assignee</option>
                  {assignees.map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button onClick={()=>setActiveTab('components')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab==='components'?'bg-black text-white':'bg-gray-100 text-gray-700'}`}>Components</button>
        <button onClick={()=>setActiveTab('workorders')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab==='workorders'?'bg-black text-white':'bg-gray-100 text-gray-700'}`}>Work Orders</button>
      </div>

      {activeTab === 'components' ? (
        <div className="glass p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Component Status:</div>
            <div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-gray-300 ${compStatus === 'Available' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-700'}`}>{compStatus}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/20">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Components</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Availability</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">To Consume</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Units</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Consumed</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Units</th>
                </tr>
              </thead>
              <tbody>
                {(mo.components || []).map((c, idx) => (
                  <tr key={idx} className="border-b border-white/10">
                    <td className="py-3 px-4">{c.name}</td>
                    <td className="py-3 px-4">{c.availability}</td>
                    <td className="py-3 px-4">{c.toConsume}</td>
                    <td className="py-3 px-4">{c.unit}</td>
                    <td className="py-3 px-4">{c.consumed || 0}</td>
                    <td className="py-3 px-4">{c.unit}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-gray-600"><button className="underline" onClick={()=>update({components:[...(mo.components||[]), { name: 'New Component', availability: 'Available', toConsume: 1, unit: 'pcs', consumed: 0 }]})}>Add a product</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass p-4 rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/20">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Operations</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Work Center</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Real Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {(mo.workOrders || []).map((w, idx) => (
                  <tr key={idx} className="border-b border-white/10">
                    <td className="py-3 px-4">{w.operation}</td>
                    <td className="py-3 px-4">{w.workCenter}</td>
                    <td className="py-3 px-4">{(w.durationPlan||0).toFixed(0)}:00</td>
                    <td className="py-3 px-4">{(w.durationReal||0).toFixed(0)}:00</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">{w.status}</span>
                        {w.status !== 'In Progress' && (
                          <button className="neomorphism p-1.5 rounded-md" onClick={() => {
                            const list = [...(mo.workOrders||[])]
                            list[idx] = { ...list[idx], status: 'In Progress' }
                            update({ workOrders: list, state: mo.state === 'Confirmed' ? 'In Progress' : mo.state })
                            save()
                          }}>
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {w.status !== 'Done' && (
                          <button className="neomorphism p-1.5 rounded-md" onClick={() => {
                            const list = [...(mo.workOrders||[])]
                            list[idx] = { ...list[idx], status: 'Done' }
                            update({ workOrders: list })
                            save()
                          }}>
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-gray-600"><button className="underline" onClick={()=>update({workOrders:[...(mo.workOrders||[]), { operation: 'Assembly-1', workCenter: 'Work Center -1', durationPlan: 60, durationReal: 0, status: 'To Do' }]})}>Add a line</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
