import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  console.error('FATAL ERROR: DATABASE_URL is missing from environment variables.');
  // Fallback to avoid crashing the whole process but health check will report it
  pool = new Pool({
    connectionString: 'postgresql://invalid:invalid@localhost/invalid',
  });
}

export default pool;
