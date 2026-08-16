// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

// Firebase Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Firebase Authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAW1fKQtjT0mbUfIVxShDBEvJM4yHw7Go",
    authDomain: "sada-sahay-foundation.firebaseapp.com",
    projectId: "sada-sahay-foundation",
    storageBucket: "sada-sahay-foundation.firebasestorage.app",
    messagingSenderId: "260074024027",
    appId: "1:260074024027:web:3e83c5f1b2a83ebe02e37e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

// Export them so other JS files can use them
export { app, db, auth };