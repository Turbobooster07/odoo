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
        console.log("Creating fuel_logs table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS fuel_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle VARCHAR(50) NOT NULL,
                date VARCHAR(50) NOT NULL,
                liters DECIMAL(10, 2) NOT NULL,
                cost DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("fuel_logs table verified/created successfully.");

        console.log("Creating expenses table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                trip VARCHAR(50) NOT NULL,
                vehicle VARCHAR(50) NOT NULL,
                toll DECIMAL(10, 2) NOT NULL DEFAULT 0,
                other DECIMAL(10, 2) NOT NULL DEFAULT 0,
                maint DECIMAL(10, 2) NOT NULL DEFAULT 0,
                status VARCHAR(50) NOT NULL DEFAULT 'Available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("expenses table verified/created successfully.");

        // Check if fuel logs already exist
        const [fuelRows] = await pool.query('SELECT COUNT(*) as count FROM fuel_logs');
        if (fuelRows[0].count === 0) {
            console.log("Seeding initial fuel logs...");
            const seedFuel = [
                ['VAN-05', '05 Jul 2024', 42.00, 3150.00],
                ['TRUCK-11', '06 Jul 2024', 110.00, 8400.00],
                ['MINI-08', '06 Jul 2024', 28.00, 2050.00]
            ];

            for (const log of seedFuel) {
                await pool.query(
                    'INSERT INTO fuel_logs (vehicle, date, liters, cost) VALUES (?, ?, ?, ?)',
                    log
                );
            }
            console.log("Fuel logs seeding complete!");
        } else {
            console.log("fuel_logs table already contains data, skipping seed.");
        }

        // Check if expenses already exist
        const [expRows] = await pool.query('SELECT COUNT(*) as count FROM expenses');
        if (expRows[0].count === 0) {
            console.log("Seeding initial expenses...");
            const seedExpenses = [
                ['TR001', 'VAN-05', 120.00, 0.00, 0.00, 'Available'],
                ['TR004', 'TRK-12', 340.00, 150.00, 18000.00, 'Completed']
            ];

            for (const exp of seedExpenses) {
                await pool.query(
                    'INSERT INTO expenses (trip, vehicle, toll, other, maint, status) VALUES (?, ?, ?, ?, ?, ?)',
                    exp
                );
            }
            console.log("Expenses seeding complete!");
        } else {
            console.log("expenses table already contains data, skipping seed.");
        }

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await pool.end();
        console.log("Database connection closed.");
    }
}

migrate();
