
// ============================================================================
// WINDMILL SALES TERRITORY V2
// Interactive postcode map, territory intelligence and route planning.
// Uses Leaflet/OpenStreetMap and postcodes.io. No SQL is required.
// ============================================================================

SalesOS.territoryVenuePostcode = localStorage.getItem('windmill_territory_venue_postcode') || 'LN6 3QZ';
SalesOS.territorySelectedIds = JSON.parse(localStorage.getItem('windmill_territory_selected_ids') || '[]');
SalesOS.territoryCoordinates = JSON.parse(localStorage.getItem('windmill_territory_coordinates') || '{}');
SalesOS.territoryMap = null;
SalesOS.territoryMarkers = [];
SalesOS.territoryRoute = [];

SalesOS.normalisePostcode = function(value) {
  return String(value || '').toUpperCase().replace(/\s+/g, '').trim();
};

SalesOS.displayPostcode = function(value) {
  const postcode = SalesOS.normalisePostcode(value);
  return postcode.length > 3 ? `${postcode.slice(0, -3)} ${postcode.slice(-3)}` : postcode;
};

SalesOS.haversineMiles = function(a, b) {
  if (!a || !b) return 0;
  const radius = 3958.8;
  const radians = value => value * Math.PI / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const lat1 = radians(a.lat);
  const lat2 = radians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

SalesOS.territoryLeadTone = function(lead) {
  if (lead.status === 'Converted' || lead.relationship === 'Existing Customer') return '#16a34a';
  if (['Proposal Required', 'Proposal Sent', 'Negotiation'].includes(lead.status)) return '#7c3aed';
  if (lead.status === 'Meeting Booked') return '#2563eb';
  if (['Hot', 'Strategic'].includes(lead.relationship)) return '#d97706';
  if (!lead.lastContact) return '#111827';
  return '#dc2626';
};

SalesOS.territoryLeadLabel = function(lead) {
  if (lead.status === 'Converted' || lead.relationship === 'Existing Customer') return 'Existing customer';
  if (['Proposal Required', 'Proposal Sent', 'Negotiation'].includes(lead.status)) return 'Proposal / negotiation';
  if (lead.status === 'Meeting Booked') return 'Meeting booked';
  if (['Hot', 'Strategic'].includes(lead.relationship)) return 'Warm / strategic';
  if (!lead.lastContact) return 'Never contacted';
  return 'Cold prospect';
};

SalesOS.ensureLeaflet = async function() {
  if (window.L) return;

  if (!document.querySelector('link[data-sales-territory-leaflet]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.dataset.salesTerritoryLeaflet = 'true';
    document.head.appendChild(link);
  }

  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-sales-territory-leaflet]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      if (window.L) resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.dataset.salesTerritoryLeaflet = 'true';
    script.onload = resolve;
    script.onerror = () => reject(new Error('The map library could not be loaded.'));
    document.head.appendChild(script);
  });
};

SalesOS.geocodePostcode = async function(postcode) {
  const normalised = SalesOS.normalisePostcode(postcode);
  if (!normalised) return null;
  if (SalesOS.territoryCoordinates[normalised]) return SalesOS.territoryCoordinates[normalised];

  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(normalised)}`);
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload.result) return null;

    const coordinate = {
      lat: Number(payload.result.latitude),
      lng: Number(payload.result.longitude),
      postcode: payload.result.postcode,
      district: payload.result.admin_district || '',
      ward: payload.result.admin_ward || ''
    };

    SalesOS.territoryCoordinates[normalised] = coordinate;
    localStorage.setItem('windmill_territory_coordinates', JSON.stringify(SalesOS.territoryCoordinates));
    return coordinate;
  } catch (error) {
    console.warn('Postcode geocoding failed', postcode, error);
    return null;
  }
};

SalesOS.geocodeTerritoryLeads = async function(showProgress = true) {
  const leads = (DB.salesLeads || []).filter(lead => activeSalesLead(lead) && SalesOS.normalisePostcode(lead.postcode));
  const unique = [...new Set(leads.map(lead => SalesOS.normalisePostcode(lead.postcode)))];
  const status = document.getElementById('sales-territory-geocode-status');

  for (let index = 0; index < unique.length; index++) {
    if (showProgress && status) status.textContent = `Locating ${index + 1} of ${unique.length} postcode areas…`;
    await SalesOS.geocodePostcode(unique[index]);
  }

  await SalesOS.geocodePostcode(SalesOS.territoryVenuePostcode);
  if (status) status.textContent = `${unique.length} postcode area${unique.length === 1 ? '' : 's'} ready`;
};

SalesOS.territoryData = function() {
  const active = (DB.salesLeads || []).filter(activeSalesLead);

  return active.map(lead => {
    const postcode = SalesOS.normalisePostcode(lead.postcode);
    const coordinate = SalesOS.territoryCoordinates[postcode] || null;
    const daysSinceContact = SalesOS.daysSince(lead.lastContact);
    const neverVisited = !(SalesOS.activitiesFor(lead.id) || []).some(activity =>
      /visit/i.test(String(activity.type || ''))
    );
    const lastVisit = [...SalesOS.activitiesFor(lead.id)]
      .filter(activity => /visit/i.test(String(activity.type || '')))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0] || null;

    let territoryScore = SalesOS.priority(lead);
    if (neverVisited) territoryScore += 15;
    if (daysSinceContact !== null && daysSinceContact > 90) territoryScore += 12;
    if (Number(lead.potentialValue || 0) >= 5000) territoryScore += 12;
    if (SalesOS.territorySelectedIds.includes(lead.id)) territoryScore += 3;

    return {
      lead,
      postcode,
      coordinate,
      daysSinceContact,
      neverVisited,
      lastVisit,
      score: Math.min(180, territoryScore)
    };
  }).sort((a, b) => b.score - a.score);
};

SalesOS.territorySummary = function() {
  const rows = SalesOS.territoryData();
  const mapped = rows.filter(row => row.coordinate);
  const overdue = rows.filter(row => salesLeadOverdue(row.lead));
  const neverVisited = rows.filter(row => row.neverVisited);
  const unknownDecisionMaker = rows.filter(row => !row.lead.contactName || !row.lead.decisionMaker);
  const totalPotential = rows.reduce((sum, row) => sum + Number(row.lead.potentialValue || 0), 0);
  const selectedPotential = rows
    .filter(row => SalesOS.territorySelectedIds.includes(row.lead.id))
    .reduce((sum, row) => sum + Number(row.lead.potentialValue || 0), 0);

  return { rows, mapped, overdue, neverVisited, unknownDecisionMaker, totalPotential, selectedPotential };
};

SalesOS.toggleTerritoryLead = function(leadId, checked) {
  const ids = new Set(SalesOS.territorySelectedIds);
  if (checked) ids.add(leadId);
  else ids.delete(leadId);

  SalesOS.territorySelectedIds = [...ids];
  localStorage.setItem('windmill_territory_selected_ids', JSON.stringify(SalesOS.territorySelectedIds));
  SalesOS.refreshTerritorySelection();
};

SalesOS.clearTerritorySelection = function() {
  SalesOS.territorySelectedIds = [];
  SalesOS.territoryRoute = [];
  localStorage.setItem('windmill_territory_selected_ids', '[]');
  SalesOS.refreshTerritorySelection();
};

SalesOS.selectTopTerritoryLeads = function(count = 6) {
  SalesOS.territorySelectedIds = SalesOS.territoryData()
    .filter(row => row.coordinate)
    .slice(0, count)
    .map(row => row.lead.id);
  localStorage.setItem('windmill_territory_selected_ids', JSON.stringify(SalesOS.territorySelectedIds));
  SalesOS.refreshTerritorySelection();
};

SalesOS.refreshTerritorySelection = function() {
  document.querySelectorAll('[data-territory-lead-checkbox]').forEach(input => {
    input.checked = SalesOS.territorySelectedIds.includes(input.value);
  });

  const summary = SalesOS.territorySummary();
  const count = document.getElementById('sales-territory-selected-count');
  const value = document.getElementById('sales-territory-selected-value');
  if (count) count.textContent = SalesOS.territorySelectedIds.length;
  if (value) value.textContent = SalesOS.money(summary.selectedPotential);

  SalesOS.renderTerritoryRoutePanel();
  SalesOS.updateTerritoryMarkerStyles();
};

SalesOS.optimiseTerritoryRoute = async function() {
  const venue = await SalesOS.geocodePostcode(SalesOS.territoryVenuePostcode);
  const selected = SalesOS.territoryData().filter(row =>
    SalesOS.territorySelectedIds.includes(row.lead.id) && row.coordinate
  );

  if (!selected.length) {
    toast('Select at least one mapped business first', 'error');
    return;
  }

  const remaining = [...selected];
  const route = [];
  let current = venue || selected[0].coordinate;

  while (remaining.length) {
    remaining.sort((a, b) =>
      SalesOS.haversineMiles(current, a.coordinate) -
      SalesOS.haversineMiles(current, b.coordinate)
    );
    const next = remaining.shift();
    route.push(next);
    current = next.coordinate;
  }

  SalesOS.territoryRoute = route;
  SalesOS.renderTerritoryRoutePanel();
  SalesOS.drawTerritoryRoute();
};

SalesOS.routeSchedule = function() {
  if (!SalesOS.territoryRoute.length) return [];

  const venue = SalesOS.territoryCoordinates[SalesOS.normalisePostcode(SalesOS.territoryVenuePostcode)];
  let current = venue || SalesOS.territoryRoute[0].coordinate;
  let minutes = 9 * 60;
  const schedule = [];

  SalesOS.territoryRoute.forEach((row, index) => {
    const distance = SalesOS.haversineMiles(current, row.coordinate);
    const travelMinutes = index === 0 ? Math.max(10, Math.round(distance / 25 * 60)) : Math.max(5, Math.round(distance / 25 * 60));
    minutes += travelMinutes;

    const start = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    const visitMinutes = 20;
    schedule.push({ ...row, distance, travelMinutes, start, visitMinutes });
    minutes += visitMinutes;
    current = row.coordinate;
  });

  return schedule;
};

SalesOS.renderTerritoryRoutePanel = function() {
  const panel = document.getElementById('sales-territory-route-panel');
  if (!panel) return;

  const selected = SalesOS.territoryData().filter(row =>
    SalesOS.territorySelectedIds.includes(row.lead.id)
  );

  if (!selected.length) {
    panel.innerHTML = `<div class="text-center py-8 text-gray-400">
      <i data-lucide="route" class="mx-auto mb-2"></i>
      <p class="text-sm">Select businesses from the map or target list to build today’s route.</p>
    </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const route = SalesOS.territoryRoute.length
    ? SalesOS.routeSchedule()
    : selected.map(row => ({ ...row, start: '—', distance: 0 }));

  panel.innerHTML = `<div class="space-y-3">
    ${route.map((row, index) => `<div class="rounded-xl border border-gray-200 p-3 ${SalesOS.territoryRoute.length ? 'bg-cream-50' : 'bg-white'}">
      <div class="flex items-start gap-3">
        <span class="w-7 h-7 rounded-full bg-olive-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">${index + 1}</span>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between gap-3">
            <strong class="text-sm truncate">${esc(row.lead.companyName)}</strong>
            <span class="text-xs font-semibold">${SalesOS.money(row.lead.potentialValue)}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">${esc(SalesOS.displayPostcode(row.lead.postcode) || 'No postcode')} · ${esc(row.lead.status)}</p>
          ${SalesOS.territoryRoute.length ? `<p class="text-xs text-olive-700 mt-1">${row.start} · approx. ${row.travelMinutes} min travel · ${row.visitMinutes} min visit</p>` : ''}
        </div>
        <button onclick="SalesOS.openLiveCall('${row.lead.id}')" class="text-xs font-semibold text-olive-700">Open</button>
      </div>
    </div>`).join('')}
    <div class="grid grid-cols-2 gap-2 pt-2">
      <button onclick="SalesOS.optimiseTerritoryRoute()" class="py-2.5 bg-charcoal-900 text-white rounded-lg text-sm font-semibold">Optimise Route</button>
      <button onclick="SalesOS.clearTerritorySelection()" class="py-2.5 bg-gray-100 rounded-lg text-sm font-semibold">Clear</button>
    </div>
  </div>`;

  if (window.lucide) lucide.createIcons();
};

SalesOS.createTerritoryMarkerIcon = function(row, selected = false) {
  const colour = SalesOS.territoryLeadTone(row.lead);
  const size = selected ? 24 : Number(row.lead.potentialValue || 0) >= 10000 ? 21 : 17;
  const border = selected ? '4px solid #fbbf24' : '3px solid white';

  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${colour};border:${border};box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

SalesOS.updateTerritoryMarkerStyles = function() {
  SalesOS.territoryMarkers.forEach(({ marker, row }) => {
    marker.setIcon(SalesOS.createTerritoryMarkerIcon(
      row,
      SalesOS.territorySelectedIds.includes(row.lead.id)
    ));
  });
};

SalesOS.drawTerritoryRoute = function() {
  if (!SalesOS.territoryMap || !SalesOS.territoryRoute.length) return;

  if (SalesOS.territoryRouteLine) {
    SalesOS.territoryMap.removeLayer(SalesOS.territoryRouteLine);
  }

  const venue = SalesOS.territoryCoordinates[SalesOS.normalisePostcode(SalesOS.territoryVenuePostcode)];
  const points = [
    ...(venue ? [[venue.lat, venue.lng]] : []),
    ...SalesOS.territoryRoute.map(row => [row.coordinate.lat, row.coordinate.lng])
  ];

  SalesOS.territoryRouteLine = L.polyline(points, {
    color: '#647c36',
    weight: 4,
    opacity: 0.8,
    dashArray: '8 8'
  }).addTo(SalesOS.territoryMap);

  SalesOS.territoryMap.fitBounds(SalesOS.territoryRouteLine.getBounds(), { padding: [35, 35] });
};

SalesOS.initialiseTerritoryMap = async function() {
  const mapElement = document.getElementById('sales-territory-map');
  if (!mapElement) return;

  try {
    await SalesOS.ensureLeaflet();
    await SalesOS.geocodeTerritoryLeads();

    if (SalesOS.territoryMap) {
      SalesOS.territoryMap.remove();
      SalesOS.territoryMap = null;
    }

    const venue = await SalesOS.geocodePostcode(SalesOS.territoryVenuePostcode);
    const rows = SalesOS.territoryData().filter(row => row.coordinate);
    const centre = venue || rows[0]?.coordinate || { lat: 53.2307, lng: -0.5406 };

    SalesOS.territoryMap = L.map(mapElement, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([centre.lat, centre.lng], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(SalesOS.territoryMap);

    SalesOS.territoryMarkers = [];

    if (venue) {
      L.marker([venue.lat, venue.lng], {
        icon: L.divIcon({
          className: '',
          html: '<div style="width:30px;height:30px;border-radius:8px;background:#101827;color:white;border:3px solid #fbbf24;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 3px 10px rgba(0,0,0,.4)">WF</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(SalesOS.territoryMap).bindPopup(`<strong>Windmill Farm</strong><br>${esc(SalesOS.displayPostcode(SalesOS.territoryVenuePostcode))}`);
    }

    rows.forEach(row => {
      const marker = L.marker([row.coordinate.lat, row.coordinate.lng], {
        icon: SalesOS.createTerritoryMarkerIcon(row, SalesOS.territorySelectedIds.includes(row.lead.id))
      }).addTo(SalesOS.territoryMap);

      marker.bindPopup(`<div style="min-width:220px">
        <strong>${esc(row.lead.companyName)}</strong><br>
        <span>${esc(row.lead.businessType || 'Sector not set')}</span><br>
        <span>${esc(SalesOS.territoryLeadLabel(row.lead))}</span><br>
        <strong>${SalesOS.money(row.lead.potentialValue)}</strong> potential
        <div style="display:flex;gap:6px;margin-top:9px">
          <button onclick="SalesOS.toggleTerritoryLead('${row.lead.id}',true)" style="padding:6px 8px;border-radius:6px;background:#647c36;color:white;border:0;cursor:pointer">Add to route</button>
          <button onclick="SalesOS.openLiveCall('${row.lead.id}')" style="padding:6px 8px;border-radius:6px;background:#101827;color:white;border:0;cursor:pointer">Open</button>
        </div>
      </div>`);

      marker.on('click', () => {
        document.querySelector(`[data-territory-card="${row.lead.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      SalesOS.territoryMarkers.push({ marker, row });
    });

    if (rows.length) {
      const bounds = L.latLngBounds(rows.map(row => [row.coordinate.lat, row.coordinate.lng]));
      if (venue) bounds.extend([venue.lat, venue.lng]);
      SalesOS.territoryMap.fitBounds(bounds, { padding: [35, 35], maxZoom: 13 });
    }

    SalesOS.refreshTerritorySelection();
  } catch (error) {
    console.error(error);
    mapElement.innerHTML = `<div class="h-full flex items-center justify-center p-8 text-center text-red-700">
      <div><strong>The territory map could not load.</strong><p class="text-sm mt-2">Check the internet connection or continue using the postcode target list below.</p></div>
    </div>`;
  }
};

SalesOS.updateTerritoryVenuePostcode = async function(value) {
  SalesOS.territoryVenuePostcode = SalesOS.displayPostcode(value);
  localStorage.setItem('windmill_territory_venue_postcode', SalesOS.territoryVenuePostcode);
  await SalesOS.geocodePostcode(SalesOS.territoryVenuePostcode);
  SalesOS.initialiseTerritoryMap();
};

SalesOS.raiseModalAboveTerritoryMap = function() {
  // Leaflet creates internal panes with high z-index values. Raise any CRM
  // modal opened from the territory page above the entire map.
  setTimeout(() => {
    const overlays = [...document.body.querySelectorAll('.fixed.inset-0, [role="dialog"]')];

    overlays.forEach(overlay => {
      if (overlay.id === 'sales-os-live-call') return;
      overlay.style.zIndex = '10000';
    });

    // Some modal shells are inserted inside a fixed wrapper rather than being
    // the fixed element themselves.
    const visibleDialogs = [...document.querySelectorAll('[role="dialog"], .modal, .modal-overlay')]
      .filter(element => element.offsetParent !== null);

    visibleDialogs.forEach(dialog => {
      const fixedParent = dialog.closest('.fixed') || dialog;
      fixedParent.style.zIndex = '10000';
    });
  }, 0);
};

SalesOS.logTerritoryVisit = function(leadId) {
  SalesOS.territorySelectedIds = SalesOS.territorySelectedIds.filter(id => id !== leadId);
  localStorage.setItem('windmill_territory_selected_ids', JSON.stringify(SalesOS.territorySelectedIds));

  if (SalesOS.territoryMap && typeof SalesOS.territoryMap.closePopup === 'function') {
    SalesOS.territoryMap.closePopup();
  }

  openSalesActivityForm(leadId);
  SalesOS.raiseModalAboveTerritoryMap();
};

SalesOS.renderTerritory = function() {
  const summary = SalesOS.territorySummary();
  const areaGroups = {};

  summary.rows.forEach(row => {
    const area = row.postcode ? row.postcode.slice(0, -3) || row.postcode : 'NO POSTCODE';
    if (!areaGroups[area]) areaGroups[area] = { area, count: 0, potential: 0, overdue: 0, neverVisited: 0, rows: [] };
    const group = areaGroups[area];
    group.count++;
    group.potential += Number(row.lead.potentialValue || 0);
    if (salesLeadOverdue(row.lead)) group.overdue++;
    if (row.neverVisited) group.neverVisited++;
    group.rows.push(row);
  });

  const areas = Object.values(areaGroups).sort((a, b) => b.potential - a.potential);

  setTimeout(() => {
    SalesOS.initialiseTerritoryMap();
    SalesOS.renderTerritoryRoutePanel();
  }, 0);

  return `
    <div class="bg-gradient-to-r from-blue-950 via-charcoal-900 to-olive-800 text-white rounded-2xl p-5 lg:p-7 mb-4">
      <div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-widest text-blue-200">WINDMILL SALES TERRITORY</p>
          <h2 class="text-2xl lg:text-4xl font-bold mt-1">Turn postcode coverage into a daily revenue route.</h2>
          <p class="text-sm text-white/70 mt-2 max-w-4xl">Map active prospects, identify under-worked areas, select the strongest businesses and create an efficient visit order.</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button onclick="SalesOS.selectTopTerritoryLeads(6)" class="px-4 py-2.5 bg-gold-500 text-white rounded-lg font-semibold">Select Top 6</button>
          <button onclick="SalesOS.optimiseTerritoryRoute()" class="px-4 py-2.5 bg-white text-charcoal-900 rounded-lg font-semibold">Generate Today’s Route</button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-4">
      ${SalesOS.kpi('Active Territory', summary.rows.length, 'Prospects available for calls or visits', 'building-2')}
      ${SalesOS.kpi('Mapped', summary.mapped.length, `${summary.rows.length - summary.mapped.length} need valid postcodes`, 'map-pin', 'blue')}
      ${SalesOS.kpi('Territory Potential', SalesOS.money(summary.totalPotential), 'Total active prospect value', 'pound-sterling', 'green')}
      ${SalesOS.kpi('Overdue', summary.overdue.length, 'Visit or follow-up past due', 'clock-alert', summary.overdue.length ? 'red' : 'green')}
      ${SalesOS.kpi('Never Visited', summary.neverVisited.length, 'No visit activity recorded', 'footprints', 'gold')}
      ${SalesOS.kpi('Decision Makers Missing', summary.unknownDecisionMaker.length, 'Contacts requiring research', 'user-search', 'purple')}
      ${SalesOS.kpi('Selected Route', `<span id="sales-territory-selected-count">${SalesOS.territorySelectedIds.length}</span>`, 'Businesses selected today', 'route', 'olive')}
      ${SalesOS.kpi('Selected Potential', `<span id="sales-territory-selected-value">${SalesOS.money(summary.selectedPotential)}</span>`, 'Potential represented by route', 'badge-pound-sterling', 'green')}
    </div>

    <div class="grid xl:grid-cols-[1fr_360px] gap-4 mb-4">
      <section class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 class="font-bold text-charcoal-900">Interactive territory map</h3>
            <p id="sales-territory-geocode-status" class="text-xs text-gray-500 mt-1">Preparing postcode locations…</p>
          </div>
          <label class="text-xs text-gray-600">Route starts from
            <input value="${esc(SalesOS.territoryVenuePostcode)}" onchange="SalesOS.updateTerritoryVenuePostcode(this.value)" class="ml-2 px-3 py-2 border rounded-lg text-sm w-32">
          </label>
        </div>
        <div id="sales-territory-map" class="h-[520px] bg-gray-100"></div>
        <div class="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
          ${[
            ['#16a34a','Existing customer'],
            ['#d97706','Warm / strategic'],
            ['#2563eb','Meeting booked'],
            ['#7c3aed','Proposal / negotiation'],
            ['#dc2626','Cold prospect'],
            ['#111827','Never contacted']
          ].map(([colour,label]) => `<span class="flex items-center gap-2"><i style="width:10px;height:10px;border-radius:50%;background:${colour}"></i>${label}</span>`).join('')}
        </div>
      </section>

      ${SalesOS.panel('Today’s route', 'Select businesses, then optimise the order',
        `<div id="sales-territory-route-panel"></div>`)}
    </div>

    <div class="grid xl:grid-cols-[1.2fr_.8fr] gap-4 mb-4">
      ${SalesOS.panel('Best businesses to visit', 'Prioritised by due date, commercial value, relationship and visit history',
        `<div class="space-y-3 max-h-[720px] overflow-y-auto pr-1">
          ${summary.rows.slice(0, 30).map((row, index) => `<div data-territory-card="${row.lead.id}" class="rounded-xl border ${SalesOS.territorySelectedIds.includes(row.lead.id) ? 'border-gold-400 bg-gold-50' : 'border-gray-200 bg-white'} p-4">
            <div class="flex items-start gap-3">
              <input data-territory-lead-checkbox type="checkbox" value="${row.lead.id}" ${SalesOS.territorySelectedIds.includes(row.lead.id) ? 'checked' : ''} onchange="SalesOS.toggleTerritoryLead('${row.lead.id}',this.checked)" class="mt-1">
              <span class="w-8 h-8 rounded-full ${index < 5 ? 'bg-gold-500 text-white' : 'bg-olive-100 text-olive-700'} flex items-center justify-center text-xs font-bold flex-shrink-0">${index + 1}</span>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between gap-3">
                  <div>
                    <div class="flex gap-2 flex-wrap items-center">
                      <strong>${esc(row.lead.companyName)}</strong>
                      <span class="badge ${salesLeadStatusColor(row.lead.status)}">${esc(row.lead.status)}</span>
                      ${row.neverVisited ? '<span class="badge bg-gray-100 text-gray-700">Never visited</span>' : ''}
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${esc(row.lead.contactName || 'Decision maker missing')} · ${esc(SalesOS.displayPostcode(row.lead.postcode) || 'No postcode')}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="font-bold">${SalesOS.money(row.lead.potentialValue)}</p>
                    <p class="text-[10px] text-gray-400">Score ${row.score}</p>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mt-2">${esc(SalesOS.priorityReason(row.lead))}</p>
                <div class="flex gap-2 flex-wrap mt-3">
                  <button onclick="SalesOS.openLiveCall('${row.lead.id}')" class="px-3 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-semibold">Open Account</button>
                  <button onclick="SalesOS.logTerritoryVisit('${row.lead.id}')" class="px-3 py-2 bg-olive-700 text-white rounded-lg text-xs font-semibold">Log Visit</button>
                  ${row.coordinate ? `<button onclick="SalesOS.territoryMap?.setView([${row.coordinate.lat},${row.coordinate.lng}],15)" class="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">Show on Map</button>` : '<span class="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs">Invalid / missing postcode</span>'}
                </div>
              </div>
            </div>
          </div>`).join('') || '<p class="text-sm text-gray-400">No active territory prospects exist yet.</p>'}
        </div>`)}
      ${SalesOS.panel('Area opportunity leaderboard', 'Postcode areas ranked by active revenue potential',
        `<div class="space-y-3">
          ${areas.slice(0, 15).map((area, index) => `<div class="rounded-xl border border-gray-200 p-4">
            <div class="flex justify-between gap-3">
              <div><p class="text-xs text-gray-500">#${index + 1} AREA</p><p class="font-bold text-xl">${esc(SalesOS.displayPostcode(area.area))}</p></div>
              <div class="text-right"><p class="text-xs text-gray-500">Potential</p><p class="font-bold">${SalesOS.money(area.potential)}</p></div>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
              <div class="rounded-lg bg-cream-50 p-2"><span class="text-gray-400">Companies</span><strong class="block">${area.count}</strong></div>
              <div class="rounded-lg bg-red-50 p-2"><span class="text-gray-400">Overdue</span><strong class="block">${area.overdue}</strong></div>
              <div class="rounded-lg bg-gray-50 p-2"><span class="text-gray-400">Never Visited</span><strong class="block">${area.neverVisited}</strong></div>
            </div>
          </div>`).join('') || '<p class="text-sm text-gray-400">Add postcodes to build area intelligence.</p>'}
        </div>`)}
    </div>

    ${SalesOS.panel('How to use Sales Territory', 'A simple working routine for proactive business visits',
      `<div class="grid md:grid-cols-2 xl:grid-cols-5 gap-3">
        ${[
          ['1. Clean the data','Add a valid UK postcode and decision maker to every target business.'],
          ['2. Select priorities','Choose overdue, high-value and never-visited businesses.'],
          ['3. Optimise route','Generate a practical visit order starting from Windmill Farm.'],
          ['4. Conduct visits','Open the account, use the sales guidance and log the visit outcome.'],
          ['5. Schedule next step','Every visit must finish with a meeting, proposal or dated follow-up.']
        ].map(([title, detail]) => `<div class="rounded-xl bg-cream-50 border border-cream-200 p-4"><p class="font-semibold">${esc(title)}</p><p class="text-xs text-gray-500 mt-2">${esc(detail)}</p></div>`).join('')}
      </div>`)}
  `;
};
