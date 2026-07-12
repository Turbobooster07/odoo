# TransitOps Fleet Management Dashboard

TransitOps is a modern, high-performance fleet management interface featuring a Formula-1 inspired technical aesthetic. It includes a complete frontend interface hooked up to a Node.js backend and a MySQL database for real-time asset tracking and authentication.

## Features
- **Role-Based Authentication**: Secure login system for Dispatchers, Fleet Managers, and Administrators.
- **Live Fleet Dashboard**: Real-time vehicle tracking, status indicators (Active, In Shop, Available), and maintenance schedules.
- **Premium Tech Aesthetic**: Designed using the `Orbitron` display font for high-speed technical headings and `Titillium Web` for exceptional data readability.
- **Responsive Layout**: Built with Tailwind CSS to work seamlessly across desktop and mobile views.

## Tech Stack
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (CDN)
- **Backend**: Node.js, Express.js
- **Database**: MySQL (via `mysql2` connection pool)

## Setup & Installation

### 1. Database Setup
You will need a MySQL server running locally (e.g., via XAMPP, WAMP, or standalone).
1. Open your MySQL client.
2. Run the provided SQL script to build the database and seed it with mock data:
   ```bash
   mysql -u root -p < modern_login/schema.sql
   ```
   *(This creates the `odoo` database with `users` and `vehicles` tables).*

### 2. Backend Configuration
Navigate to the project directory:
```bash
cd modern_login
```

Install the required Node.js dependencies:
```bash
npm install
```

Configure your environment variables by checking the `.env` file (adjust your MySQL credentials if they differ from the defaults):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=odoo
PORT=3000
```

## Running the Application

1. Start the Node.js Express server:
   ```bash
   node server.js
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

### Test Credentials
You can log in using the mock data seeded in the database:
- **Email:** `admin` (or `dispatcher1`)
- **Password:** `password123` (or `dispatch123`)
- **Role:** Select the matching role from the dropdown.