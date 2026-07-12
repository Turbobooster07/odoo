const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12832833',
    password: '7GnfJGUm2P',
    database: 'sql12832833',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function clearDrivers() {
    try {
        console.log("Emptying drivers table...");
        await pool.query('TRUNCATE TABLE drivers');
        console.log("Drivers table is now empty!");
    } catch (err) {
        console.error("Error clearing table:", err);
    } finally {
        pool.end();
    }
}

clearDrivers();
