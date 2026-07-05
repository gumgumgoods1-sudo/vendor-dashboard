// ===================================================================================
// DashboardSync — tiny read-only helper for pages OTHER than the dashboard itself.
//
// home.html uses this to show live quick-stats from the same single Firestore
// document index.html saves to (see CLOUD_DOC_PATH in js/firebase-config.js).
// It never writes — only the dashboard page mutates the document — so there's no
// risk of two pages fighting over the data.
//
// Load order matters: firebase-app-compat.js, firebase-firestore-compat.js, then
// js/firebase-config.js, then this file.
// ===================================================================================
const DashboardSync = (() => {
  let db = null;
  let unsubscribe = null;

  function init() {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
  }

  function docRef() {
    if (!db) init();
    return db.collection(CLOUD_DOC_PATH.collection).doc(CLOUD_DOC_PATH.doc);
  }

  // Live subscription to the dashboard document. onData receives the raw saved
  // payload ({savedAt, inventory, sales, trades, expenses, cashflow, lists, settings})
  // or null if the document doesn't exist yet (dashboard never opened).
  function subscribe(onData, onError) {
    if (unsubscribe) unsubscribe();
    unsubscribe = docRef().onSnapshot(
      (snap) => onData(snap.exists ? snap.data() : null),
      (err) => { console.error('DashboardSync subscribe failed', err); if (onError) onError(err); }
    );
    return unsubscribe;
  }

  function computeQuickStats(data) {
    const d = data || {};
    const sales = Array.isArray(d.sales) ? d.sales : [];
    const totalSalesAmount = sales.reduce((sum, s) => {
      const auto = Number(s['Total Sale Amount (auto)']);
      if (Number.isFinite(auto) && auto !== 0) return sum + auto;
      return sum + (Number(s['Quantity Sold']) || 0) * (Number(s['Sale Price']) || 0);
    }, 0);
    return {
      inventoryCount: Array.isArray(d.inventory) ? d.inventory.length : 0,
      salesCount: sales.length,
      totalSalesAmount: totalSalesAmount,
      tradesCount: Array.isArray(d.trades) ? d.trades.length : 0,
      savedAt: d.savedAt || null,
    };
  }

  function formatRelativeTime(iso) {
    if (!iso) return 'just now';
    const ms = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(ms) || ms < 0) return 'just now';
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(iso).toLocaleDateString();
  }

  return { init, subscribe, computeQuickStats, formatRelativeTime };
})();
