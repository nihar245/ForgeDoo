import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Factory, BarChart3, Users, Package } from 'lucide-react'
import brandLogo from '../../../mockup/logo.jpeg'

const Landing = () => {
  const features = [
    {
      icon: <Factory className="w-8 h-8" />,
      title: "Manufacturing Orders",
      description: "Manage production workflows from start to finish"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Reports",
      description: "Real-time insights into your manufacturing performance"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Work Center Management",
      description: "Optimize resource allocation and operator assignments"
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Inventory Control",
      description: "Track materials and finished goods seamlessly"
    }
  ]
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center">
              <div style={{ width: 80, height: 40 }} className="flex items-center justify-center">
                <img 
                  src={brandLogo} 
                  alt="Manufacturing ERP Logo" 
                  className="rounded-lg object-contain ring-1 ring-gray-200 shadow-sm hover:shadow transition"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section (centered, no image) */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Modern Manufacturing
              <br />
              <span className="text-gray-900">Management System</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Streamline your production workflow with our comprehensive ERP solution. 
              From manufacturing orders to inventory management, everything you need in one place.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/signup"
                className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold"
              >
                Start Free Trial
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Everything You Need to Manage Production
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Our comprehensive suite of tools helps you optimize every aspect of your manufacturing process
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-elevated p-8 rounded-2xl group hover:scale-105 transition-all duration-300"
              >
                <div className="text-gray-800 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Removed CTA section as requested */}

      {/* Footer */}
      <footer className="gradient-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Brand */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center mb-4 lg:justify-start">
                <img 
                  src={brandLogo} 
                  alt="Manufacturing ERP Logo" 
                  className="w-12 h-12 rounded-lg object-contain ring-1 ring-white/20 shadow-sm"
                />
              </div>
              <h3 className="text-2xl font-semibold">CONTACT US</h3>
            </div>

            {/* Static contacts */}
            <div className="glass-dark/50 backdrop-blur rounded-2xl p-6">
              <ul className="space-y-3 text-lg">
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-semibold">PARTH SRIVASTAVA</span>
                  <a href="mailto:parth.srivastava560@gmail.com" className="text-gray-200 hover:text-white underline decoration-white/40 hover:decoration-white">
                    parth.srivastava560@gmail.com
                  </a>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-semibold">HARSH SHAH</span>
                  <a href="mailto:harshdshah@gmail.com" className="text-gray-200 hover:text-white underline decoration-white/40 hover:decoration-white">
                    harshdshah@gmail.com
                  </a>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-semibold">NIHAR MEHTA</span>
                  <a href="mailto:niharmehta245@gmail.com" className="text-gray-200 hover:text-white underline decoration-white/40 hover:decoration-white">
                    niharmehta245@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 text-center text-gray-300">© 2025 Manufacturing ERP. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

export default Landing