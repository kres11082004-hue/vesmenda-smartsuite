-- Initialize Database Schema for Vesmenda_db

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    avatar TEXT,
    phone VARCHAR(50),
    birthdate DATE,
    address TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    barcode VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Base price
    cost DECIMAL(10, 2) NOT NULL, -- Base cost
    stock DECIMAL(10, 2) NOT NULL, -- Base stock
    min_stock DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_units (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    conversion_rate DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    is_base BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sales_transactions (
    id VARCHAR(255) PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    cashier VARCHAR(255) NOT NULL,
    payment_method VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS sales_items (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(255) REFERENCES sales_transactions(id) ON DELETE CASCADE,
    product_id VARCHAR(255) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    qty INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    birthdate DATE,
    address TEXT,
    photo TEXT
);

CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(255) PRIMARY KEY,
    date DATE NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS generated_reports (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP NOT NULL,
    generated_by VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP NOT NULL
);
