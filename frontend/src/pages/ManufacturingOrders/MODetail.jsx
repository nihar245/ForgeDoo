import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Play, Package, Calendar, User, AlertTriangle, XCircle } from 'lucide-react'
import StatusBadge from '../../components/StatusBadge'
import { nextReference, computeComponentStatus } from '../../utils/moStorage'
import { useAuth } from '../../context/AuthContext'
import { productsAPI, workCentersAPI, bomAPI, manufacturingOrdersAPI, workOrdersAPI } from '../../services'
import api from '../../config/api'
import { reportsAPI } from '../../services/reportsAPI'
import toast from 'react-hot-toast'

const STATES = ['Draft', 'Confirmed', 'In Progress', 'To Close', 'Done', 'Cancelled']

export default function MODetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mo, setMo] = useState(null)
  const [activeTab, setActiveTab] = useState('components')
  const [products, setProducts] = useState([])
  const [assignees, setAssignees] = useState([])
  const [workCenters, setWorkCenters] = useState([])
  const [boms, setBoms] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  // Track if this draft has been persisted (so we don't re-create on confirm repeatedly)
  const [persistedId, setPersistedId] = useState(null)
  const isNew = id === 'new' && !persistedId
  const isAdmin = (user?.role || '').toLowerCase() === 'admin'

  // Fetch products and assignees from API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch products, work centers, assignees, and BOMs in parallel
        const [productsResponse, workCentersResponse, assigneesResponse, bomsResponse] = await Promise.all([
          productsAPI.getFinishedProducts().catch(async (error) => {
            console.log('getFinishedProducts failed, falling back to getAll:', error)
            return await productsAPI.getAll()
          }), 
          workCentersAPI.getAll(),
          manufacturingOrdersAPI.getAssignees(),
          bomAPI.getAll()
        ])
        
        if (productsResponse.data) {
          const allProducts = productsResponse.data
          console.log('Products loaded:', allProducts.length, 'products')
          
          // Use finished products if available, otherwise fallback to all products
          let finishedProducts = allProducts.filter(product => 
            product.category === 'finished' || 
            product.type === 'finished'
          )
          
          if (finishedProducts.length === 0) {
            console.log('No finished products found, using all products as fallback')
            finishedProducts = allProducts
          }
          
          const mappedProducts = finishedProducts.map(product => ({
            id: product.id,
            name: product.name || product.product_name,
            category: product.category || product.type
          }))
          
          setProducts(mappedProducts)
          console.log('Products set for dropdown:', mappedProducts.length, 'products')
        } else {
          console.log('No products data received')
          setProducts([])
        }

        if (workCentersResponse.items) {
          setWorkCenters(workCentersResponse.items.map(workCenter => ({
            id: workCenter.id,
            name: workCenter.name,
            location: workCenter.location
          })))
        }

        if (bomsResponse.data) {
          setBoms(bomsResponse.data.map(bom => ({
            id: bom.id,
            product_name: bom.product_name,
            version: bom.version,
            product_id: bom.product_id,
            output_quantity: bom.output_quantity
          })))
        }

        // Set assignees from API response
        if (assigneesResponse.data) {
          setAssignees(assigneesResponse.data)
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
        toast.error('Failed to load products, work centers, and assignees')
        // Keep data empty to show only real database data
        setProducts([])
        setWorkCenters([])
        setAssignees([])
        setBoms([])
      } finally {
        setLoadingData(false)
      }
    }

    fetchInitialData()
  }, [])

  const loadMOFromDatabase = async (moId) => {
    console.log('🔄 [MO-LOAD] Starting to load MO from database:', { moId })
    try {
      setLoadingData(true)
      console.log('🔄 [MO-LOAD] Making API call to get MO by ID:', moId)
      const response = await manufacturingOrdersAPI.getById(moId)
      console.log('✅ [MO-LOAD] API response received:', { response })
      
      if (response.data) {
        console.log('✅ [MO-LOAD] Setting MO data:', response.data)
        setMo(response.data)
        console.log('✅ [MO-LOAD] MO loaded successfully with status:', response.data.status || response.data.state)
      } else {
        console.error('❌ [MO-LOAD] No data in response')
        throw new Error('Manufacturing Order not found')
      }
    } catch (error) {
      console.error('❌ [MO-LOAD] Error loading MO:', error)
      toast.error('Failed to load Manufacturing Order')
    } finally {
      setLoadingData(false)
      console.log('🔄 [MO-LOAD] Loading process completed')
    }
  }

  useEffect(() => {
    console.log('🚀 [MO-INIT] Initializing MO component:', { isNew, id })
    if (isNew) {
      console.log('📝 [MO-INIT] Creating new MO draft')
      // create a draft shell
      const draft = {
        id: nextReference(),
        product: '',
        productId: '', // Add productId field for dropdown
        quantity: 1,
        unit: 'pcs',
        state: 'Draft',
        startDate: new Date().toISOString().slice(0,10),
        scheduleDate: '',
        assignee: '',
        components: [],
        workOrders: [],
      }
      console.log('📝 [MO-INIT] Draft MO created:', draft)
      setMo(draft)
    } else {
      console.log('🔍 [MO-INIT] Loading existing MO with ID:', id)
      loadMOFromDatabase(id)
    }
  }, [id, isNew])

  // Update productId when products are loaded and MO exists
  useEffect(() => {
    if (mo && mo.product && !mo.productId && products.length > 0) {
      const matchingProduct = products.find(p => p.name === mo.product)
      if (matchingProduct) {
        update({ productId: matchingProduct.id })
      }
    }
  }, [mo, products])

  const compStatus = useMemo(() => {
    console.log('🧮 [COMPONENT] Computing component status for MO:', { 
      moId: mo?.id, 
      componentsCount: mo?.components?.length || 0 
    })
    
    const status = computeComponentStatus(mo)
    
    console.log('✅ [COMPONENT] Component status computed:', {
      available: status.available,
      reserved: status.reserved, 
      shortage: status.shortage,
      readyToProduce: status.readyToProduce
    })
    
    return status
  }, [mo])

  const update = (patch) => setMo(prev => ({ ...prev, ...patch }))

  // Refresh server-derived data (components availability & work orders) for existing MO
  const refreshServerDerived = async (moId) => {
    if(!moId) return
    try {
      const [compRes, woRes] = await Promise.all([
        api.get(`/mos/${moId}/components`).catch(()=>null),
        api.get(`/mos/${moId}/work-orders`).catch(()=>null)
      ])
      const compData = compRes?.data?.data?.components || compRes?.data?.data || []
      const wos = woRes?.data?.data || []
      // Normalize components to UI shape
      const normComponents = compData.map(c=>({
        name: c.product_name || c.name || `Product ${c.product_id}`,
        product_id: c.product_id,
        availability: c.status === 'sufficient' ? 'Available' : (c.status === 'insufficient' ? 'Shortage' : (c.availability || 'Unknown')),
        toConsume: c.required || c.quantity || c.per_output_qty || 1,
        unit: c.uom || 'pcs',
        consumed: 0,
        unit_cost: c.unit_cost || 0
      }))
      // Normalize work orders
      const normWOs = wos.map(w=>({
        operation: w.operation_name,
        sequence: w.sequence || 0,
        workCenter: w.work_center_name || '-',
        workCenterId: w.workcenter_id || w.work_center_id,
        workCenterLocation: w.work_center_location || '',
        durationPlan: w.expected_duration_mins || 0,
        durationReal: w.real_duration_mins || 0,
        status: (w.status || '').replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())
      }))
      setMo(prev=> prev ? { ...prev, components: normComponents, workOrders: normWOs } : prev)
    } catch(e){
      console.warn('⚠️ Failed to refresh server derived MO data', e)
    }
  }

  // When loading an existing MO, pull server-derived children
  useEffect(()=>{
    if(!isNew && mo?.id && !persistedId){
      setPersistedId(mo.id)
    }
    if(!isNew && mo?.id){
      refreshServerDerived(mo.id)
    }
  },[mo?.id, isNew])

  // BOM selection handler
  const handleBOMSelection = async (bomId) => {
    console.log('🔧 [BOM-SELECT] BOM selection triggered:', { bomId, currentMO: mo?.id })
    
    if (!bomId) {
      console.log('🔄 [BOM-SELECT] Clearing BOM selection')
      update({ bom: '', bomId: null, components: [], workOrders: [] })
      return
    }

    try {
      console.log('🔄 [BOM-SELECT] Previewing BOM via backend preview endpoint:', bomId)
      const previewRes = await api.get(`/mos/preview/bom/${bomId}`, { params: { quantity: mo?.quantity || 1 } })
      const preview = previewRes.data?.data
      if(preview){
        const components = (preview.components||[]).map(c=>({
          name: c.product_name,
          product_id: c.product_id,
          availability: 'Unknown',
            toConsume: c.required_qty,
          unit: c.uom || 'pcs',
          consumed: 0,
          unit_cost: c.unit_cost || 0
        }))
        const workOrdersPreview = (preview.operations||[]).map((op,idx)=>({
          operation: op.operation_name,
          sequence: op.sequence || idx+1,
          workCenter: op.work_center_name || '-',
          workCenterId: op.workcenter_id || op.work_center_id,
          workCenterLocation: '',
          durationPlan: op.duration_mins || 0,
          durationReal: 0,
          status: 'Pending'
        }))
        update({
          bom: preview.product_name,
          bomId: preview.bom_id,
          product: preview.product_name,
          productId: preview.product_id,
          components,
          workOrders: workOrdersPreview, // preview operations until MO persisted
          quantity: preview.quantity
        })
        toast.success(`BOM preview loaded (${components.length} components, ${workOrdersPreview.length} operations)`)
      }
    } catch (error) {
      console.error('❌ [BOM-SELECT] Error fetching BOM details:', error)
      toast.error('Failed to load BOM details')
      // Clear any partial data on error
      console.log('🔄 [BOM-SELECT] Clearing BOM data due to error')
      update({ bom: '', bomId: null, components: [], workOrders: [] })
    }
  }

  const save = async () => {
    console.log('💾 [MO-SAVE] Starting save operation for MO:', { 
      moId: mo?.id, 
      isNew, 
      currentState: mo?.state, 
      productId: mo?.productId,
      quantity: mo?.quantity 
    })
    
    if (!mo) {
      console.error('❌ [MO-SAVE] No MO data available')
      return
    }
    
    try {
      console.log('🔍 [MO-SAVE] Validating required fields...')
      // Validate required fields
      if (!mo.productId) {
        console.warn('⚠️ [MO-SAVE] Validation failed: Missing product ID')
        toast.error('Please select a finished product')
        return false
      }
      
      if (!mo.quantity || mo.quantity < 1) {
        console.warn('⚠️ [MO-SAVE] Validation failed: Invalid quantity', { quantity: mo.quantity })
        toast.error('Please enter a valid quantity')
        return false
      }

      console.log('✅ [MO-SAVE] Validation passed, proceeding with save...')

  if (isNew) {
        console.log('📝 [MO-SAVE] Creating new MO in database with draft status')
        // Create new MO in database with draft status
        const moData = {
          product_id: parseInt(mo.productId),
          quantity: mo.quantity,
          start_date: mo.scheduleDate || new Date().toISOString().split('T')[0],
          end_date: mo.deadline,
          assignee_id: mo.assigneeId ? parseInt(mo.assigneeId) : null,
          bom_id: mo.bomId ? parseInt(mo.bomId) : null
        }

        console.log('🔄 [MO-SAVE] Creating MO with data:', moData)
        
        let response
        if (mo.bomId) {
          console.log('🔄 [MO-SAVE] Creating MO by BOM')
          // Create by BOM - clean the data to remove undefined/null values
          const bomData = {
            bom_id: moData.bom_id,
            quantity: moData.quantity,
            start_date: moData.start_date
          }
          
          // Only add end_date if it has a value
          if (moData.end_date) {
            bomData.end_date = moData.end_date
          }
          
          // Only add assignee_id if it has a value
          if (moData.assignee_id) {
            bomData.assignee_id = moData.assignee_id
          }
          
          console.log('🔄 [MO-SAVE] Cleaned BOM data for API:', bomData)
          response = await manufacturingOrdersAPI.createByBOM(bomData)
        } else {
          console.log('🔄 [MO-SAVE] Creating MO by Product')
          // Create by Product
          response = await manufacturingOrdersAPI.createByProduct(moData)
        }

        console.log('📥 [MO-SAVE] API response received:', response)

        if (response.data) {
          console.log('✅ [MO-SAVE] MO created successfully, updating local state with database MO:', response.data)
          // Update local state with database MO
          const dbMO = response.data
          console.log('🔄 [MO-SAVE] Setting MO state with database values:', {
            id: dbMO.id,
            reference: dbMO.reference,
            state: dbMO.status || 'Draft',
            status: dbMO.status || 'draft'
          })
          
          setMo({
            ...mo,
            id: dbMO.id,
            reference: dbMO.reference,
            state: dbMO.status || 'Draft',
            status: dbMO.status || 'draft',
            created_at: dbMO.created_at
          })
          setPersistedId(dbMO.id)

          // Immediately attempt to fetch real work orders for this MO
          try {
            console.log('🔄 [MO-SAVE] Fetching work orders for newly created MO:', dbMO.id)
            const woList = await workOrdersAPI.getAll({ mo_id: dbMO.id })
            let workOrders = woList?.data || woList?.items || []
            if(!workOrders.length){
              console.log('ℹ️ [MO-SAVE] No work orders present, invoking generation endpoint...')
              await workOrdersAPI.generateForMO(dbMO.id)
              const woListAfterGen = await workOrdersAPI.getAll({ mo_id: dbMO.id })
              workOrders = woListAfterGen?.data || []
            }
            if(workOrders.length){
              console.log('✅ [MO-SAVE] Retrieved work orders after creation:', workOrders.length)
              setMo(prev => prev ? { ...prev, workOrders: workOrders.map(w=>({
                operation: w.operation_name,
                sequence: w.sequence || 0,
                workCenter: w.work_center_name || '-',
                workCenterId: w.workcenter_id || w.work_center_id,
                workCenterLocation: w.work_center_location || '',
                durationPlan: w.expected_duration_mins || 0,
                durationReal: w.real_duration_mins || 0,
                status: (w.status || '').replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())
              })) } : prev)
            } else {
              console.log('⚠️ [MO-SAVE] Work orders still empty after generation attempt')
            }
          } catch(workErr){
            console.warn('⚠️ [MO-SAVE] Failed to load/generate work orders:', workErr)
          }
          
          console.log('🎉 [MO-SAVE] MO creation completed successfully!')
          toast.success(`Manufacturing Order ${dbMO.reference} created successfully`)
          // No navigation (stay on same page with draft route) - consumer relies on returned object
          return dbMO
        }
      } else {
        console.log('📝 [MO-SAVE] Updating existing MO')
        // Update existing MO
        const updateData = {
          quantity: mo.quantity,
          start_date: mo.scheduleDate,
          end_date: mo.deadline,
          assignee_id: mo.assigneeId ? parseInt(mo.assigneeId) : null
        }
        
        console.log('🔄 [MO-SAVE] Updating MO with data:', updateData)
        const response = await manufacturingOrdersAPI.update(mo.id, updateData)
        console.log('📥 [MO-SAVE] Update response received:', response)
        
        if (response.data) {
          console.log('✅ [MO-SAVE] MO updated successfully!')
          toast.success('Manufacturing Order updated successfully')
          return response.data
        }
      }
    } catch (error) {
      console.error('Error saving MO:', error)
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to save Manufacturing Order'
      toast.error(message)
      return null
    }
  }

  const onConfirm = async () => { 
    console.log('✅ [MO-CONFIRM] Starting MO confirmation process:', { moId: mo.id, currentState: mo.state, isNew })
    
    try {
      let targetId = mo.id
      if (isNew) {
        console.log('💾 [MO-CONFIRM] MO is new, saving first before confirmation...')
        const saved = await save()
        if (!saved) {
          console.error('❌ [MO-CONFIRM] Save failed, aborting confirmation')
          return
        }
        targetId = saved.id
        console.log('✅ [MO-CONFIRM] Save completed, proceeding with confirmation for id:', targetId)
      }
      console.log('🔄 [MO-CONFIRM] Making API call to confirm MO:', targetId)
      const response = await manufacturingOrdersAPI.confirm(targetId)
      console.log('📥 [MO-CONFIRM] Confirm response received:', response)
      
      if (response.data) {
        const updatedMO = response.data
        console.log('✅ [MO-CONFIRM] MO confirmed successfully, updating state:', {
          newState: 'Confirmed',
          newStatus: 'confirmed',
          components: updatedMO.components?.length || 0,
          workOrders: updatedMO.work_orders?.length || 0
        })
        
        // After confirming fetch server components availability & work orders
        await refreshServerDerived(targetId || mo.id)
        update({ state: 'Confirmed', status: 'confirmed' })
        
        console.log('🎉 [MO-CONFIRM] MO confirmation completed successfully!')
        toast.success('Manufacturing Order confirmed successfully')
      }
    } catch (error) {
      console.error('❌ [MO-CONFIRM] Error confirming MO:', error)
      toast.error('Failed to confirm Manufacturing Order')
    }
  }

  const onStart = async () => { 
    console.log('▶️ [MO-START] Starting MO process:', { moId: mo.id, currentState: mo.state })
    
    try {
      console.log('🔄 [MO-START] Making API call to start MO:', mo.id)
      const response = await manufacturingOrdersAPI.start(mo.id)
      console.log('📥 [MO-START] Start response received:', response)
      
      if (response.data) {
        console.log('✅ [MO-START] MO started successfully, updating state to In Progress')
        await refreshServerDerived(mo.id)
        update({ state: 'In Progress', status: 'in_progress' })
        console.log('🎉 [MO-START] MO start process completed!')
        toast.success('Manufacturing Order started')
      }
    } catch (error) {
      console.error('❌ [MO-START] Error starting MO:', error)
      toast.error('Failed to start Manufacturing Order')
    }
  }

  const onProduce = async () => { 
    console.log('🏁 [MO-PRODUCE] Starting MO production/completion process:', { moId: mo.id, currentState: mo.state })
    
    try {
      console.log('🔄 [MO-PRODUCE] Making API call to complete MO:', mo.id)
      const response = await manufacturingOrdersAPI.complete(mo.id)
      console.log('📥 [MO-PRODUCE] Complete response received:', response)
      
      if (response.data) {
        console.log('✅ [MO-PRODUCE] MO completed successfully, updating state to Done')
        await refreshServerDerived(mo.id)
        update({ state: 'Done', status: 'done' })
        console.log('🎉 [MO-PRODUCE] MO production process completed!')
        toast.success('Manufacturing Order completed successfully')
      }
    } catch (error) {
      console.error('❌ [MO-PRODUCE] Error completing MO:', error)
      toast.error('Failed to complete Manufacturing Order')
    }
  }

  const onCancel = async () => { 
    if (!isAdmin) return
    
    try {
      const response = await manufacturingOrdersAPI.cancel(mo.id)
      if (response.data) {
        await refreshServerDerived(mo.id)
        update({ state: 'Cancelled', status: 'cancelled' })
        toast.success('Manufacturing Order cancelled')
      }
    } catch (error) {
      console.error('Error cancelling MO:', error)
      toast.error('Failed to cancel Manufacturing Order')
    }
  }

  const onDelete = async () => {
    console.log('🗑️ [MO-DELETE] Starting MO deletion process:', { moId: mo.id, isAdmin })
    
    if (!isAdmin) {
      console.warn('⚠️ [MO-DELETE] Access denied: User is not admin')
      return
    }
    
    try {
      console.log('🔄 [MO-DELETE] Making API call to delete MO:', mo.id)
      await manufacturingOrdersAPI.delete(mo.id)
      console.log('✅ [MO-DELETE] MO deleted successfully from database')
      
      toast.success('Manufacturing Order deleted successfully')
      console.log('🔄 [MO-DELETE] Navigating to manufacturing orders list')
      navigate('/manufacturing-orders')
      console.log('🎉 [MO-DELETE] MO deletion process completed!')
    } catch (error) {
      console.error('❌ [MO-DELETE] Error deleting MO:', error)
      toast.error('Failed to delete Manufacturing Order')
    }
  }

  // To Close rule: when all work orders are in Done
  useEffect(() => {
    if (!mo) return
    if ((mo.state === 'In Progress' || mo.state === 'Confirmed') && mo.state !== 'To Close') {
      const allDone = (mo.workOrders || []).every(w => (w.status || '').toLowerCase() === 'done')
      if (allDone && mo.workOrders && mo.workOrders.length > 0) {
        update({ state: 'To Close' })
      }
    }
  }, [mo?.workOrders, mo?.state])

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
          <button disabled={mo.state !== 'Draft'} onClick={onConfirm} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mo.state === 'Draft' ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}>Confirm</button>
          <button disabled={!['Confirmed','In Progress'].includes(mo.state)} onClick={onStart} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${['Confirmed','In Progress'].includes(mo.state) ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}>Start</button>
          <button disabled={!['To Close','In Progress','Confirmed'].includes(mo.state)} onClick={onProduce} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${['To Close','In Progress','Confirmed'].includes(mo.state) ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}>Produce</button>
          <button disabled={mo.state === 'Done'} onClick={onCancel} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mo.state !== 'Done' ? 'bg-gray-50 ring-1 ring-gray-200 text-gray-800 hover:bg-gray-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Cancel</button>
        </div>
      </div>

      {/* State badges bar */}
      <div className="flex items-center gap-3">
        {STATES.map(s => (
          <div key={s} className={`px-3 py-2 rounded-lg text-sm font-medium ${mo.state === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700'}`}>{s}</div>
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
                <select 
                  value={mo.productId || ''} 
                  onChange={e => {
                    const selectedProduct = products.find(p => p.id == e.target.value)
                    update({
                      productId: e.target.value,
                      product: selectedProduct ? selectedProduct.name : ''
                    })
                  }} 
                  className="neomorphism-inset w-full pl-9 pr-3 py-2 rounded-lg"
                  disabled={loadingData}
                >
                  <option value="" disabled>Select finished product</option>
                  {products.length === 0 && !loadingData && (
                    <option disabled>No finished products available</option>
                  )}
                  {loadingData && (
                    <option disabled>Loading products...</option>
                  )}
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">Only finished products are available for manufacturing</p>
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
              <div className="relative">
                <Package className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select 
                  value={mo.bomId || ''} 
                  onChange={e => handleBOMSelection(e.target.value)} 
                  className="neomorphism-inset w-full pl-9 pr-3 py-2 rounded-lg"
                  disabled={loadingData}
                >
                  <option value="">Select BOM (optional)</option>
                  {boms.map(bom => (
                    <option key={bom.id} value={bom.id}>
                      {bom.product_name} (v{bom.version || '1'}) - Qty: {bom.output_quantity || 1}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">Selecting a BOM will auto-populate the finished product field</p>
              {mo.bom && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-green-600">
                    ✓ BOM loaded: {mo.bom}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleBOMSelection('')}
                    className="text-xs text-gray-500 hover:text-red-600 underline"
                  >
                    Clear BOM
                  </button>
                </div>
              )}
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
        <button onClick={()=>setActiveTab('components')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab==='components'?'bg-blue-600 text-white shadow-lg':'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>Components</button>
        <button onClick={()=>setActiveTab('workorders')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab==='workorders'?'bg-blue-600 text-white shadow-lg':'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>Work Orders</button>
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Unit Cost</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Consumed</th>
                </tr>
              </thead>
              <tbody>
                {(mo.components || []).map((c, idx) => (
                  <tr key={idx} className="border-b border-white/10">
                    <td className="py-3 px-4 font-medium">{c.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        c.availability === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {c.availability}
                      </span>
                    </td>
                    <td className="py-3 px-4">{c.toConsume}</td>
                    <td className="py-3 px-4">{c.unit}</td>
                    <td className="py-3 px-4">₹{Number(c.unit_cost || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">{c.consumed || 0}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-gray-600">
                    <button 
                      className="underline hover:text-blue-600" 
                      onClick={() => update({
                        components: [...(mo.components||[]), { 
                          name: 'New Component', 
                          availability: 'Available', 
                          toConsume: 1, 
                          unit: 'pcs', 
                          consumed: 0,
                          unit_cost: 0 
                        }]
                      })}
                    >
                      Add a product
                    </button>
                  </td>
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Real Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {(mo.workOrders || []).map((w, idx) => (
                  <tr key={idx} className="border-b border-white/10">
                    <td className="py-3 px-4 font-medium">{w.operation}</td>
                    <td className="py-3 px-4">{w.workCenter}</td>
                    <td className="py-3 px-4 text-gray-600">{w.workCenterLocation || '-'}</td>
                    <td className="py-3 px-4">{(w.durationPlan||0).toFixed(0)} mins</td>
                    <td className="py-3 px-4">{(w.durationReal||0).toFixed(0)} mins</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={w.status} />
                        {w.status !== 'In Progress' && (
                          <button 
                            className="neomorphism p-1.5 rounded-md hover:bg-blue-50" 
                            onClick={() => {
                              const list = [...(mo.workOrders||[])]
                              list[idx] = { ...list[idx], status: 'In Progress' }
                              update({ workOrders: list, state: mo.state === 'Confirmed' ? 'In Progress' : mo.state })
                              save()
                            }}
                            title="Start Operation"
                          >
                            <Play className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        {w.status !== 'Done' && (
                          <button 
                            className="neomorphism p-1.5 rounded-md hover:bg-green-50" 
                            onClick={() => {
                              const list = [...(mo.workOrders||[])]
                              list[idx] = { ...list[idx], status: 'Done' }
                              update({ workOrders: list })
                              save()
                            }}
                            title="Mark as Done"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-gray-600">
                    <button 
                      className="underline hover:text-blue-600" 
                      onClick={() => {
                        const nextSequence = (mo.workOrders || []).length + 1
                        const defaultWorkCenter = workCenters.length > 0 
                          ? workCenters[0] 
                          : { id: 1, name: 'Work Center - 1', location: 'Assembly Area' }
                        
                        update({
                          workOrders: [...(mo.workOrders||[]), { 
                            operation: `Assembly-${nextSequence}`, 
                            sequence: nextSequence,
                            workCenter: defaultWorkCenter.name,
                            workCenterId: defaultWorkCenter.id,
                            workCenterLocation: defaultWorkCenter.location || '',
                            durationPlan: 60, 
                            durationReal: 0, 
                            status: 'To Do' 
                          }]
                        })
                      }}
                    >
                      Add a line
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
