const fs = require('fs');
const files = ['index.html', 'dashboard.html', 'fleet_management.html', 'drivers_safety.html', 'dispatcher.html', 'maintenance.html', 'fuel_expenses.html', 'settings.html', 'analytics.html'];

files.forEach(file => {
    try {
        let content = fs.readFileSync('frontend/' + file, 'utf8');
        let modified = false;

        if (content.includes('<script src="rbac.js"></script>')) {
            content = content.replace(/<script src="rbac.js"><\/script>\n?/g, '');
            modified = true;
        }

        if (file === 'index.html' && !content.includes('<script src="auth.js"></script>')) {
            content = content.replace('</head>', '    <script src="auth.js"></script>\n</head>');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync('frontend/' + file, content, 'utf8');
            console.log('Cleaned up ' + file);
        }
    } catch (e) {
        console.log('Skipping ' + file + ' (' + e.message + ')');
    }
});
