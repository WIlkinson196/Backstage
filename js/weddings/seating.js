
// ============================================================================
// WINDMILL FARM — WEDDINGS / SEATING
// Module boundary for seating, visual floor planning and guest management.
// The battle-tested core functions remain in js/weddings.js and are exposed here.
// ============================================================================
window.WeddingSeating = window.WeddingSeating || {};
WeddingSeating.render = wedding => renderWeddingSeatingPlanner(wedding);
WeddingSeating.initialise = weddingId => typeof initialiseWeddingSeatingDrag==='function' && initialiseWeddingSeatingDrag(weddingId);
WeddingSeating.openGuest = (weddingId,guestId='') => openWeddingGuestForm(weddingId,guestId);
WeddingSeating.openTable = (weddingId,tableId='') => openWeddingSeatingTableForm(weddingId,tableId);
WeddingSeating.print = weddingId => printWeddingSeatingPlan(weddingId);
