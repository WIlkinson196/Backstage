
// ============================================================================
// WINDMILL FARM — WEDDINGS / TIMELINE
// ============================================================================
window.WeddingTimeline = window.WeddingTimeline || {};
WeddingTimeline.render = wedding => renderWeddingTimeline(wedding);
WeddingTimeline.filter = weddingId => filterWeddingTimeline(weddingId);
WeddingTimeline.addNote = weddingId => openWeddingTimelineForm(weddingId);
