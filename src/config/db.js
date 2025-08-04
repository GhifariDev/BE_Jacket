// src/config/db.js
const mysql = require('mysql2');
require('dotenv').config(); // untuk load .env

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ MySQL Connected!');
});

module.exports = db;
