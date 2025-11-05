require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000', // jsPsych frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(bodyParser.json());

//Connection poll
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Wait for DB to be ready before accepting requests
async function ensureDatabaseReady(retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Connected to MySQL');
      return;
    } catch (err) {
      console.log(`Waiting for MySQL... (${i + 1}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  console.error('MySQL did not become ready in time');
  process.exit(1);
}

//API routes
app.post('/api/prepare_table', async (req, res) => {
  const { tableName, suffix, tableColumns } = req.body;

  if (!tableName || !tableColumns) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const columns = tableColumns.map((col) => `${col.name} ${col.type}`).join(', ');
  const sql = `
    CREATE TABLE IF NOT EXISTS \`${tableName}${suffix ?? ''}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ${columns},
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(sql);
    res.json({ message: `Table ${tableName} created` });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Insert experiment data into a specified table
app.post('/api/experiment/insert_data', async (req, res) => {
  const { task, id, ...data } = req.body;

  if (!task || Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const keys = Object.keys(data);
  const values = Object.values(data);

  // Safely construct query with placeholders
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO \`${task}\` (${keys.join(', ')}) VALUES (${placeholders})`;

  try {
    await pool.query(sql, values);
    res.json({ message: `Data inserted into ${task}` });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

//Start server after DB check
ensureDatabaseReady().then(() => {
  app.listen(3001, '0.0.0.0', () => {
    console.log('API running on port 3001');
  });
});
