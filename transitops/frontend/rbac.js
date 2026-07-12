/**
 * TransitOps RBAC
 * Pure CSS-injection based access control. No mutation observers, no loops.
 *
 * Role → Allowed Pages (+ access level)
 * ────────────────────────────────────────────────────────────────────
 * Administrator    → ALL pages (full R/W)
 * Fleet Manager    → Dashboard, Fleet (R/W), Drivers (R/W), Analytics (R/W)
 * Dispatcher       → Dashboard, Fleet (view-only), Trips (R/W)
 * Safety Officer   → Dashboard, Drivers (R/W), Trips (view-only)
 * Financial Analyst→ Dashboard, Fleet (view-only), Fuel Expenses (R/W), Analytics (R/W)
 *
 * Settings → Administrator only
 * Dashboard → ALL roles (read)
 */
(function () {
    const role = localStorage.getItem('userRole');
    if (!role) return;

    const path = window.location.pathname.toLowerCase();
    const css = [];

    // ── Sidebar links hidden per role ────────────────────────────────────────
    const HIDE_LINKS = {
        'Fleet Manager': [
            'dispatcher.html',
            'fuel_expenses.html',
            'maintenance.html',
            'settings.html'
        ],
        'Dispatcher': [
            'drivers_safety.html',
            'analytics.html',
            'fuel_expenses.html',
            'maintenance.html',
            'settings.html'
        ],
        'Safety Officer': [
            'fleet_management.html',
            'analytics.html',
            'fuel_expenses.html',
            'maintenance.html',
            'settings.html'
        ],
        'Financial Analyst': [
            'dispatcher.html',
            'drivers_safety.html',
            'maintenance.html',
            'settings.html'
        ]
    };

    // Settings always hidden for non-admins (catch-all)
    const hiddenLinks = role === 'Administrator' ? [] : (HIDE_LINKS[role] || []);
    hiddenLinks.forEach(page => {
        css.push(`a[href*="${page}"] { display:none !important; }`);
    });

    // ── View-only: hide write controls on specific pages ─────────────────────

    // Dispatcher on Fleet
    if (role === 'Dispatcher' && path.includes('fleet_management.html')) {
        css.push(
            '#addVehicleBtn                        { display:none !important; }',
            'button[onclick="openVehicleModal()"]  { display:none !important; }',
            '#addVehicleModal                      { display:none !important; }',
            'table thead th:last-child             { display:none !important; }',
            '#vehicleTableBody td:last-child       { display:none !important; }'
        );
    }

    // Safety Officer on Trips (view-only: hide Create Trip form + Edit/Dispatch buttons)
    if (role === 'Safety Officer' && path.includes('dispatcher.html')) {
        css.push(
            '#createTripForm                       { display:none !important; }',
            'button[onclick^="editDraft"]          { display:none !important; }',
            'button[onclick^="dispatchTrip"]       { display:none !important; }',
            '#saveDraftBtn                         { display:none !important; }'
        );
    }

    // Financial Analyst on Fleet (view-only: same as Dispatcher)
    if (role === 'Financial Analyst' && path.includes('fleet_management.html')) {
        css.push(
            '#addVehicleBtn                        { display:none !important; }',
            'button[onclick="openVehicleModal()"]  { display:none !important; }',
            '#addVehicleModal                      { display:none !important; }',
            'table thead th:last-child             { display:none !important; }',
            '#vehicleTableBody td:last-child       { display:none !important; }'
        );
    }

    // Non-admin safety: block settings.html via CSS too (belt + suspenders)
    if (role !== 'Administrator') {
        css.push('a[href*="settings.html"] { display:none !important; }');
    }

    // Apply all CSS rules at once
    if (css.length) {
        const style = document.createElement('style');
        style.textContent = css.join('\n');
        document.head.appendChild(style);
    }

    // ── Page-level URL guard (redirect if user navigates directly) ────────────
    const BLOCKED_PAGES = {
        'Administrator':     [],   // no restrictions
        'Fleet Manager':     ['dispatcher.html', 'fuel_expenses.html', 'maintenance.html', 'settings.html'],
        'Dispatcher':        ['drivers_safety.html', 'analytics.html', 'fuel_expenses.html', 'maintenance.html', 'settings.html'],
        'Safety Officer':    ['fleet_management.html', 'analytics.html', 'fuel_expenses.html', 'maintenance.html', 'settings.html'],
        'Financial Analyst': ['dispatcher.html', 'drivers_safety.html', 'maintenance.html', 'settings.html']
    };

    // Catch-all: non-admin cannot access settings regardless
    if (role !== 'Administrator' && path.includes('settings.html')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const blocked = BLOCKED_PAGES[role] || [];
    if (blocked.some(p => path.includes(p))) {
        window.location.href = 'dashboard.html';
    }
})();
