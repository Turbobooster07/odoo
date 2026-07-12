(function () {
    const ROLE_HOME = {
        administrator: 'dashboard.html',
        fleet_manager: 'fleet_management.html',
        dispatcher: 'dispatcher.html',
        safety_officer: 'drivers_safety.html',
        financial_analyst: 'fuel_expenses.html'
    };

    const ROLE_PAGE_MODES = {
        administrator: {
            'dashboard.html': 'view',
            'fleet_management.html': 'write',
            'drivers_safety.html': 'write',
            'dispatcher.html': 'write',
            'fuel_expenses.html': 'write',
            'analytics.html': 'write',
            'settings.html': 'write'
        },
        fleet_manager: {
            'dashboard.html': 'view',
            'fleet_management.html': 'write',
            'drivers_safety.html': 'write',
            'analytics.html': 'write',
            'settings.html': 'view'
        },
        dispatcher: {
            'dashboard.html': 'view',
            'fleet_management.html': 'view',
            'dispatcher.html': 'write',
            'settings.html': 'view'
        },
        safety_officer: {
            'dashboard.html': 'view',
            'drivers_safety.html': 'write',
            'dispatcher.html': 'view',
            'settings.html': 'view'
        },
        financial_analyst: {
            'dashboard.html': 'view',
            'fleet_management.html': 'view',
            'fuel_expenses.html': 'write',
            'analytics.html': 'write',
            'settings.html': 'view'
        }
    };

    const READ_ONLY_RULES = {
        'fleet_management.html': {
            forms: ['#vehicleForm'],
            hide: ['#addVehicleBtn', '#vehicleForm button[type="submit"]', '[onclick*="deleteVehicle("]'],
            disable: ['#newVehicleId', '#newVehicleName', '#newVehicleType', '#newVehicleStatus', '#newAssignedDriver', '#newMaintenanceDate', '#newWeightCapacity'],
            blockFunctions: ['openVehicleModal', 'deleteVehicle']
        },
        'drivers_safety.html': {
            forms: ['#driverForm'],
            hide: ['#addDriverBtn', '#driverForm button[type="submit"]', '[onclick*="editDriver("]', '[onclick*="deleteDriver("]', '[onclick*="toggleDropdown("]'],
            disable: ['#driverName', '#licenseNo', '#category', '#expiry', '#contact', '#tripCompl', '#safety', '#status'],
            blockFunctions: ['editDriver', 'deleteDriver']
        },
        'dispatcher.html': {
            forms: ['#createTripForm'],
            hide: ['#saveDraftBtn', '#createTripForm button[type="submit"]'],
            disable: ['#source', '#destination', '#vehicle', '#driver', '#weight'],
            blockFunctions: []
        },
        'fuel_expenses.html': {
            forms: ['#fuelForm', '#expenseForm'],
            hide: ['button[onclick*="openModal(\'fuel\')"]', 'button[onclick*="openModal(\'expense\')"]', '#fuelForm button[type="submit"]', '#expenseForm button[type="submit"]', '[onclick*="deleteFuel("]', '[onclick*="deleteExpense("]'],
            disable: ['#fuelVehicle', '#fuelDate', '#fuelLiters', '#fuelCost', '#expTrip', '#expVehicle', '#expToll', '#expOther', '#expMaint', '#expStatus'],
            blockFunctions: ['openModal', 'deleteFuel', 'deleteExpense']
        },
        'maintenance.html': {
            forms: ['#maintenance-form'],
            hide: ['#submit-btn'],
            disable: ['#vehicle-select', '#service-type-input', '#cost-input', '#date-input', '#status-select'],
            blockFunctions: []
        }
    };

    function normalizeRole(role) {
        return (role || '').toString().trim().toLowerCase().replace(/\s+/g, '_');
    }

    function getCurrentPage() {
        const path = window.location.pathname.split('/').pop();
        return path || 'index.html';
    }

    function getStoredUser() {
        try {
            const rawUser = localStorage.getItem('transitops_user');
            return rawUser ? JSON.parse(rawUser) : null;
        } catch (error) {
            return null;
        }
    }

    function storeSession(user) {
        const normalizedRole = normalizeRole(user && user.role);
        const payload = {
            ...user,
            role: normalizedRole
        };

        localStorage.setItem('transitops_user', JSON.stringify(payload));
        localStorage.setItem('transitops_role', normalizedRole);
        sessionStorage.setItem('transitops_role', normalizedRole);
        return payload;
    }

    function clearSession() {
        localStorage.removeItem('transitops_user');
        localStorage.removeItem('transitops_role');
        sessionStorage.removeItem('transitops_role');
    }

    function getActiveRole() {
        return normalizeRole(sessionStorage.getItem('transitops_role') || localStorage.getItem('transitops_role') || (getStoredUser() && getStoredUser().role));
    }

    function homeForRole(role) {
        return ROLE_HOME[normalizeRole(role)] || 'dashboard.html';
    }

    function getPageMode(role, page) {
        const normalizedRole = normalizeRole(role);
        return ROLE_PAGE_MODES[normalizedRole] && ROLE_PAGE_MODES[normalizedRole][page] ? ROLE_PAGE_MODES[normalizedRole][page] : null;
    }

    function canAccess(role, page) {
        if (page === 'index.html' || page === 'downloaded_screen.html') {
            return true;
        }

        const normalizedRole = normalizeRole(role);
        if (!normalizedRole) {
            return false;
        }

        return Boolean(getPageMode(normalizedRole, page));
    }

    function pruneNav(role) {
        const currentPage = getCurrentPage();
        const allowedPages = new Set([
            ...Object.keys(ROLE_PAGE_MODES[normalizeRole(role)] || {}),
            'index.html',
            'downloaded_screen.html'
        ]);

        document.querySelectorAll('a[href$=".html"]').forEach(link => {
            const href = (link.getAttribute('href') || '').split('?')[0].split('#')[0];
            if (!href || href === 'index.html') {
                return;
            }

            if (!allowedPages.has(href) && href !== currentPage) {
                link.style.display = 'none';
            }
        });
    }

    function applyReadOnlyMode(role) {
        const page = getCurrentPage();
        const pageMode = getPageMode(role, page);
        if (pageMode !== 'view') {
            return;
        }

        const rules = READ_ONLY_RULES[page];
        if (!rules) {
            return;
        }

        const hideTargets = rules.hide || [];
        hideTargets.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.style.display = 'none';
            });
        });

        const disableTargets = rules.disable || [];
        disableTargets.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.disabled = true;
                element.setAttribute('aria-disabled', 'true');
            });
        });

        (rules.forms || []).forEach(selector => {
            document.querySelectorAll(selector).forEach(form => {
                form.addEventListener('submit', event => {
                    event.preventDefault();
                    event.stopPropagation();
                }, true);
            });
        });

        (rules.blockFunctions || []).forEach(functionName => {
            window[functionName] = function () {
                return false;
            };
        });
    }

    function enforceAccess() {
        const currentPage = getCurrentPage();

        if (currentPage === 'index.html' || currentPage === 'downloaded_screen.html') {
            return;
        }

        const role = getActiveRole();
        if (!role) {
            window.location.replace('index.html');
            return;
        }

        if (!canAccess(role, currentPage)) {
            window.location.replace(homeForRole(role));
            return;
        }

        pruneNav(role);
        applyReadOnlyMode(role);

        document.querySelectorAll('a[href="index.html"]').forEach(link => {
            link.addEventListener('click', () => {
                clearSession();
            });
        });

        renderUserProfile();
    }

    function renderUserProfile() {
        const user = getStoredUser();
        if (!user) return;
        
        let roleName = user.role || 'User';
        let emailName = user.email || 'Admin';
        if (emailName.includes('@')) {
            emailName = emailName.split('@')[0];
            emailName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        let initials = emailName.substring(0, 2).toUpperCase();

        // 1. Sidebar profile
        const sidebarDiv = document.querySelector('aside .mt-auto');
        if (sidebarDiv && sidebarDiv.children.length >= 2) {
            const avatarDiv = sidebarDiv.children[0];
            const textDiv = sidebarDiv.children[1];
            
            if (avatarDiv) {
                avatarDiv.innerHTML = `<div class="w-full h-full flex items-center justify-center font-bold text-white bg-primary">${initials}</div>`;
            }
            if (textDiv) {
                // Ensure we don't accidentally overwrite if structure differs, but it should be standard
                textDiv.innerHTML = `
                    <span class="font-label-md text-label-md text-on-primary-container font-bold">${emailName}</span>
                    <span class="font-label-md text-[10px] text-on-primary-container opacity-60">${roleName}</span>
                `;
            }
        }

        // 2. Topbar profile
        const topbarDiv = document.querySelector('header .gap-3.cursor-pointer');
        if (topbarDiv) {
            topbarDiv.innerHTML = `
                <span class="font-label-md text-label-md font-bold text-primary">${emailName}</span>
                <div class="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-xs">${initials}</div>
            `;
        }
    }

    window.TransitOpsAuth = {
        normalizeRole,
        storeSession,
        clearSession,
        getActiveRole,
        homeForRole,
        getPageMode,
        canAccess,
        enforceAccess
    };

    document.addEventListener('DOMContentLoaded', enforceAccess);
})();