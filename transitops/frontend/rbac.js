(function() {
    const role = localStorage.getItem('userRole');
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes('index.html') || currentPath === '/' || currentPath === '';

    // If no role is stored, redirect to login page (unless already on it)
    if (!role) {
        if (!isLoginPage) {
            window.location.href = 'index.html';
        }
        return;
    }

    // Sidebar links each role is ALLOWED to see
    // dashboard.html is always allowed for all roles
    const SIDEBAR_ACCESS = {
        'Fleet Manager': [
            'dashboard.html',
            'fleet_management.html',
            'drivers_safety.html',
            'maintenance.html',
            'settings.html'
        ],
        'Dispatcher': [
            'dashboard.html',
            'dispatcher.html',
            'fleet_management.html',
            'settings.html'
        ],
        'Safety Officer': [
            'dashboard.html',
            'drivers_safety.html',
            'dispatcher.html',
            'settings.html'
        ],
        'Financial Analyst': [
            'dashboard.html',
            'fleet_management.html',
            'fuel_expenses.html',
            'settings.html'
        ],
        'Administrator': [
            'dashboard.html',
            'fleet_management.html',
            'drivers_safety.html',
            'dispatcher.html',
            'fuel_expenses.html',
            'maintenance.html',
            'settings.html'
        ]
    };

    // Pages where the role only has "View-Only" access
    const VIEW_ONLY_PAGES = {
        'Dispatcher': ['fleet_management.html'],
        'Safety Officer': ['dispatcher.html'],
        'Financial Analyst': ['fleet_management.html']
    };

    const userAllowedPages = SIDEBAR_ACCESS[role] || ['dashboard.html'];

    // 1. Enforce page-level redirect — if accessing a page not in whitelist, bounce to dashboard
    if (!isLoginPage) {
        const isAllowed = userAllowedPages.some(page => currentPath.includes(page.toLowerCase()));
        if (!isAllowed) {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    // 2. Inject CSS to hide unauthorized sidebar links and enforce view-only restrictions
    const styleEl = document.createElement('style');
    let cssRules = '';

    // All known pages we might link to in the sidebar
    const allKnownPages = [
        { name: 'dashboard.html', selector: 'a[href*="dashboard.html"]' },
        { name: 'fleet_management.html', selector: 'a[href*="fleet_management.html"]' },
        { name: 'drivers_safety.html', selector: 'a[href*="drivers_safety.html"]' },
        { name: 'dispatcher.html', selector: 'a[href*="dispatcher.html"]' },
        { name: 'maintenance.html', selector: 'a[href*="maintenance.html"]' },
        { name: 'fuel_expenses.html', selector: 'a[href*="fuel_expenses.html"]' }
    ];

    // Hide any sidebar link not in the user's allowed list
    allKnownPages.forEach(page => {
        const allowed = userAllowedPages.some(p => page.name === p);
        if (!allowed) {
            cssRules += `${page.selector} { display: none !important; }\n`;
        }
    });

    // --- View-Only: Fleet Management page ---
    const userViewOnlyPages = VIEW_ONLY_PAGES[role] || [];
    const isFleetViewOnly = userViewOnlyPages.includes('fleet_management.html') && currentPath.includes('fleet_management.html');
    if (isFleetViewOnly) {
        cssRules += `
            /* Hide Add Vehicle Button */
            #addVehicleBtn,
            button[onclick="openVehicleModal()"] { display: none !important; }
            /* Hide Action column (last column header + each row's last cell) */
            table thead th:last-child,
            table tbody td:last-child { display: none !important; }
        `;
    }

    // --- View-Only: Dispatcher / Trips page ---
    const isTripsViewOnly = userViewOnlyPages.includes('dispatcher.html') && currentPath.includes('dispatcher.html');
    if (isTripsViewOnly) {
        cssRules += `
            /* Hide the Create Trip Form (left column) */
            #createTripForm { display: none !important; }
            /* Hide the parent wrapper of the form */
            .flex.flex-col.lg\\:flex-row.gap-8 > div:first-child { display: none !important; }
            /* Make Live Board full width */
            .flex.flex-col.lg\\:flex-row.gap-8 > div:last-child { width: 100% !important; }
            /* Hide Edit and Dispatch buttons on trip cards */
            button[onclick^="editDraft"],
            button[onclick^="dispatchTrip"] { display: none !important; }
        `;
    }

    styleEl.textContent = cssRules;
    document.head.appendChild(styleEl);

    // 3. DOMContentLoaded cleanup: remove "Add Vehicle" buttons by text content (declarative CSS can't do :contains)
    document.addEventListener('DOMContentLoaded', () => {
        if (isFleetViewOnly) {
            document.querySelectorAll('button').forEach(btn => {
                const text = (btn.textContent || '').toLowerCase().trim();
                if (text.includes('add vehicle') || text.includes('add asset')) {
                    btn.remove();
                }
            });
        }
    });
})();
