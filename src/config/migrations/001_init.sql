-- ============================================================
-- Manufacturing Management System (PERN Stack) - Init SQL
-- ============================================================

-- Drop old tables if they exist (safe reset)
DROP TABLE IF EXISTS stock_ledger, inventory, work_orders, manufacturing_orders,
bom_operations, bom_components, bom, work_centers, products, users CASCADE;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) CHECK (role IN ('owner/admin','manufacturing_manager','operator','inventory_manager')),
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, phone, role, password, avatar) VALUES
('Nihar Mehta','niharmehta@gmail.com','6359856777','owner/admin','123','xyz'),
('Harsh Shah','harshshah@gmail.com','123456790','manufacturing_manager','456','asd'),
('Parth Srivastav','parthsri@gmail.com','9876543210','operator','789','qwe'),
('Param Dehai','paramd@gmail.com','1234567980','inventory_manager','456','iop'),
('Aditi Jain','aditijain@gmail.com','9876501234','operator','111','mno');

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('finished','raw_material','semi_finished')),
    uom VARCHAR(50) NOT NULL, -- Unit of Measurement
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (sku, name, type, uom) VALUES
('nb01','Notebook A4','finished','pieces'),
('gb01','Graph Papers A4','finished','pkts'),
('nb02','Notebook Legal','finished','pieces'),
('db01','Drawing Book A2','finished','pieces'),
('rm01','Paper Sheets A4','raw_material','sheets'),
('rm02','Hard Cover A4','raw_material','pieces'),
('rm03','Binding Glue','raw_material','ml'),
('rm04','Graph Paper Sheets','raw_material','sheets'),
('rm05','Staple Pins','raw_material','pieces'),
('rm06','Drawing Paper A2','raw_material','sheets');

-- ============================================================
-- BILL OF MATERIALS (BOM)
-- ============================================================
CREATE TABLE bom (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    version VARCHAR(10),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO bom (product_id, version, created_by) VALUES
(1,'v1',2),  -- Notebook A4
(2,'v1',2),  -- Graph Papers A4
(3,'v1',2),  -- Legal Notebook
(4,'v1',2),  -- Drawing Book A2
(1,'v2',2);  -- Updated Notebook A4

-- ============================================================
-- BOM COMPONENTS
-- ============================================================
CREATE TABLE bom_components (
    id SERIAL PRIMARY KEY,
    bom_id INT REFERENCES bom(id) ON DELETE CASCADE,
    component_product_id INT REFERENCES products(id),
    quantity DECIMAL(10,2) NOT NULL
);

INSERT INTO bom_components (bom_id, component_product_id, quantity) VALUES
(1,5,100), (1,6,1), (1,7,5), (1,9,2),
(2,8,50),
(3,5,120), (3,6,1), (3,7,7),
(4,10,80), (4,6,1);

-- ============================================================
-- BOM OPERATIONS
-- ============================================================
CREATE TABLE bom_operations (
    id SERIAL PRIMARY KEY,
    bom_id INT REFERENCES bom(id) ON DELETE CASCADE,
    operation_name VARCHAR(100),
    workcenter_id INT,
    duration_mins INT
);

-- workcenter_id links later
INSERT INTO bom_operations (bom_id, operation_name, workcenter_id, duration_mins) VALUES
(1,'Assembly',1,30),
(1,'Binding',2,20),
(1,'Packing',3,10),
(2,'Cutting',5,15),
(3,'Assembly',1,40),
(4,'Binding',2,25),
(4,'Painting',4,15),
(4,'Packing',3,10);

-- ============================================================
-- WORK CENTERS
-- ============================================================
CREATE TABLE work_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity_per_hour INT,
    cost_per_hour DECIMAL(10,2),
    location VARCHAR(100)
);

INSERT INTO work_centers (name, capacity_per_hour, cost_per_hour, location) VALUES
('Assembly Line',100,200,'Plant A'),
('Binding Station',150,150,'Plant A'),
('Packaging Line',200,100,'Plant B'),
('Painting Section',80,250,'Plant B'),
('Cutting Machine',120,180,'Plant C');

-- ============================================================
-- MANUFACTURING ORDERS (MO)
-- ============================================================
CREATE TABLE manufacturing_orders (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    created_by INT REFERENCES users(id),
    -- Initial lifecycle (planned,in_progress,done,canceled) intentionally kept minimal; later migrations (003,005) remap to new lifecycle.
    -- DO NOT seed 'not_assigned' here; it is introduced only after migration 005 adjusts the constraint.
    status VARCHAR(20) CHECK (status IN ('planned','in_progress','done','canceled')),
    start_date DATE,
    end_date DATE,
    -- Added upfront so later migrations adding bom_id become idempotent
    bom_id INT REFERENCES bom(id)
);

INSERT INTO manufacturing_orders (product_id, quantity, created_by, status, start_date, end_date) VALUES
    -- These seed statuses will be migrated as follows:
    -- planned -> draft (003), in_progress -> in_progress (unchanged), done -> not_assigned (005)
    (1,500,2,'planned','2025-09-20','2025-09-25'),
    (2,100,2,'in_progress','2025-09-18','2025-09-21'),
    (3,300,2,'planned','2025-09-22','2025-09-28'),
    (4,200,2,'in_progress','2025-09-19','2025-09-23'),
    (1,1000,2,'done','2025-09-10','2025-09-15');

-- ============================================================
-- WORK ORDERS (WO)
-- ============================================================
CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    mo_id INT REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
    operation_name VARCHAR(100),
    assigned_to INT REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('pending','in_progress','paused','done')),
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

INSERT INTO work_orders (mo_id, operation_name, assigned_to, status, started_at, ended_at) VALUES
(1,'Assembly',3,'in_progress','2025-09-20',NULL),
(1,'Binding',5,'pending',NULL,NULL),
(2,'Cutting',3,'done','2025-09-18','2025-09-18'),
(2,'Packing',5,'in_progress','2025-09-19',NULL),
(4,'Painting',3,'in_progress','2025-09-19',NULL),
(5,'Assembly',3,'done','2025-09-11','2025-09-12'),
(5,'Binding',5,'done','2025-09-12','2025-09-13'),
(5,'Packing',3,'done','2025-09-14','2025-09-14');

-- ============================================================
-- STOCK LEDGER
-- ============================================================
CREATE TABLE stock_ledger (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    movement_type VARCHAR(10) CHECK (movement_type IN ('in','out')),
    quantity DECIMAL(10,2) NOT NULL,
    reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stock_ledger (product_id, movement_type, quantity, reference) VALUES
(5,'out',50000,'MO#1'),
(6,'out',500,'MO#1'),
(7,'out',2500,'MO#1'),
(9,'out',1000,'MO#1'),
(1,'in',500,'MO#1'),
(8,'out',5000,'MO#2'),
(2,'in',100,'MO#2'),
(10,'out',16000,'MO#4'),
(4,'in',200,'MO#4'),
(5,'in',100000,'Purchase#123');

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    quantity_available DECIMAL(12,2) DEFAULT 0,
    reorder_level INT DEFAULT 0,
    location VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO inventory (product_id, quantity_available, reorder_level, location) VALUES
(5,95000,10000,'Plant A Store'),
(6,480,100,'Plant A Store'),
(7,4750,500,'Plant A Store'),
(9,800,200,'Plant A Store'),
(1,500,200,'Finished Goods Store'),
(2,100,50,'Finished Goods Store'),
(10,14000,2000,'Plant B Store'),
(4,200,50,'Finished Goods Store'),
(3,0,100,'Finished Goods Store'),
(8,4500,1000,'Plant C Store');
