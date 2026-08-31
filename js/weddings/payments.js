
// ============================================================================
// WINDMILL FARM — WEDDINGS / PAYMENTS
// ============================================================================
window.WeddingPayments = window.WeddingPayments || {};
WeddingPayments.render = wedding => renderWeddingPayments(wedding);
WeddingPayments.open = (weddingId,paymentId='') => openWeddingPaymentForm(weddingId,paymentId);
WeddingPayments.balance = wedding => weddingBalance(wedding);
