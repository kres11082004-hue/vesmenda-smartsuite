import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

// 1. Health Check (Always reachable)
app.get(['/api/health', '/health'], (req, res) => res.json({ status: 'ok', source: 'vercel-functions' }));

// 2. Debug Endpoint (Shows real DB errors)
app.get(['/api/debug', '/debug'], async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'connected', database: 'neon' });
    } catch (err) {
        res.status(500).json({ 
            status: 'error', 
            message: err.message,
            code: err.code,
            hint: 'Check your DATABASE_URL in Vercel. Make sure no spaces or extra characters.'
        });
    }
});

// 3. Database connection protection middleware for other routes
app.use(async (req, res, next) => {
    try {
        await pool.query('SELECT 1');
        next();
    } catch (err) {
        console.error('Database connection error:', err.message);
        res.status(503).json({ 
            error: 'Database connection failed', 
            details: err.message
        });
    }
});

// Users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Products with units
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, 
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', u.id,
                        'name', u.name,
                        'conversionRate', u.conversion_rate,
                        'price', u.price,
                        'cost', u.cost,
                        'isBase', u.is_base
                    )
                ) FILTER (WHERE u.id IS NOT NULL), '[]'
            ) as units
            FROM products p
            LEFT JOIN product_units u ON p.id = u.product_id
            GROUP BY p.id
        `);
        res.json(result.rows.map(row => ({
            ...row,
            minStock: parseFloat(row.min_stock),
            price: parseFloat(row.price),
            cost: parseFloat(row.cost),
            stock: parseFloat(row.stock),
            units: (row.units || []).map((u) => ({
                ...u,
                conversionRate: parseFloat(u.conversionRate),
                price: parseFloat(u.price),
                cost: parseFloat(u.cost)
            }))
        })));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Sales
app.get('/api/sales', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, 
            COALESCE(
                json_agg(
                    json_build_object(
                        'productId', i.product_id,
                        'productName', i.product_name,
                        'qty', i.qty,
                        'price', i.price
                    )
                ) FILTER (WHERE i.product_id IS NOT NULL), '[]'
            ) as items
            FROM sales_transactions s
            LEFT JOIN sales_items i ON s.id = i.transaction_id
            GROUP BY s.id
            ORDER BY s.date DESC
        `);
        res.json(result.rows.map(s => ({
            ...s,
            total: parseFloat(s.total),
            paymentMethod: s.payment_method,
            items: (s.items || []).map((i) => ({ ...i, price: parseFloat(i.price) }))
        })));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Employees
app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employees ORDER BY name ASC');
        res.json(result.rows.map(e => ({
            ...e,
            salary: parseFloat(e.salary),
            startDate: e.start_date
        })));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
        res.json(result.rows.map(e => ({ ...e, amount: parseFloat(e.amount) })));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Reports
app.get('/api/reports', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM generated_reports ORDER BY generated_at DESC');
        res.json(result.rows.map(r => ({
            ...r,
            generatedAt: r.generated_at,
            generatedBy: r.generated_by
        })));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Activities
app.get('/api/activities', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 200');
        res.json(result.rows.map(a => ({
            ...a,
            userId: a.user_id,
            userName: a.user_name,
            userRole: a.user_role
        })));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Sync Endpoint
app.post('/api/sync', async (req, res) => {
    const { operations } = req.body;
    if (!operations || !Array.isArray(operations)) {
        return res.status(400).json({ error: 'Invalid operations format' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        for (const op of operations) {
            const { type, payload } = op;
            
            switch (type) {
                case 'ADD_PRODUCT':
                    await client.query(
                        'INSERT INTO products (id, barcode, name, category, price, cost, stock, min_stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
                        [payload.id, payload.barcode, payload.name, payload.category, payload.price, payload.cost, payload.stock, payload.minStock]
                    );
                    if (payload.units) {
                        for (const unit of payload.units) {
                            await client.query(
                                'INSERT INTO product_units (id, product_id, name, conversion_rate, price, cost, is_base) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
                                [unit.id, payload.id, unit.name, unit.conversionRate, unit.price, unit.cost, unit.isBase]
                            );
                        }
                    }
                    break;
                case 'UPDATE_PRODUCT':
                    await client.query(
                        'UPDATE products SET barcode=$1, name=$2, category=$3, price=$4, cost=$5, stock=$6, min_stock=$7 WHERE id=$8',
                        [payload.updates.barcode, payload.updates.name, payload.updates.category, payload.updates.price, payload.updates.cost, payload.updates.stock, payload.updates.minStock, payload.id]
                    );
                    if (payload.updates.units) {
                        await client.query('DELETE FROM product_units WHERE product_id=$1', [payload.id]);
                        for (const unit of payload.updates.units) {
                            await client.query(
                                'INSERT INTO product_units (id, product_id, name, conversion_rate, price, cost, is_base) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                                [unit.id || `u-${Date.now()}-${Math.random()}`, payload.id, unit.name, unit.conversionRate, unit.price, unit.cost, unit.isBase]
                            );
                        }
                    }
                    break;
                case 'DELETE_PRODUCT':
                    await client.query('DELETE FROM products WHERE id=$1', [payload.id]);
                    break;
                case 'ADD_SALE':
                    await client.query(
                        'INSERT INTO sales_transactions (id, date, total, cashier, payment_method) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
                        [payload.id, payload.date, payload.total, payload.cashier, payload.paymentMethod]
                    );
                    if (payload.items) {
                      for (const item of payload.items) {
                          await client.query(
                              'INSERT INTO sales_items (transaction_id, product_id, product_name, qty, price) VALUES ($1, $2, $3, $4, $5)',
                              [payload.id, item.productId, item.productName, item.qty, item.price]
                          );
                      }
                    }
                    break;
                case 'DELETE_SALE':
                    await client.query('DELETE FROM sales_transactions WHERE id=$1', [payload.id]);
                    break;
                case 'ADD_EMPLOYEE':
                    await client.query(
                        'INSERT INTO employees (id, name, position, salary, start_date, status, phone, birthdate, address, photo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING',
                        [payload.id, payload.name, payload.position, payload.salary, payload.startDate, payload.status, payload.phone, payload.birthdate, payload.address, payload.photo]
                    );
                    break;
                case 'UPDATE_EMPLOYEE':
                    await client.query(
                        'UPDATE employees SET name=$1, position=$2, salary=$3, status=$4, phone=$5, address=$6 WHERE id=$7',
                        [payload.updates.name, payload.updates.position, payload.updates.salary, payload.updates.status, payload.updates.phone, payload.updates.address, payload.id]
                    );
                    break;
                case 'DELETE_EMPLOYEE':
                    await client.query('DELETE FROM employees WHERE id=$1', [payload.id]);
                    break;
                case 'ADD_EXPENSE':
                    await client.query(
                        'INSERT INTO expenses (id, date, category, description, amount) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
                        [payload.id, payload.date, payload.category, payload.description, payload.amount]
                    );
                    break;
                case 'DELETE_EXPENSE':
                    await client.query('DELETE FROM expenses WHERE id=$1', [payload.id]);
                    break;
                case 'ADD_REPORT':
                    await client.query(
                        'INSERT INTO generated_reports (id, title, generated_at, generated_by) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
                        [payload.id, payload.title, payload.generatedAt, payload.generatedBy]
                    );
                    break;
                case 'ADD_USER':
                    await client.query(
                        'INSERT INTO users (id, name, email, role, phone, birthdate, address, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
                        [payload.id, payload.name, payload.email, payload.role, payload.phone, payload.birthdate, payload.address, payload.avatar]
                    );
                    break;
                case 'UPDATE_USER':
                    await client.query(
                        'UPDATE users SET name=$1, phone=$2, address=$3, avatar=$4 WHERE id=$5',
                        [payload.updates.name, payload.updates.phone, payload.updates.address, payload.updates.avatar, payload.id]
                    );
                    break;
                case 'DELETE_USER':
                    await client.query('DELETE FROM users WHERE id=$1', [payload.id]);
                    break;
                case 'LOG_ACTIVITY':
                    await client.query(
                        'INSERT INTO activity_logs (id, user_id, user_name, user_role, action, details, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
                        [payload.id, payload.userId, payload.userName, payload.userRole, payload.action, payload.details, payload.timestamp]
                    );
                    break;
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, count: operations.length });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Sync Error:', err.message);
        res.status(500).json({ error: 'Sync failed', message: err.message });
    } finally {
        client.release();
    }
});

export default app;
