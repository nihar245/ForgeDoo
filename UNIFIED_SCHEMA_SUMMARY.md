# Unified Product System - Schema Summary

## Overview
Implemented Option A: Unified product system with category-based discrimination. This eliminates the separate `component_products` table and uses a single `products` table for both raw materials and finished products.

## Key Changes

### 1. Unified Products Table
```sql
CREATE TABLE products(
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('raw_material','semi_finished','finished')),
  type VARCHAR(30) NOT NULL CHECK (type IN ('finished','raw_material','semi_finished')), -- Legacy compatibility
  uom VARCHAR(30) NOT NULL,
  unit_cost DECIMAL(12,4) DEFAULT 0,
  is_component BOOLEAN DEFAULT FALSE, -- Helper flag: true for raw materials, false for finished products
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `category`: Primary categorization (raw_material, semi_finished, finished)
- `type`: Legacy field for backward compatibility
- `is_component`: Boolean helper for easy filtering (raw materials = true, finished = false)
- `unit_cost`: Cost per unit for materials and pricing

### 2. Updated BOM Components Table
```sql
CREATE TABLE bom_components(
  id SERIAL PRIMARY KEY,
  bom_id INT REFERENCES bom(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id), -- Now references unified products table
  quantity DECIMAL(10,2) NOT NULL
);
```

**Changes:**
- `component_product_id` → `product_id`
- References unified `products` table instead of separate `component_products`

### 3. Stock Ledger (No Changes Needed)
```sql
CREATE TABLE stock_ledger(
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id), -- Already references products table
  movement_type VARCHAR(10) CHECK (movement_type IN ('in','out')),
  quantity DECIMAL(10,2) NOT NULL,
  reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Benefits:**
- Single tracking system for all product types
- No confusion about which table to reference
- Consistent stock management across raw materials and finished goods

## Code Updates

### 1. Models
- **products.js**: Added category and is_component support, helper functions for filtering
- **boms.js**: Updated to use `product_id` instead of `component_product_id`
- **manufacturingOrders.js**: Updated component availability logic to use unified table

### 2. Controllers
- **productController.js**: Added category and is_component to Joi schema
- **bomController.js**: Updated component schema to use `product_id`

### 3. Migration
- **001_init_consolidated.sql**: Unified schema with single products table

## Usage Examples

### Creating Raw Materials
```javascript
// Raw material (component)
{
  name: "Aluminum Sheet",
  type: "raw_material",
  category: "raw_material", 
  is_component: true,
  uom: "kg",
  unit_cost: 15.50
}
```

### Creating Finished Products
```javascript
// Finished product
{
  name: "Laptop Computer",
  type: "finished",
  category: "finished",
  is_component: false,
  uom: "pcs",
  unit_cost: 850.00
}
```

### BOM Components
```javascript
// BOM for laptop referencing raw materials
{
  product_id: 2, // Laptop Computer
  components: [
    { product_id: 1, qty_per_unit: 0.5 }, // Aluminum Sheet
    { product_id: 3, qty_per_unit: 1 },   // CPU (raw material)
    { product_id: 4, qty_per_unit: 1 }    // RAM (raw material)
  ]
}
```

## Benefits of Unified Approach

1. **Eliminated FK Mismatches**: No more component_product_id → products(id) confusion
2. **Simplified Stock Tracking**: Single ledger handles all product types
3. **Consistent Data Model**: One products table with clear categorization
4. **Easier Queries**: No JOINs between component_products and products
5. **Flexible Categories**: Can easily add new categories (semi_finished, etc.)
6. **Migration Safe**: Maintains type field for backward compatibility

## Query Patterns

### Get Raw Materials Only
```sql
SELECT * FROM products WHERE category='raw_material' OR is_component=true;
```

### Get Finished Products Only  
```sql
SELECT * FROM products WHERE category='finished' OR is_component=false;
```

### Component Availability (Fixed)
```sql
SELECT p.name, 
       SUM(CASE WHEN sl.movement_type='in' THEN sl.quantity ELSE 0 END) - 
       SUM(CASE WHEN sl.movement_type='out' THEN sl.quantity ELSE 0 END) as on_hand
FROM products p
LEFT JOIN stock_ledger sl ON sl.product_id = p.id  -- Now consistent!
WHERE p.id = $1
GROUP BY p.id, p.name;
```

This unified approach resolves all the critical issues identified in the dry run analysis while maintaining flexibility for future enhancements.