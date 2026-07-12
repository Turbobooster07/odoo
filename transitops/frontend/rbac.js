(function() {
    const role = localStorage.getItem('userRole');
    if (!role) {
        window.location.href = 'index.html';
        return;
    }

    const currentPath = window.location.pathname.toLowerCase();

    // Enforce access control based on explicit whitelists/blacklists
    if (role === 'Dispatcher') {
        const allowed = ['dispatcher.html', 'fleet_management.html', 'index.html'];
        const isAllowed = allowed.some(p => currentPath.includes(p)) || currentPath === '/' || currentPath === '';
        if (!isAllowed) {
            window.location.href = 'dispatcher.html';
            return;
        }
    } else if (role === 'Fleet Manager') {
        if (currentPath.includes('dispatcher.html')) {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    const enforceUI = () => {
        // Hide unauthorized sidebar links
        const navLinks = document.querySelectorAll('a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            if (role === 'Dispatcher') {
                if (!href.includes('dispatcher.html') && !href.includes('fleet_management.html') && !href.includes('index.html') && href !== '#') {
                    link.style.display = 'none';
                    link.remove();
                }
            } else if (role === 'Fleet Manager') {
                if (href.includes('dispatcher.html')) {
                    link.style.display = 'none';
                    link.remove();
                }
            }
        });

        // Specific view-only UI rules for Fleet Management
        if (role === 'Dispatcher' && currentPath.includes('fleet_management.html')) {
            const hideActions = () => {
                const allButtons = document.querySelectorAll('button');
                allButtons.forEach(btn => {
                    const text = (btn.textContent || '').toLowerCase();
                    // Hide Add Vehicle / Add Asset button
                    if ((text.includes('asset') || text.includes('vehicle')) && btn.innerHTML.includes('add')) {
                        btn.style.display = 'none';
                        btn.remove();
                    }
                    
                    // Hide table action menus (more_vert)
                    if (btn.innerHTML.includes('more_vert') || btn.innerHTML.includes('edit') || btn.innerHTML.includes('delete')) {
                        btn.style.display = 'none';
                        btn.remove();
                        const parentTd = btn.closest('td');
                        if (parentTd) {
                            parentTd.style.visibility = 'hidden';
                        }
                    }
                });
                
                // Hide specific "Add Asset" button
                const addAssetBtn = document.querySelector('#addVehicleBtn');
                if (addAssetBtn) { addAssetBtn.style.display = 'none'; addAssetBtn.remove(); }
                const addVehicleBtnAttr = document.querySelector('button[onclick="openVehicleModal()"]');
                if (addVehicleBtnAttr) { addVehicleBtnAttr.style.display = 'none'; addVehicleBtnAttr.remove(); }
            };
            
            // Run immediately
            hideActions();
            
            // And run on DOM mutations (since the table is populated by JS!)
            if (!window._rbacObserver) {
                window._rbacObserver = new MutationObserver(() => {
                    hideActions();
                });
                const tbody = document.getElementById('vehiclesTableBody');
                if(tbody) {
                    window._rbacObserver.observe(tbody, { childList: true, subtree: true });
                } else if(document.body) {
                    window._rbacObserver.observe(document.body, { childList: true, subtree: true });
                }
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enforceUI);
    } else {
        enforceUI();
    }
})();
