// Firebase Configuration - DISABLED FOR NOW
// Using simplified authentication instead

// Disable Firebase initialization to force fallback to simplified auth
console.log('🔧 Firebase disabled - using simplified authentication');

// Create mock Firebase objects to prevent errors
window.firebaseAuth = null;
window.firebaseDb = null;
window.googleProvider = null;
window.firebase = null;

// Force the auth system to use simplified mode
window.forceSimplifiedAuth = true;