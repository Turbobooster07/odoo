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

async function seed() {
    try {
        console.log("Dropping existing trips table if it exists...");
        await pool.query('DROP TABLE IF EXISTS trips');

        console.log("Creating trips table...");
        await pool.query(`
            CREATE TABLE trips (
                id INT AUTO_INCREMENT PRIMARY KEY,
                trip_number VARCHAR(50),
                source VARCHAR(100),
                destination VARCHAR(100),
                vehicle_id INT,
                vehicle_name VARCHAR(100),
                driver_id INT,
                driver_name VARCHAR(100),
                cargo_weight INT,
                planned_distance INT,
                status VARCHAR(50)
            )
        `);

        console.log("Inserting sample trips data...");
        const sampleData = [
            ['TR001', 'Gandhinagar Depot', 'Ahmedabad Hub', 1, 'VAN-05', 1, 'Alex Rivera', 400, 38, 'Dispatched'],
            ['TR002', 'Vatva Industrial Area', 'Sanand Warehouse', 2, 'TRUCK-04', 2, 'Suresh Kumar', 8000, 45, 'Draft']
        ];

        for (const trip of sampleData) {
            await pool.query(
                'INSERT INTO trips (trip_number, source, destination, vehicle_id, vehicle_name, driver_id, driver_name, cargo_weight, planned_distance, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                trip
            );
        }

        console.log("Seeding complete!");
    } catch (err) {
        console.error("Error during seeding:", err);
    } finally {
        pool.end();
    }
}

seed();
