const mysql = require('mysql2/promise');

async function migrate() {
    console.log("Connecting to database...");
    const pool = mysql.createPool({
        host: 'sql12.freesqldatabase.com',
        user: 'sql12832833',
        password: '7GnfJGUm2P',
        database: 'sql12832833',
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0
    });

    try {
        console.log("Creating maintenance_logs table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS maintenance_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id VARCHAR(20) NOT NULL,
                service_type VARCHAR(100) NOT NULL,
                cost DECIMAL(10, 2) NOT NULL,
                date DATE NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("maintenance_logs table verified/created successfully.");

        // Check if logs already exist
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM maintenance_logs');
        if (rows[0].count === 0) {
            console.log("Seeding initial maintenance logs...");
            const seedLogs = [
                ['VAN-05', 'Oil Change', 2500.00, '2026-07-07', 'In Shop'],
                ['TRUCK-11', 'Engine Repair', 18000.00, '2026-07-06', 'Completed'],
                ['MINI-03', 'Tyre Replace', 6200.00, '2026-07-05', 'In Shop'],
                ['SEDAN-09', 'Brake Pads', 1850.00, '2026-07-04', 'Completed']
            ];

            for (const log of seedLogs) {
                await pool.query(
                    'INSERT INTO maintenance_logs (vehicle_id, service_type, cost, date, status) VALUES (?, ?, ?, ?, ?)',
                    log
                );
            }
            console.log("Seeding complete!");
        } else {
            console.log("Table already contains data, skipping seed.");
        }

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await pool.end();
        console.log("Database connection closed.");
    }
}

migrate();
