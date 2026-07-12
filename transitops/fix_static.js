const fs = require('fs');

// 1. Fix fleet_management.html
let fleetHtml = fs.readFileSync('frontend/fleet_management.html', 'utf8');
fleetHtml = fleetHtml.replace(/<span class="font-label-md text-green-600 flex items-center gap-1">\+4% <span class="material-symbols-outlined text-sm">trending_up<\/span><\/span>/, '');
fs.writeFileSync('frontend/fleet_management.html', fleetHtml, 'utf8');
console.log('fleet_management.html cleaned');

// 2. Fix dashboard.html
let dashHtml = fs.readFileSync('frontend/dashboard.html', 'utf8');
// Remove static percentages
dashHtml = dashHtml.replace(/<span class="font-label-md text-green-600 flex items-center gap-1">\+4% <span class="material-symbols-outlined text-sm">trending_up<\/span><\/span>/, '');
dashHtml = dashHtml.replace(/<span class="font-label-md text-red-600 flex items-center gap-1">-2% <span class="material-symbols-outlined text-sm">trending_down<\/span><\/span>/, '');
dashHtml = dashHtml.replace(/<span class="font-label-md text-green-600 flex items-center gap-1">\+1\.2% <span class="material-symbols-outlined text-sm">trending_up<\/span><\/span>/, '');
dashHtml = dashHtml.replace(/<span class="font-label-md text-green-600 flex items-center gap-1">\+8% <span class="material-symbols-outlined text-sm">trending_up<\/span><\/span>/, '');

// Replace Card 2: Fuel Efficiency -> Active Drivers
dashHtml = dashHtml.replace(/Fuel Efficiency/, 'Available Drivers');
dashHtml = dashHtml.replace(/<span class="font-headline-lg text-headline-lg font-bold">8\.4<span class="text-on-surface-variant font-normal text-body-sm"> mpg<\/span><\/span>/, '<span class="font-headline-lg text-headline-lg font-bold" id="kpiActiveDrivers">--</span>');

// Replace Card 3: On-Time Rate -> Pending Maintenance
dashHtml = dashHtml.replace(/On-Time Rate/, 'Pending Maintenance');
dashHtml = dashHtml.replace(/<span class="font-headline-lg text-headline-lg font-bold">96\.8%<\/span>/, '<span class="font-headline-lg text-headline-lg font-bold" id="kpiPendingMaintenance">--</span>');

// Replace Card 4: Total Revenue -> Total Trips
dashHtml = dashHtml.replace(/Total Revenue/, 'Total Trips');
dashHtml = dashHtml.replace(/<span class="font-headline-lg text-headline-lg font-bold">?12\.4k<span class="text-on-surface-variant font-normal text-body-sm"> today<\/span><\/span>/, '<span class="font-headline-lg text-headline-lg font-bold" id="kpiTotalTrips">--</span>');

// Update script to fetch from /api/drivers and /api/maintenance too
const fetchScriptOld = \const [vehiclesRes, tripsRes] = await Promise.all([
            fetch('http://localhost:3000/api/vehicles'),
            fetch('http://localhost:3000/api/trips')
        ]);
        const vData = await vehiclesRes.json();
        const tData = await tripsRes.json();\;

const fetchScriptNew = \const [vehiclesRes, tripsRes, driversRes, maintRes] = await Promise.all([
            fetch('http://localhost:3000/api/vehicles'),
            fetch('http://localhost:3000/api/trips'),
            fetch('http://localhost:3000/api/drivers'),
            fetch('http://localhost:3000/api/maintenance')
        ]);
        const vData = await vehiclesRes.json();
        const tData = await tripsRes.json();
        const dData = await driversRes.json();
        const mData = await maintRes.json();\;

dashHtml = dashHtml.replace(fetchScriptOld, fetchScriptNew);

// Add logic to populate new KPIs
const kpiUpdateOld = \// Update KPI
        const totalVehicles = vData.vehicles.length;
        const activeVehicles = vData.vehicles.filter(v => v.status === 'On Trip' || v.status === 'Available').length;
        document.getElementById('kpiActiveVehicles').innerHTML = \\\\\\<span class="text-on-surface-variant font-normal text-body-sm">/\\\</span>\\\;\;

const kpiUpdateNew = \// Update KPI
        const totalVehicles = vData.vehicles ? vData.vehicles.length : 0;
        const activeVehicles = vData.vehicles ? vData.vehicles.filter(v => v.status === 'On Trip' || v.status === 'Available').length : 0;
        document.getElementById('kpiActiveVehicles').innerHTML = \\\\\\<span class="text-on-surface-variant font-normal text-body-sm">/\\\</span>\\\;
        
        if (dData.drivers) {
            const availableDrivers = dData.drivers.filter(d => d.status === 'Available').length;
            document.getElementById('kpiActiveDrivers').innerHTML = \\\\\\<span class="text-on-surface-variant font-normal text-body-sm">/\\\</span>\\\;
        }
        
        if (mData.logs) {
            const pendingMaint = mData.logs.filter(m => m.status === 'Pending').length;
            document.getElementById('kpiPendingMaintenance').innerText = pendingMaint;
        }
        
        if (tData.trips) {
            document.getElementById('kpiTotalTrips').innerText = tData.trips.length;
        }\;

dashHtml = dashHtml.replace(kpiUpdateOld, kpiUpdateNew);

fs.writeFileSync('frontend/dashboard.html', dashHtml, 'utf8');
console.log('dashboard.html cleaned');
