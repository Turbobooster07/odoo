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
        // Check if weight_capacity column exists
        const [columns] = await pool.query('SHOW COLUMNS FROM vehicles LIKE "weight_capacity"');
        if (columns.length === 0) {
            console.log("Adding weight_capacity column to vehicles table...");
            await pool.query('ALTER TABLE vehicles ADD COLUMN weight_capacity INT NOT NULL DEFAULT 5000');
            console.log("weight_capacity column added successfully!");
        } else {
            console.log("weight_capacity column already exists.");
        }

        // Set realistic capacities for default types if they are still 5000
        console.log("Updating default weight capacities...");
        await pool.query('UPDATE vehicles SET weight_capacity = 25000 WHERE type = "Truck" AND weight_capacity = 5000');
        await pool.query('UPDATE vehicles SET weight_capacity = 6000 WHERE type = "Van" AND weight_capacity = 5000');
        console.log("Weight capacities updated!");

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await pool.end();
        console.log("Database connection closed.");
    }
}

migrate();
