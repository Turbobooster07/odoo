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
        console.log("Dropping existing drivers table if it exists...");
        await pool.query('DROP TABLE IF EXISTS drivers');

        console.log("Creating drivers table...");
        await pool.query(`
            CREATE TABLE drivers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                license_number VARCHAR(50),
                license_category VARCHAR(50),
                license_expiry_date DATE,
                contact_no VARCHAR(50),
                trip_compl VARCHAR(20),
                safety_score VARCHAR(50),
                status VARCHAR(50)
            )
        `);

        console.log("Inserting sample data...");
        const sampleData = [
            ['Alex Rivera', 'DL-88213', 'LMV', '2028-12-01', '9876500000', '96%', 'Available', 'Available'],
            ['John Doe', 'DL-44120', 'HMV', '2023-03-15', '9822000000', '81%', 'Suspended', 'Suspended'],
            ['Priya Patel', 'DL-77031', 'LMV', '2027-08-10', '9911000000', '99%', 'On Trip', 'On Trip'],
            ['Suresh Kumar', 'DL-90045', 'HMV', '2027-01-20', '9744000000', '88%', 'Available', 'Off Duty'],
            ['Marcus Vane', 'DL-30214', 'HMV', '2028-09-05', '9811400000', '94%', 'On Trip', 'On Trip'],
            ['Sarah Chen', 'DL-55210', 'LMV', '2029-11-25', '9920300000', '95%', 'Available', 'Available'],
            ['David King', 'DL-10928', 'LMV', '2024-02-14', '9783400000', '76%', 'Suspended', 'Suspended'],
            ['Robert Lee', 'DL-88049', 'HMV', '2027-10-30', '9854300000', '90%', 'Available', 'Off Duty']
        ];

        for (const driver of sampleData) {
            await pool.query(
                'INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_no, trip_compl, safety_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                driver
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
