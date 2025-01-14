const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'tkh.dei.mybluehost.me', // Use your Bluehost hostname (e.g., 'yourdomain.com' or an IP address)
  user: 'tkhdeimy_ruvenn',    // The database username you created
  password: 'Dragonfarts12', // The database password
  database: 'tkhdeimy_quotationtool', // The database name
  port: 3306                     // Default MySQL port
});

module.exports = pool;
