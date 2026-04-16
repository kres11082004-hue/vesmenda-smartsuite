-- Vesmenda Smartsuite Database Schema
-- Run this in your Neon SQL Editor

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    birthdate DATE,
    address TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    barcode TEXT,
    name TEXT NOT NULL,
    category TEXT,
    price DECIMAL(12, 2) DEFAULT 0.00,
    cost DECIMAL(12, 2) DEFAULT 0.00,
    stock DECIMAL(12, 2) DEFAULT 0.00,
    min_stock DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product Units table
CREATE TABLE IF NOT EXISTS product_units (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    conversion_rate DECIMAL(12, 4) DEFAULT 1.0000,
    price DECIMAL(12, 2) DEFAULT 0.00,
    cost DECIMAL(12, 2) DEFAULT 0.00,
    is_base BOOLEAN DEFAULT FALSE
);

-- 4. Sales Transactions table
CREATE TABLE IF NOT EXISTS sales_transactions (
    id TEXT PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(12, 2) NOT NULL,
    cashier TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sales Items table
CREATE TABLE IF NOT EXISTS sales_items (
    id SERIAL PRIMARY KEY,
    transaction_id TEXT REFERENCES sales_transactions(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name TEXT,
    qty DECIMAL(12, 2) NOT NULL,
    price DECIMAL(12, 2) NOT NULL
);

-- 6. Employees table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    salary DECIMAL(12, 2) DEFAULT 0.00,
    start_date DATE,
    status TEXT DEFAULT 'active',
    phone TEXT,
    birthdate DATE,
    address TEXT,
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Generated Reports table
CREATE TABLE IF NOT EXISTS generated_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by TEXT
);

-- 9. Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
