const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
                    const updates = payload.updates;
                    await client.query(
                        'UPDATE products SET barcode=$1, name=$2, category=$3, price=$4, cost=$5, stock=$6, min_stock=$7 WHERE id=$8',
                        [updates.barcode, updates.name, updates.category, updates.price, updates.cost, updates.stock, updates.minStock, payload.id]
                    );
                    if (updates.units) {
                        // For simplicity in sync, clear and re-insert units
                        await client.query('DELETE FROM product_units WHERE product_id=$1', [payload.id]);
                        for (const unit of updates.units) {
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
                        'INSERT INTO sales_transactions (id, date, total, cashier, payment_method) VALUES ($1, $2, $3, $4, $5)',
                        [payload.id, payload.date, payload.total, payload.cashier, payload.paymentMethod]
                    );
                    for (const item of payload.items) {
                        await client.query(
                            'INSERT INTO sales_items (transaction_id, product_id, product_name, qty, price) VALUES ($1, $2, $3, $4, $5)',
                            [payload.id, item.productId, item.productName, item.qty, item.price]
                        );
                    }
                    break;
                // Add more cases as needed for employees, expenses, etc.
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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
