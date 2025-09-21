# ForgeDoo – Manufacturing ERP System

A comprehensive Manufacturing Resource Planning (ERP) system built with modern web technologies. ForgeDoo streamlines manufacturing operations from order creation to production execution, featuring real-time inventory tracking, work order management, and comprehensive analytics.

## 🏗️ System Architecture

<div align="center">
  <img src="system-architecture.jpg" alt="ForgeDoo System Architecture" width="800"/>
  <p><em>High-level system architecture showing frontend, backend, and database layers</em></p>
</div>


## 🏢 Team Information

**Team Name:** CUDEPT  
**Team Members:**
- **Parth Srivastav** 
- **Nihar Mehta**
- **Harsh Shah**

## 🚀 Project Overview

ForgeDoo is a modern Manufacturing Management ERP system designed to digitize and optimize manufacturing workflows. The system provides end-to-end visibility from raw materials to finished products, enabling manufacturers to make data-driven decisions and improve operational efficiency.

### Technology Stack

**Frontend:**
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing with protected routes
- **React Context** - State management for authentication
- **Recharts** - Interactive data visualization
- **Lucide React** - Modern icon library
- **React Hot Toast** - Elegant notification system

**Backend:**
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web application framework
- **PostgreSQL** - Robust relational database
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing and security

## ✨ Core Features

### 🎯 Manufacturing Order Management
- **Complete Lifecycle Tracking** - From draft to completion
- **BOM Integration** - Automatic material requirement calculation
- **Component Availability** - Real-time stock validation
- **Field Locking** - Prevent accidental changes after confirmation
- **Status Progression** - Draft → Confirmed → In Progress → Done

### 📋 Work Order System
- **Drag & Drop Interface** - Intuitive status updates
- **Real-time Duration Tracking** - Accurate time measurement
- **Operator Assignment** - Role-based work allocation
- **Progress Monitoring** - Visual progress indicators
- **Material Consumption** - Track component usage

### 📦 Inventory Management
- **Stock Ledger** - Comprehensive transaction history
- **Real-time Availability** - Instant stock level updates
- **Automatic Calculations** - Available vs. required quantities
- **Transaction Tracking** - Full audit trail with timestamps
- **Low Stock Alerts** - Proactive inventory management

### 🔧 Bill of Materials (BOM)
- **Hierarchical Structure** - Multi-level BOM support
- **Component Management** - Detailed part specifications
- **Operation Sequencing** - Manufacturing step definitions
- **Work Center Integration** - Resource allocation planning
- **Validation Rules** - Ensure complete BOM creation

### 📊 Analytics & Reporting
- **Interactive Dashboards** - Real-time KPI monitoring
- **Production Analytics** - Efficiency and performance metrics
- **Work Order Distribution** - Visual status representation
- **Duration Analysis** - Planned vs. actual time tracking
- **Custom Reports** - Tailored business insights

### 👥 Role-Based Access Control
- **Admin** - Full system access and configuration
- **Manager** - Operations oversight and reporting
- **Inventory** - Stock management and ledger control
- **Operator** - Work order execution and status updates

## 🎨 Design Philosophy

### Glassmorphism & Neumorphism
- **Modern Aesthetic** - Clean, professional interface
- **Depth Perception** - Layered visual hierarchy
- **Interactive Elements** - Hover effects and animations
- **Consistent Theming** - Unified color palette and spacing

### Responsive Design
- **Mobile-First Approach** - Optimized for all screen sizes
- **Touch-Friendly Interface** - Accessible on tablets and phones
- **Adaptive Layouts** - Content reorganization for different viewports
- **Cross-Browser Compatibility** - Consistent experience across browsers

## 🗂️ Project Structure

```
ForgeDoo/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Layout/          # Layout components
│   │   │   ├── ui/              # Basic UI elements
│   │   │   └── shared/          # Shared components
│   │   ├── pages/               # Main application pages
│   │   │   ├── Dashboard/       # Analytics dashboard
│   │   │   ├── ManufacturingOrders/ # MO management
│   │   │   ├── WorkOrders/      # Work order tracking
│   │   │   ├── BOM/             # Bill of materials
│   │   │   ├── StockLedger/     # Inventory management
│   │   │   └── Reports/         # Reporting system
│   │   ├── contexts/            # React Context providers
│   │   ├── services/            # API service modules
│   │   ├── hooks/               # Custom React hooks
│   │   └── utils/               # Utility functions
│   ├── public/                  # Static assets
│   └── package.json             # Frontend dependencies
├── backend/                     # Node.js backend
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Custom middleware
│   │   └── utils/               # Backend utilities
│   ├── migrations/              # Database migrations
│   └── package.json             # Backend dependencies
└── README.md                    # Project documentation
```

## 🛠️ Development Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nihar245/ForgeDoo.git
   cd ForgeDoo
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables:**
   ```bash
   # Backend (.env)
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=forgedoo
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   PORT=3001
   ```

5. **Run database migrations:**
   ```bash
   npm run migrate
   ```

### Development Commands

| Command | Description |
|---------|-------------|
| **Frontend** |
| `npm run dev` | Start development server (http://localhost:5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| **Backend** |
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run migrate` | Run database migrations |

## 🚀 Deployment

The application supports containerized deployment using Docker:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📈 Performance Features

- **Optimized Bundle Size** - Code splitting and lazy loading
- **Efficient Re-renders** - React memo and optimization techniques
- **Fast API Responses** - Optimized database queries
- **Caching Strategy** - Client-side and server-side caching
- **Progressive Loading** - Skeleton screens and loading states

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Authorization** - Granular permission control
- **Input Validation** - Frontend and backend validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Content sanitization

## 🎯 Business Value

- **Operational Efficiency** - Streamlined manufacturing processes
- **Real-time Visibility** - Instant production status updates
- **Cost Reduction** - Optimized resource utilization
- **Quality Control** - Comprehensive tracking and audit trails
- **Scalability** - Built to grow with your business

## 📄 License

This project is developed for educational and demonstration purposes.

---

**Developed by Team CUDEPT**  
*Building the future of manufacturing technology*

**🔗 Links:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Documentation: [API Docs](http://localhost:3001/api-docs)

**📞 Contact:**
For questions or contributions, please reach out to any team member or create an issue in the repository.
