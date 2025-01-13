const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1', // Replace with your MySQL server host
  user: 'root',      // Replace with your MySQL username
  password: 'root', // Replace with your MySQL password
  database: 'testing_database', // Replace with your database name
});

module.exports = pool;
