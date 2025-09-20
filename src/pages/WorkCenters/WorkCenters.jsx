import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function WorkCenters() {
  const [rows, setRows] = useState([
    { id: 'WC-001', location: 'Work Center - 1', costPerHour: 50 },
    { id: 'WC-002', location: 'Work Center - 2', costPerHour: 60 },
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Work Centers</h1>
        <p className="text-gray-600">Define locations and their hourly cost</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/20">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Work Center (Location)</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Cost per Hour</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr key={r.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="border-b border-white/10">
                  <td className="py-4 px-6 text-gray-800">{r.location}</td>
                  <td className="py-4 px-6 text-gray-800">${r.costPerHour}/hr</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
