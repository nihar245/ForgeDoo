import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, ChevronDown, X, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { bomAPI } from '../../services/bomAPI'
import { productsAPI } from '../../services/productsAPI'
import { workCentersAPI } from '../../services/workCentersAPI'
import { useAuth } from '../../context/AuthContext'

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
  const { user } = useAuth()
  const isNew = id === 'new'
  const isAdmin = user?.role?.toLowerCase() === 'admin'

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
  const [workCenters, setWorkCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('components')
  
  // Modal states for admin creation
  const [showProductModal, setShowProductModal] = useState(false)
  const [showWorkCenterModal, setShowWorkCenterModal] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', category: 'raw_material', unit_cost: 0, uom: 'pcs' })
  const [newWorkCenter, setNewWorkCenter] = useState({ name: '', location: '', cost_per_hour: 500 })

  useEffect(() => {
    fetchInitialData()
  }, [id])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch products and work centers for dropdowns
      const [productsResponse, workCentersResponse] = await Promise.all([
        productsAPI.getAll(),
        workCentersAPI.getAll()
      ])
      
      if (productsResponse.data) {
        setProducts(productsResponse.data)
      }
      
      if (workCentersResponse.items) {
        setWorkCenters(workCentersResponse.items)
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

  // Handle creating new product
  const handleCreateProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.error('Product name is required')
      return
    }

    try {
      const response = await productsAPI.create({
        name: newProduct.name,
        type: newProduct.category, // backend expects 'type' field
        unit_cost: Number(newProduct.unit_cost) || 0,
        uom: newProduct.uom || 'pcs'
      })
      
      console.log('Product creation response:', response)
      
      if (response && response.item) {
        // Refresh products list
        const productsResponse = await productsAPI.getAll()
        console.log('Refreshed products:', productsResponse)
        
        if (productsResponse && productsResponse.data) {
          setProducts(productsResponse.data)
        }
        
        toast.success(`Product "${newProduct.name}" created successfully`)
        setShowProductModal(false)
        setNewProduct({ name: '', category: 'raw_material', unit_cost: 0, uom: 'pcs' })
      } else {
        throw new Error('Failed to create product - invalid response')
      }
    } catch (error) {
      console.error('Failed to create product:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create product'
      toast.error(errorMessage)
    }
  }

  // Handle creating new work center
  const handleCreateWorkCenter = async () => {
    if (!newWorkCenter.name.trim()) {
      toast.error('Work center name is required')
      return
    }

    try {
      const response = await workCentersAPI.create({
        name: newWorkCenter.name,
        location: newWorkCenter.location || '',
        cost_per_hour: Number(newWorkCenter.cost_per_hour) || 500
      })
      
      console.log('Work center creation response:', response)
      
      if (response && response.item) {
        // Refresh work centers list
        const workCentersResponse = await workCentersAPI.getAll()
        console.log('Refreshed work centers:', workCentersResponse)
        
        if (workCentersResponse && workCentersResponse.items) {
          setWorkCenters(workCentersResponse.items)
        }
        
        toast.success(`Work center "${newWorkCenter.name}" created successfully`)
        setShowWorkCenterModal(false)
        setNewWorkCenter({ name: '', location: '', cost_per_hour: 500 })
      } else {
        throw new Error('Failed to create work center - invalid response')
      }
    } catch (error) {
      console.error('Failed to create work center:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create work center'
      toast.error(errorMessage)
    }
  }

  const onSave = async () => {
    if (loading) return; // Prevent multiple save attempts
    
    if (!form.product_id) return toast.error('Finished product is required')
    if (!form.output_quantity || Number(form.output_quantity) <= 0) return toast.error('Output quantity must be greater than 0')
    if (!form.version) return toast.error('Version is required')

    // Validate components - at least one required
    if (!form.components || form.components.length === 0) {
      return toast.error('At least one component is required')
    }
    
    for (let i = 0; i < form.components.length; i++) {
      const component = form.components[i]
      if (!component.product_id) {
        return toast.error(`Component ${i + 1}: Product selection is required`)
      }
      if (!component.quantity || Number(component.quantity) <= 0) {
        return toast.error(`Component ${i + 1}: Quantity must be greater than 0`)
      }
    }

    // Validate operations - at least one required
    if (!form.operations || form.operations.length === 0) {
      return toast.error('At least one operation is required')
    }
    
    for (let i = 0; i < form.operations.length; i++) {
      const operation = form.operations[i]
      if (!operation.operation_name?.trim()) {
        return toast.error(`Operation ${i + 1}: Operation name is required`)
      }
      if (!operation.workcenter_id && !operation.work_center_id) {
        return toast.error(`Operation ${i + 1}: Work center selection is required`)
      }
      if (!operation.duration_mins || Number(operation.duration_mins) <= 0) {
        return toast.error(`Operation ${i + 1}: Duration must be greater than 0`)
      }
    }

    try {
      setLoading(true)
      
      const bomData = {
        product_id: form.product_id,
        reference: form.version,
        output_quantity: form.output_quantity,
        components: form.components.map(comp => ({
          product_id: comp.product_id,
          qty_per_unit: comp.quantity, // Map quantity to qty_per_unit for backend
          uom: comp.uom || 'pcs'
        })),
        operations: form.operations.map((op, index) => ({
          operation_name: op.operation_name,
          work_center_id: op.workcenter_id || op.work_center_id,
          duration_mins: Number(op.duration_mins),
          sequence: index + 1 // Auto-assign sequence based on order
        }))
      }

      console.log('Saving BOM with data:', bomData)

      if (isNew) {
        const response = await bomAPI.upsert(bomData)
        console.log('BOM created successfully:', response)
        toast.success('BOM created successfully')
      } else {
        const response = await bomAPI.update(form.id, {
          name: form.version,
          output_quantity: form.output_quantity,
          components: form.components || [],
          operations: form.operations || [],
        })
        console.log('BOM updated successfully:', response)
        toast.success('BOM updated successfully')
      }
      
      navigate('/bom')
    } catch (error) {
      console.error('Failed to save BOM:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save BOM'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
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
          disabled={!form.product_id || !form.version || loading}
        >
          <Save className="w-4 h-4" />
          <span>{isNew ? 'Create BOM' : 'Save BOM'}</span>
        </motion.button>
      </div>

      {/* Header fields */}
      <div className="glass rounded-xl p-5">
        {isNew && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Creating a new BOM:</strong> Select a finished product, define the output quantity, and add components and operations as needed.
              {isAdmin && (
                <span className="block mt-1">
                  As an admin, you can create new products and work centers using the "New" buttons.
                </span>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Finished product</label>
              {isAdmin && (
                <button
                  onClick={() => setShowProductModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  New
                </button>
              )}
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Components</div>
              {isAdmin && (
                <button
                  onClick={() => setShowProductModal(true)}
                  className="neomorphism px-3 py-1 rounded-lg text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-3 h-3" />
                  New Product
                </button>
              )}
            </div>
            <div className="rounded-lg border border-white/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Component</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Quantity</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {form.components?.length ? form.components.map((component, idx) => {
                    const product = products.find(p => p.id === component.product_id)
                    return (
                      <tr key={idx} className="border-t border-white/10">
                        <td className="py-2 px-3">
                          <select
                            value={component.product_id}
                            onChange={(e) => {
                              const newComponents = [...form.components]
                              newComponents[idx].product_id = parseInt(e.target.value)
                              handleChange({ components: newComponents })
                            }}
                            className="neomorphism-inset px-2 py-1 rounded text-sm w-full max-w-xs"
                          >
                            <option value="">Select product...</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={component.quantity}
                            onChange={(e) => {
                              const newComponents = [...form.components]
                              newComponents[idx].quantity = parseFloat(e.target.value) || 0
                              handleChange({ components: newComponents })
                            }}
                            className="neomorphism-inset px-2 py-1 rounded text-sm w-20"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => {
                              const newComponents = form.components.filter((_, i) => i !== idx)
                              handleChange({ components: newComponents })
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Remove component"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={3} className="py-4 px-3 text-gray-500 text-sm">No components yet.</td>
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
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Operations</div>
              {isAdmin && (
                <button
                  onClick={() => setShowWorkCenterModal(true)}
                  className="neomorphism px-3 py-1 rounded-lg text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-3 h-3" />
                  New Work Center
                </button>
              )}
            </div>
            <div className="rounded-lg border border-white/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Operation</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Sequence</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Work Center</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Duration (mins)</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {form.operations?.length ? form.operations.map((operation, idx) => {
                    const workCenter = workCenters.find(wc => wc.id === (operation.workcenter_id || operation.work_center_id))
                    return (
                      <tr key={idx} className="border-t border-white/10">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={operation.operation_name}
                            onChange={(e) => {
                              const newOperations = [...form.operations]
                              newOperations[idx].operation_name = e.target.value
                              handleChange({ operations: newOperations })
                            }}
                            className="neomorphism-inset px-2 py-1 rounded text-sm w-full max-w-xs"
                            placeholder="Operation name"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={operation.sequence}
                            onChange={(e) => {
                              const newOperations = [...form.operations]
                              newOperations[idx].sequence = parseInt(e.target.value) || 1
                              handleChange({ operations: newOperations })
                            }}
                            className="neomorphism-inset px-2 py-1 rounded text-sm w-16"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={operation.workcenter_id || operation.work_center_id || ''}
                            onChange={(e) => {
                              const newOperations = [...form.operations]
                              newOperations[idx].workcenter_id = parseInt(e.target.value)
                              newOperations[idx].work_center_id = parseInt(e.target.value)
                              handleChange({ operations: newOperations })
                            }}
                            className="neomorphism-inset px-2 py-1 rounded text-sm w-full max-w-xs"
                          >
                            <option value="">Select work center...</option>
                            {workCenters.map(wc => (
                              <option key={wc.id} value={wc.id}>{wc.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={operation.duration_mins}
                            onChange={(e) => {
                              const newOperations = [...form.operations]
                              newOperations[idx].duration_mins = parseInt(e.target.value) || 1
                              handleChange({ operations: newOperations })
                            }}
                            className="neomorphism-inset px-2 py-1 rounded text-sm w-20"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => {
                              const newOperations = form.operations.filter((_, i) => i !== idx)
                              handleChange({ operations: newOperations })
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Remove operation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={5} className="py-4 px-3 text-gray-500 text-sm">No operations yet.</td>
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
                  workcenter_id: workCenters.length > 0 ? workCenters[0].id : 1,
                  work_center_id: workCenters.length > 0 ? workCenters[0].id : 1,
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

      {/* Product Creation Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass p-6 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Product</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="neomorphism-inset w-full px-3 py-2 rounded-lg"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="neomorphism-inset w-full px-3 py-2 rounded-lg"
                >
                  <option value="raw_material">Raw Material</option>
                  <option value="finished">Finished Product</option>
                  <option value="semi_finished">Semi-Finished</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.unit_cost}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                    className="neomorphism-inset w-full px-3 py-2 rounded-lg"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={newProduct.uom}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, uom: e.target.value }))}
                    className="neomorphism-inset w-full px-3 py-2 rounded-lg"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="ltr">ltr</option>
                    <option value="mtr">mtr</option>
                    <option value="set">set</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowProductModal(false)}
                className="neomorphism px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="neomorphism hover-glow px-4 py-2 rounded-lg text-blue-600 hover:text-blue-800 font-medium"
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Center Creation Modal */}
      {showWorkCenterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass p-6 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Work Center</h3>
              <button
                onClick={() => setShowWorkCenterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Center Name</label>
                <input
                  type="text"
                  value={newWorkCenter.name}
                  onChange={(e) => setNewWorkCenter(prev => ({ ...prev, name: e.target.value }))}
                  className="neomorphism-inset w-full px-3 py-2 rounded-lg"
                  placeholder="Enter work center name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newWorkCenter.location}
                  onChange={(e) => setNewWorkCenter(prev => ({ ...prev, location: e.target.value }))}
                  className="neomorphism-inset w-full px-3 py-2 rounded-lg"
                  placeholder="Enter location (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Hour (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newWorkCenter.cost_per_hour}
                  onChange={(e) => setNewWorkCenter(prev => ({ ...prev, cost_per_hour: parseFloat(e.target.value) || 0 }))}
                  className="neomorphism-inset w-full px-3 py-2 rounded-lg"
                  placeholder="500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowWorkCenterModal(false)}
                className="neomorphism px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkCenter}
                className="neomorphism hover-glow px-4 py-2 rounded-lg text-blue-600 hover:text-blue-800 font-medium"
              >
                Create Work Center
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BOMDetail
