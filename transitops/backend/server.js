require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Backend API only - Frontend is handled separately
// MySQL connection pool
const pool = mysql.createPool({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12832833',
    password: '7GnfJGUm2P',
    database: 'sql12832833',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// API: Login Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        console.log("Login attempt:", email, password);
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND password_hash = ?',
            [email, password]
        );
        console.log("Query returned:", rows.length, "rows");

        if (rows.length > 0) {
            res.json({ success: true, message: 'Authentication successful', user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Fetch Vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
        res.json({ success: true, vehicles: rows });
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
