import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs } from
 "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

//import dotenv from 'dotenv';
//dotenv.config();

//require('dotenv').config();
// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAoO5ndmgp6dYUewLaIBhPpmpu1het72C4",
  authDomain: "pantry-tracker-4c64e.firebaseapp.com",
  projectId: "pantry-tracker-4c64e",
  storageBucket: "pantry-tracker-4c64e.firebasestorage.app",
  messagingSenderId: "356408623064",
  appId: "1:356408623064:web:ec64ba276dea98981d3cad",
  measurementId: "G-N3GEY9CF7T"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// References to DOM elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const buttonContainer = document.getElementById('buttonContainer');
const authContainer = document.getElementById('authContainer');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const toggleText = document.getElementById('toggleText');
// Show the register form and hide the buttons
registerBtn.addEventListener('click', () => {
buttonContainer.style.display = 'none';
authContainer.style.display = 'block';
formTitle.textContent = 'Register';
submitBtn.textContent = 'Register';
toggleText.innerHTML = `Already have an account? <span
id="toggleForm">Login</span>`;
setupToggle();
});
// Show the login form and hide the buttons
loginBtn.addEventListener('click', () => {
buttonContainer.style.display = 'none';
authContainer.style.display = 'block';
formTitle.textContent = 'Login';
submitBtn.textContent = 'Login';
toggleText.innerHTML = `Don't have an account? <span
id="toggleForm">Register</span>`;
setupToggle();
});
// Google Sign-In functionality
document.getElementById('googleSignInBtn').addEventListener('click', () => {
const provider = new GoogleAuthProvider();
signInWithPopup(auth, provider)
.then((result) => {
const user = result.user;
alert(`Welcome ${user.displayName}`);
window.location.href = "dashboard.html"; 
})
.catch((error) => {
alert('Google Sign-In failed: ' + error.message);
});
});
// Handle Login/Register Form Submission
document.getElementById('authForm').addEventListener('submit', (e) => {
e.preventDefault();
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
if (formTitle.textContent === 'Login') {
// Handle login
signInWithEmailAndPassword(auth, email, password)
.then(async (userCredential) => {
const user = userCredential.user;
alert('Login successful');
// Access the user's pantry data
const userRef = doc(db, "users", user.uid);
const userDoc = await getDoc(userRef);
if (userDoc.exists()) {
const pantryItems = userDoc.data().pantryItems;
console.log("User's Pantry Items: ", pantryItems);
} else {
console.log("No pantry data found for this user.");
}
window.location.href = "dashboard.html"; 
})
.catch((error) => {
alert('Login failed: ' + error.message);
});
} else {
// Handle register
createUserWithEmailAndPassword(auth, email, password)
.then(async (userCredential) => {
const user = userCredential.user;
alert('Registration successful');
// Create a document for the user in Firestore
const userRef = doc(db, "users", user.uid);
const userDoc = await getDoc(userRef);
if (!userDoc.exists()) {

await setDoc(userRef, {
pantryItems: [] // Empty pantry to start with
});
}
window.location.href = "dashboard.html"; 
})
.catch((error) => {
alert('Registration failed: ' + error.message);
});
}
});
// Setup toggle between Login/Register forms
function setupToggle() {
document.getElementById('toggleForm').addEventListener('click', () => {
if (formTitle.textContent === 'Login') {
formTitle.textContent = 'Register';
submitBtn.textContent = 'Register';
toggleText.innerHTML = `Already have an account? <span
id="toggleForm">Login</span>`;
} else {
formTitle.textContent = 'Login';
submitBtn.textContent = 'Login';
toggleText.innerHTML = `Don't have an account? <span
id="toggleForm">Register</span>`;
}
setupToggle(); // Re-setup toggle after the HTML change
});
}
// JavaScript to handle cancel button functionality
document.getElementById('cancelBtn').addEventListener('click', function() {
document.getElementById('authContainer').style.display = 'none';
document.querySelector('.buttons').style.display = 'flex';
document.getElementById('authForm').reset();
});
// Show main menu after login
function showMainMenu() {
document.getElementById('mainMenu').style.display = 'flex';
}
// Example: Call showMainMenu() after successful login
// You might want to replace `alert('Login successful')` with this function
// in your existing login code.
// Event listeners for each button
document.getElementById('myPantryBtn').addEventListener('click', () => {
alert("Navigating to My Pantry...");
// Here, you could load or redirect to the pantry management page.
window.location.href = "pantrylist.html";
});
document.getElementById('shoppingListBtn').addEventListener('click', () => {
alert("Navigating to Shopping List...");
// Load or redirect to the shopping list page.
window.location.href = "shoppingList.html";
});
document.getElementById('recipeBtn').addEventListener('click', () => {
alert("Navigating to Recipe Suggestions...");
// Load or redirect to the recipe suggestions page.
window.location.href = "recipeSuggestions.html";
});
// Function to add a pantry item for the logged-in user
async function addPantryItem(item) {
const userId = auth.currentUser.uid;
const userRef = doc(db, "users", userId);
const pantryRef = collection(userRef, "pantryItems");
try {
await addDoc(pantryRef, item);
alert("Pantry item added!");
} catch (error) {
console.error("Error adding pantry item: ", error);
alert("Failed to add item.");
}
}
// Function to retrieve pantry items for the logged-in user
async function getPantryItems() {
const userId = auth.currentUser.uid;
const userRef = doc(db, "users", userId);
const pantryRef = collection(userRef, "pantryItems");
const querySnapshot = await getDocs(pantryRef);
let items = [];
querySnapshot.forEach((doc) => {
items.push(doc.data());
});
console.log("Pantry Items: ", items);
return items; // This can be used to display items in your UI
}
