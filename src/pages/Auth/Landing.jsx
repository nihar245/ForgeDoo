import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Factory, BarChart3, Users, Package, Settings, Cog, Box, Wrench } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={brandLogo} 
                alt="ForgeDoo Logo" 
                className="w-10 h-10 rounded-lg object-contain ring-1 ring-slate-200 shadow-sm hover:shadow transition"
              />
              <span className="text-xl font-bold text-slate-800">ForgeDoo</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn-primary px-6 py-2 rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section with 3D Manufacturing Elements */}
      <section className="relative py-20 overflow-hidden">
        {/* 3D Manufacturing Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 3D Factory Elements */}
          <div className="absolute top-20 left-10 animate-float">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg transform rotate-12 shadow-xl opacity-20"></div>
              <div className="absolute top-2 left-2 w-16 h-16 bg-gradient-to-br from-slate-300 to-slate-500 rounded-lg transform -rotate-6 shadow-lg opacity-30"></div>
            </div>
          </div>

          <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
            <div className="relative">
              <div className="w-16 h-24 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-lg shadow-xl opacity-25 transform rotate-45"></div>
              <div className="w-16 h-4 bg-gradient-to-r from-slate-400 to-slate-600 rounded-b-lg shadow-lg opacity-35"></div>
            </div>
          </div>

          <div className="absolute bottom-40 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
            <div className="relative transform -rotate-12">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-lg opacity-20"></div>
              <div className="absolute top-1 left-1 w-10 h-10 bg-gradient-to-br from-white to-slate-200 rounded-full shadow opacity-40"></div>
            </div>
          </div>

          <div className="absolute top-60 right-1/4 animate-float" style={{ animationDelay: '0.5s' }}>
            <div className="relative">
              <div className="w-8 h-20 bg-gradient-to-b from-slate-400 to-slate-600 rounded-lg shadow-xl opacity-25 transform rotate-12"></div>
              <div className="absolute top-2 left-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded shadow-lg opacity-35"></div>
            </div>
          </div>

          {/* Floating Manufacturing Icons */}
          <div className="absolute top-32 left-1/3 animate-pulse opacity-10">
            <Settings className="w-12 h-12 text-blue-600 transform rotate-45" />
          </div>
          <div className="absolute bottom-32 right-1/3 animate-pulse opacity-10" style={{ animationDelay: '1s' }}>
            <Cog className="w-10 h-10 text-slate-600 transform -rotate-12" />
          </div>
          <div className="absolute top-20 right-1/2 animate-pulse opacity-10" style={{ animationDelay: '2s' }}>
            <Box className="w-8 h-8 text-blue-500 transform rotate-90" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo and Company Name */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="relative">
                <img 
                  src={brandLogo} 
                  alt="ForgeDoo Logo" 
                  className="w-16 h-16 rounded-xl object-contain ring-2 ring-blue-200 shadow-lg"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-30 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-slate-800 bg-clip-text text-transparent">
                  ForgeDoo
                </h1>
                <p className="text-sm text-slate-600 font-medium tracking-wider">MANUFACTURING ERP</p>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight"
            >
              Modern Manufacturing
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Management System
              </span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Streamline your production workflow with our comprehensive ERP solution. 
              From manufacturing orders to inventory management, everything you need in one place.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/signup"
                className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="btn-secondary px-8 py-4 rounded-xl text-lg font-semibold transform hover:scale-105 transition-all duration-300"
              >
                View Demo
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-slate-800 mb-4"
            >
              Everything You Need to Manage Production
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Our comprehensive suite of tools helps you optimize every aspect of your manufacturing process
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass p-8 rounded-xl group hover:scale-105 transition-all duration-300 border border-slate-200 hover:border-blue-200"
              >
                <div className="text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Removed CTA section as requested */}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Brand */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 mb-6 lg:justify-start">
                <img 
                  src={brandLogo} 
                  alt="ForgeDoo Logo" 
                  className="w-12 h-12 rounded-lg object-contain ring-1 ring-white/20 shadow-sm"
                />
                <div>
                  <h3 className="text-2xl font-bold">ForgeDoo</h3>
                  <p className="text-sm text-slate-300">Manufacturing ERP</p>
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-2">CONTACT US</h4>
              <p className="text-slate-300">Ready to transform your manufacturing process?</p>
            </div>

            {/* Contact Information */}
            <div className="glass-dark/50 backdrop-blur rounded-xl p-6">
              <ul className="space-y-3 text-lg">
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-semibold">PARTH SRIVASTAVA</span>
                  <a href="mailto:parth.srivastava560@gmail.com" className="text-blue-300 hover:text-blue-200 underline decoration-blue-300/40 hover:decoration-blue-200 transition-colors">
                    parth.srivastava560@gmail.com
                  </a>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-semibold">HARSH SHAH</span>
                  <a href="mailto:harshdshah@gmail.com" className="text-blue-300 hover:text-blue-200 underline decoration-blue-300/40 hover:decoration-blue-200 transition-colors">
                    harshdshah@gmail.com
                  </a>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-semibold">NIHAR MEHTA</span>
                  <a href="mailto:niharmehta245@gmail.com" className="text-blue-300 hover:text-blue-200 underline decoration-blue-300/40 hover:decoration-blue-200 transition-colors">
                    niharmehta245@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 text-center text-slate-400 border-t border-slate-700 pt-8">
            © 2025 ForgeDoo Manufacturing ERP. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing