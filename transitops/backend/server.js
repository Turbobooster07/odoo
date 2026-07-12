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
            const normalizeRole = value => (value || '').toString().trim().toLowerCase().replace(/\s+/g, '_');
            const selectedRole = normalizeRole(role);
            const userRole = normalizeRole(rows[0].role);

            if (selectedRole && selectedRole !== userRole) {
                return res.status(403).json({ success: false, message: 'Selected role does not match this account.' });
            }

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

// API: Fetch Drivers
app.get('/api/drivers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM drivers ORDER BY id DESC');
        res.json({ success: true, drivers: rows });
    } catch (err) {
        console.error('Error fetching drivers:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Add Driver
app.post('/api/drivers', async (req, res) => {
    const { name, license_number, license_category, license_expiry_date, contact_no, safety_score, status } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_no, trip_compl, safety_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, license_number, license_category, license_expiry_date, contact_no, 0, safety_score || 100, status || 'Available']
        );
        res.json({ success: true, message: 'Driver added successfully', insertId: result.insertId });
    } catch (err) {
        console.error('Error adding driver:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Update Driver
app.put('/api/drivers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, license_number, license_category, license_expiry_date, contact_no, safety_score, status } = req.body;
    try {
        await pool.query(
            'UPDATE drivers SET name = ?, license_number = ?, license_category = ?, license_expiry_date = ?, contact_no = ?, safety_score = ?, status = ? WHERE id = ?',
            [name, license_number, license_category, license_expiry_date, contact_no, safety_score, status, id]
        );
        res.json({ success: true, message: 'Driver updated successfully' });
    } catch (err) {
        console.error('Error updating driver:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Delete Driver
app.delete('/api/drivers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM drivers WHERE id = ?', [id]);
        res.json({ success: true, message: 'Driver deleted successfully' });
    } catch (err) {
        console.error('Error deleting driver:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Add Vehicle
app.post('/api/vehicles', async (req, res) => {
    const { vehicle_id, name, type, status, assigned_driver, next_maintenance, weight_capacity } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO vehicles (vehicle_id, name, type, status, assigned_driver, next_maintenance, weight_capacity) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [vehicle_id, name, type, status || 'Available', assigned_driver || null, next_maintenance || null, weight_capacity || 5000]
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

// API: Fetch Trips
app.get('/api/trips', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM trips ORDER BY id DESC');
        res.json({ success: true, trips: rows });
    } catch (err) {
        console.error('Error fetching trips:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Create Trip (Draft)
app.post('/api/trips', async (req, res) => {
    const { source, destination, vehicle_id, vehicle_name, driver_id, driver_name, cargo_weight, planned_distance } = req.body;
    try {
        const trip_number = `TR${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        const [result] = await pool.query(
            'INSERT INTO trips (trip_number, source, destination, vehicle_id, vehicle_name, driver_id, driver_name, cargo_weight, planned_distance, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [trip_number, source, destination, vehicle_id, vehicle_name, driver_id, driver_name, cargo_weight, planned_distance, 'Draft']
        );
        res.json({ success: true, message: 'Trip created successfully', trip: { id: result.insertId, trip_number } });
    } catch (err) {
        console.error('Error creating trip:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// API: Update Trip (Draft)
app.put('/api/trips/:id', async (req, res) => {
    const { id } = req.params;
    const { source, destination, vehicle_id, vehicle_name, driver_id, driver_name, cargo_weight, planned_distance } = req.body;
    try {
        await pool.query(
            'UPDATE trips SET source = ?, destination = ?, vehicle_id = ?, vehicle_name = ?, driver_id = ?, driver_name = ?, cargo_weight = ?, planned_distance = ? WHERE id = ? AND status = ?',
            [source, destination, vehicle_id, vehicle_name, driver_id, driver_name, cargo_weight, planned_distance, id, 'Draft']
        );
        res.json({ success: true, message: 'Trip updated successfully' });
    } catch (err) {
        console.error('Error updating trip:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Dispatch Trip
app.put('/api/trips/:id/dispatch', async (req, res) => {
    const { id } = req.params;
    try {
        // Get the trip to find vehicle and driver
        const [trips] = await pool.query('SELECT * FROM trips WHERE id = ?', [id]);
        if (trips.length === 0) return res.status(404).json({ success: false, message: 'Trip not found' });
        
        const trip = trips[0];
        
        // Update Trip Status
        await pool.query("UPDATE trips SET status = 'Dispatched' WHERE id = ?", [id]);
        
        // Update Driver and Vehicle status to 'On Trip' (or Scheduled based on user preference)
        if (trip.driver_id) {
            await pool.query("UPDATE drivers SET status = 'On Trip' WHERE id = ?", [trip.driver_id]);
        }
        if (trip.vehicle_id) {
            await pool.query("UPDATE vehicles SET status = 'On Trip' WHERE id = ?", [trip.vehicle_id]);
        }
        
        res.json({ success: true, message: 'Trip dispatched successfully' });
    } catch (err) {
        console.error('Error dispatching trip:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// API: Fetch Maintenance Logs
app.get('/api/maintenance', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM maintenance_logs ORDER BY date DESC, id DESC');
        res.json({ success: true, logs: rows });
    } catch (err) {
        console.error('Error fetching maintenance logs:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Add Maintenance Log
app.post('/api/maintenance', async (req, res) => {
    const { vehicle_id, service_type, cost, date, status } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO maintenance_logs (vehicle_id, service_type, cost, date, status) VALUES (?, ?, ?, ?, ?)',
            [vehicle_id, service_type, cost || 0, date, status || 'Pending']
        );
        
        // If status is 'In Shop', update corresponding vehicle's status
        if (status === 'In Shop') {
            await pool.query(
                "UPDATE vehicles SET status = 'In Shop' WHERE vehicle_id = ?",
                [vehicle_id]
            );
        }
        
        res.json({ success: true, message: 'Maintenance record added successfully', insertId: result.insertId });
    } catch (err) {
        console.error('Error adding maintenance record:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Fetch Fuel Logs
app.get('/api/fuel_logs', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM fuel_logs ORDER BY id DESC');
        res.json({ success: true, logs: rows });
    } catch (err) {
        console.error('Error fetching fuel logs:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Add Fuel Log
app.post('/api/fuel_logs', async (req, res) => {
    const { vehicle, date, liters, cost } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO fuel_logs (vehicle, date, liters, cost) VALUES (?, ?, ?, ?)',
            [vehicle, date, liters || 0, cost || 0]
        );
        res.json({ success: true, message: 'Fuel log added successfully', insertId: result.insertId });
    } catch (err) {
        console.error('Error adding fuel log:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Delete Fuel Log
app.delete('/api/fuel_logs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM fuel_logs WHERE id = ?', [id]);
        res.json({ success: true, message: 'Fuel log deleted successfully' });
    } catch (err) {
        console.error('Error deleting fuel log:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Fetch Expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM expenses ORDER BY id DESC');
        res.json({ success: true, expenses: rows });
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Add Expense
app.post('/api/expenses', async (req, res) => {
    const { trip, vehicle, toll, other, maint, status } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO expenses (trip, vehicle, toll, other, maint, status) VALUES (?, ?, ?, ?, ?, ?)',
            [trip, vehicle, toll || 0, other || 0, maint || 0, status || 'Available']
        );
        res.json({ success: true, message: 'Expense added successfully', insertId: result.insertId });
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API: Delete Expense
app.delete('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (err) {
        console.error('Error deleting expense:', err);
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
