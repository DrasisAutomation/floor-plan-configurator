// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyD3h0CQc6oeKxn22HMvTmhLR6pFsSj69h0",
  authDomain: "floorplan-7a150.firebaseapp.com",
  projectId: "floorplan-7a150",
  storageBucket: "floorplan-7a150.firebasestorage.app",
  messagingSenderId: "1053780320514",
  appId: "1:1053780320514:web:43f4d89bbf739cdad5a21b",
  measurementId: "G-XFWN25G9RN"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// Error handling for Firebase
firebase.auth().useDeviceLanguage();

// Handle auth state persistence
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
        console.error("Persistence error:", error);
    });
// Admin emails list
const ADMIN_EMAILS = [
    "mohancheenu04@gmail.com",
    "drasisdata@gmail.com"
];