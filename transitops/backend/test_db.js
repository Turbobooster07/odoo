require('dotenv').config();
const mysql = require('mysql2/promise');

async function testQuery() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND password_hash = ?',
            ['dispatcher@transitops.com', 'dispatch123']
        );
        console.log("Query Results:", rows);
        pool.end();
    } catch (err) {
        console.error(err);
    }
}
testQuery();
