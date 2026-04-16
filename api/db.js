import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  // Production / Unified Dev
  pool = new Pool({
    connectionString: process.env.DATABASE_URL.split('?')[0] + '?sslmode=require',
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Local Fallback (Only used if no cloud URL is set)
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Vesmenda_db',
  });
}

export default pool;
