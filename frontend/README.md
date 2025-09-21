# Manufacturing Management ERP - Frontend

A modern, responsive React frontend for a comprehensive manufacturing management system featuring glassmorphism design, neumorphism elements, and smooth animations.

## 🚀 Features

### Core Functionality
- **Authentication System** - Role-based login with demo accounts
- **Dashboard** - Real-time KPIs, production trends, and analytics
- **Manufacturing Orders** - Complete production workflow management
- **Work Orders** - Drag & drop task assignments and progress tracking
- **Stock Ledger** - Inventory movements and stock level monitoring
- **Bill of Materials (BOM)** - Product recipes and manufacturing steps
- **Reports & Analytics** - Interactive charts and performance insights

### Design Features
- **Glassmorphism Effects** - Translucent cards with blur effects
- **Neumorphism Buttons** - Soft, raised 3D button design
- **Smooth Animations** - Page transitions and hover effects
- **Responsive Layout** - Mobile-first design with burger menu
- **Role-Based Access** - Different UI based on user roles

## 🛠️ Tech Stack

- **React 18** - Modern component-based architecture
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **React Hot Toast** - Elegant notifications
- **Recharts** - Interactive charts and data visualization
- **Lucide React** - Beautiful icon library
- **React DnD** - Drag and drop functionality

## 🎯 Demo Accounts

Use these credentials to explore different user roles:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@erp.com | admin123 | Full access |
| Manager | manager@erp.com | manager123 | Management features |
| Inventory Manager | inventory@erp.com | inventory123 | Stock management |
| Operator | operator@erp.com | operator123 | Work orders only |

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue shades (#3b82f6)
- **Glass Effects**: Translucent whites with blur
- **Neumorphism**: Light grays (#f0f0f3)
- **Accent Colors**: Green, Orange, Red for status indicators

### Custom CSS Classes
- `.glass` - Glassmorphism effect
- `.neomorphism` - Raised neumorphism effect
- `.neomorphism-inset` - Inset neumorphism effect
- `.hover-glow` - Glowing hover effect

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation with multi-column layouts
- **Tablet**: Collapsible sidebar with adjusted grid layouts
- **Mobile**: Burger menu with stack layouts

**Built with ❤️ for modern manufacturing management**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
