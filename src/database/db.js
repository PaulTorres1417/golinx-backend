import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  keepAlive: true, 
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la conexión a PostgreSQL:', err);
});

(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('🚀 Conectado con PostgreSQL...');
  } catch (err) {
    console.error('Error al conectar la DB:', err);
  }
})();

export default pool;
