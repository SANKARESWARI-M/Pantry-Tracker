import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, getDocs, doc, updateDoc,
setDoc, Timestamp }  from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

//import dotenv from 'dotenv';
//dotenv.config();

//require('dotenv').config();
// Firebase configuration


const firebaseConfig = {
  apiKey: "AIzaSyAoO5ndmgp6dYUewLaIBhPpmpu1het72C4",
  authDomain: "pantry-tracker-4c64e.firebaseapp.com",
  projectId: "pantry-tracker-4c64e",
  storageBucket: "pantry-tracker-4c64e.firebasestorage.app",
  messagingSenderId: "356408623064",
  appId: "1:356408623064:web:ec64ba276dea98981d3cad",
  measurementId: "G-N3GEY9CF7T"
};
// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// Select the Logout Button
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
logoutButton.addEventListener("click", async () => {
try {
await signOut(auth); // Modular Firebase API for sign out
alert("You have been logged out.");
// Redirect to the login page after logout
window.location.href = "index.html"; // Adjust the path to your login
page
} catch (error) {
console.error("Error logging out:", error);
alert("Failed to logout. Please try again.");
}
});
}
// Redirect to login page if no user is logged in
onAuthStateChanged(auth, (user) => {
if (!user) {
window.location.href = "index.html"; // Adjust the path to your login
page
}
});
