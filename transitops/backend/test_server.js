require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12832833',
    password: '7GnfJGUm2P',
    database: 'sql12832833',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

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

app.listen(3001, () => console.log('Test server running on port 3001'));
