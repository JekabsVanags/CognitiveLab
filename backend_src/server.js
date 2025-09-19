require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*', // or your frontend origin URL if you want stricter control
}));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.post('/api/prepare_table', (req, res) => {
  const { tableName, suffix, tableColumns } = req.body;
  console.log(tableName, tableColumns);

  if (!tableName || !tableColumns) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const columns = tableColumns.map((col) => `${col.name} ${col.type}`).join(', ');

  const sql = `CREATE TABLE IF NOT EXISTS ${tableName}${suffix ?? ""} (id INT AUTO_INCREMENT PRIMARY KEY, ${columns}, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;

  console.log(sql)
  connection.query(sql, [], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: `Table ${tableName} created` });
  });
});

app.post('/api/experiment/insert_data', (req, res) => {
  const { task, id, ...data } = req.body;

  if (!req.body) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const keys = Object.keys(data);
  const values = Object.values(data);


  const sql = `INSERT INTO ${task} (id${keys.length > 0 ? ',' : ''} ${keys.join(", ")}) VALUES ('${id}'${values.length > 0 ? ',' : ''} ${values.join(", ")});`;

  connection.query(sql, [], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: `Data registered` });
  });
});

app.listen(3001, () => {
  console.log('Server listening on port 3001');
});
