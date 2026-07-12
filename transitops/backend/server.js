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

// API: Fetch Vehicles (supports search query)
app.get('/api/vehicles', async (req, res) => {
    const { search } = req.query;
    try {
        let query = 'SELECT * FROM vehicles';
        let params = [];
        if (search) {
            query += ' WHERE vehicle_id LIKE ? OR name LIKE ? OR assigned_driver LIKE ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        }
        query += ' ORDER BY id DESC';
        const [rows] = await pool.query(query, params);
        res.json({ success: true, vehicles: rows });
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Add Vehicle
app.post('/api/vehicles', async (req, res) => {
    const { vehicle_id, name, type, status, assigned_driver, next_maintenance } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO vehicles (vehicle_id, name, type, status, assigned_driver, next_maintenance) VALUES (?, ?, ?, ?, ?, ?)',
            [vehicle_id, name, type, status || 'Available', assigned_driver || null, next_maintenance || null]
        );
        res.json({ success: true, message: 'Vehicle added successfully', insertId: result.insertId });
    } catch (err) {
        console.error('Error adding vehicle:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Delete Vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
        res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
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
