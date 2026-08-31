
// ============================================================================
// WINDMILL FARM — WEDDINGS / DOCUMENTS
// ============================================================================
window.WeddingDocuments = window.WeddingDocuments || {};
WeddingDocuments.render = wedding => renderWeddingDocuments(wedding);
WeddingDocuments.filter = weddingId => filterWeddingDocuments(weddingId);
WeddingDocuments.upload = weddingId => openWeddingDocumentForm(weddingId);
