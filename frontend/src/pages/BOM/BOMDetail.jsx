import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { bomAPI } from '../../services/bomAPI'
import { productsAPI } from '../../services/productsAPI'

const units = ['pcs', 'set', 'kg', 'hr']

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-t-md border-b-2 transition-colors ${
      active ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
)

const BOMDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = id === 'new'

  const [form, setForm] = useState({
    id: '',
    product_id: '',
    product_name: '',
    version: '',
    output_quantity: 1,
    components: [],
    operations: [],
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('components')

  useEffect(() => {
    fetchInitialData()
  }, [id])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch products for dropdown
      const productsResponse = await productsAPI.getAll()
      if (productsResponse.data) {
        setProducts(productsResponse.data)
      }

      if (isNew) {
        setForm(prev => ({ 
          ...prev, 
          version: 'v1.0'
        }))
      } else if (id) {
        // Fetch existing BOM
        const bomResponse = await bomAPI.getById(id)
        if (bomResponse.item) {
          setForm({
            id: bomResponse.item.id,
            product_id: bomResponse.item.product_id,
            product_name: bomResponse.item.product_name,
            version: bomResponse.item.version,
            output_quantity: bomResponse.item.output_quantity || 1,
            components: bomResponse.item.components || [],
            operations: bomResponse.item.operations || [],
          })
        } else {
          toast.error('BOM not found')
          navigate('/bom')
        }
      }
    } catch (error) {
      console.error('Failed to fetch BOM data:', error)
      toast.error('Failed to load BOM data')
      navigate('/bom')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (patch) => setForm(prev => ({ ...prev, ...patch }))

  const onSave = async () => {
    if (!form.product_id) return toast.error('Finished product is required')
    if (!form.output_quantity || Number(form.output_quantity) <= 0) return toast.error('Output quantity must be greater than 0')
    if (!form.version) return toast.error('Version is required')

    try {
      const bomData = {
        product_id: form.product_id,
        reference: form.version,
        output_quantity: form.output_quantity,
        components: form.components,
        operations: form.operations,
      }

      if (isNew) {
        await bomAPI.upsert(bomData)
        toast.success('BOM created successfully')
      } else {
        await bomAPI.update(form.id, {
          name: form.version,
          output_quantity: form.output_quantity,
          components: form.components,
          operations: form.operations,
        })
        toast.success('BOM updated successfully')
      }
      
      navigate('/bom')
    } catch (error) {
      console.error('Failed to save BOM:', error)
      toast.error('Failed to save BOM')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/bom')} className="neomorphism px-3 py-2 rounded-lg flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
        <div className="glass p-8 rounded-xl text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading BOM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/bom')} className="neomorphism px-3 py-2 rounded-lg flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="text-sm neomorphism px-3 py-2 rounded-lg font-mono">{form.id || 'BOM-......'}</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          className="neomorphism hover-glow px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </motion.button>
      </div>

      {/* Header fields */}
      <div className="glass rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Finished product</label>
            <div className="relative">
              <select
                className="neomorphism-inset mt-1 w-full h-10 pl-3 pr-10 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                value={form.product_id}
                onChange={(e) => {
                  const selectedProduct = products.find(p => p.id === parseInt(e.target.value))
                  handleChange({ 
                    product_id: parseInt(e.target.value),
                    product_name: selectedProduct?.name || ''
                  })
                }}
              >
                <option value="">Select product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Output Quantity</label>
            <input
              type="number"
              min={0}
              step={0.01}
              className="neomorphism-inset mt-1 w-full px-3 py-2 rounded-lg"
              value={form.output_quantity}
              onChange={(e) => handleChange({ output_quantity: parseFloat(e.target.value) || 1 })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Version</label>
            <input
              type="text"
              maxLength={10}
              className="neomorphism-inset mt-1 w-full px-3 py-2 rounded-lg"
              placeholder="e.g., v1.0"
              value={form.version}
              onChange={(e) => handleChange({ version: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl">
        <div className="flex border-b border-white/20 px-4">
          <TabButton active={tab === 'components'} onClick={() => setTab('components')}>Components</TabButton>
          <TabButton active={tab === 'operations'} onClick={() => setTab('operations')}>Operations</TabButton>
        </div>
        {tab === 'components' ? (
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-2">Components</div>
            <div className="rounded-lg border border-white/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Component</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {form.components?.length ? form.components.map((component, idx) => {
                    const product = products.find(p => p.id === component.product_id)
                    return (
                      <tr key={idx} className="border-t border-white/10">
                        <td className="py-2 px-3">{product?.name || `Product ID: ${component.product_id}`}</td>
                        <td className="py-2 px-3">{component.quantity}</td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={2} className="py-4 px-3 text-gray-500 text-sm">No components yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => {
                if (products.length > 0) {
                  handleChange({ 
                    components: [...(form.components || []), { 
                      product_id: products[0].id, 
                      quantity: 1 
                    }] 
                  })
                } else {
                  toast.error('No products available to add as components')
                }
              }}
              className="mt-3 neomorphism px-3 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Component
            </button>
          </div>
        ) : tab === 'operations' ? (
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-2">Operations</div>
            <div className="rounded-lg border border-white/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Operation</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Sequence</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Work Center ID</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Duration (mins)</th>
                  </tr>
                </thead>
                <tbody>
                  {form.operations?.length ? form.operations.map((operation, idx) => (
                    <tr key={idx} className="border-t border-white/10">
                      <td className="py-2 px-3">{operation.operation_name}</td>
                      <td className="py-2 px-3">{operation.sequence}</td>
                      <td className="py-2 px-3">{operation.workcenter_id || operation.work_center_id}</td>
                      <td className="py-2 px-3">{operation.duration_mins}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-4 px-3 text-gray-500 text-sm">No operations yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => handleChange({ 
                operations: [...(form.operations || []), { 
                  operation_name: 'New Operation', 
                  sequence: (form.operations?.length || 0) + 1,
                  work_center_id: 1, 
                  duration_mins: 60 
                }] 
              })}
              className="mt-3 neomorphism px-3 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Operation
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default BOMDetail
