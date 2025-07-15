// Firebase Configuration
// Replace these with your actual Firebase project credentials from Firebase Console
const firebaseConfig = {
    apiKey: "your-real-api-key-here",  // Get from Firebase Console > Project Settings
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();
const db = firebase.firestore();

// Configure Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Enable persistence for offline access
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDb = db;
window.googleProvider = googleProvider;

console.log('✅ Firebase initialized successfully');