// ===================================================================================
// Shared Firebase configuration — single source of truth for every page in this app.
//
// This is the SAME project your dashboard (index.html) already syncs to
// (vendor-dashboard-31558) — nothing here creates a new project or a new document.
// It just gives new pages (home.html, and anything you add later) a copy of the
// same config instead of pasting it into every file.
//
// index.html is intentionally left untouched and keeps its own inline copy of this
// config — that's by design (requirement: "keep index.html exactly as it is").
// This file is for NEW pages only.
//
// None of these values are secret — they're a public client identifier, same note
// that's already in index.html. The only real protection on this data is (a) keeping
// your GitHub Pages URL unlisted and (b) the Firestore security rules (firestore.rules
// in this same repo) restricting reads/writes to the one document path this app uses.
// ===================================================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBkq6e2hMqBvdbWvcyLA1NNSxF0eEVD_Qo",
  authDomain: "vendor-dashboard-31558.firebaseapp.com",
  projectId: "vendor-dashboard-31558",
  storageBucket: "vendor-dashboard-31558.firebasestorage.app",
  messagingSenderId: "1098788445886",
  appId: "1:1098788445886:web:1b9d3954bd84514ea388ef",
  measurementId: "G-DG9XDMW1S1"
};

// The one Firestore document every page in this app reads/writes — must match the
// CLOUD_DOC_PATH constant inside index.html exactly, or the two pages will end up
// looking at different data.
const CLOUD_DOC_PATH = { collection: 'dashboards', doc: 'main' };
