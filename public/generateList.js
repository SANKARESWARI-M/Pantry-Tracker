import { initializeApp }  from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { getAuth, onAuthStateChanged }  from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
//dotenv.config();

//require('dotenv').config();
// Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAoO5ndmgp6dYUewLaIBhPpmpu1het72C4",
  authDomain: "pantry-tracker-4c64e.firebaseapp.com",
  projectId: "pantry-tracker-4c64e",
  storageBucket: "pantry-tracker-4c64e.firebasestorage.app",
  messagingSenderId: "356408623064",
  appId: "1:356408623064:web:ec64ba276dea98981d3cad",
  measurementId: "G-N3GEY9CF7T"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let userUid = null; // This will store the user's UID
// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
if (user) {
userUid = user.uid;
console.log("User logged in:", userUid);
} else {
console.log("No user logged in");
userUid = null;
}
});
// Function to get the Firestore reference for the current user's pantry
collection
function getPantryRef() {
const userUid = auth.currentUser ? auth.currentUser.uid : null; 
if (!userUid) {
console.log("No user logged in, cannot access pantry.");
return null;
}
return collection(db, "users", userUid, "pantryItems");
}
// Function to get the reference for the modified pantry collection
function getModifiedPantryRef() {
const userUid = auth.currentUser ? auth.currentUser.uid : null; 
if (!userUid) {
console.log("No user logged in, cannot access modified pantry.");
return null;
}
return collection(db, "users", userUid, "modifiedPantryItems");
}
document.getElementById('generateShoppingList').addEventListener('click',
generateShoppingList);
async function generateShoppingList() {
if (!userUid) {
console.log("No user is logged in. Cannot generate shopping list.");
return; // Exit if no user is logged in
}
const pantryItemsRef = collection(db, 'users', userUid, 'pantryItems');
const modifiedPantryItemsRef = collection(db, 'users', userUid,
'modifiedPantryItems');
try {
// Fetch data from Firestore
const pantryItemsSnapshot = await getDocs(pantryItemsRef);
const modifiedPantryItemsSnapshot = await
getDocs(modifiedPantryItemsRef);
console.log('Pantry Items Snapshot:', pantryItemsSnapshot);
console.log('Modified Pantry Items Snapshot:',
modifiedPantryItemsSnapshot);
const pantryItems = {};
const modifiedPantryItems = {};
// Store the pantry items data in an object (using itemId as key)
pantryItemsSnapshot.forEach((doc) => {
const data = doc.data();
console.log('Pantry Item:', data); // Debug log
pantryItems[data.itemId] = data; // Use itemId as the key
});

modifiedPantryItemsSnapshot.forEach((doc) => {
const data = doc.data();
console.log('Modified Pantry Item:', data); // Debug log
modifiedPantryItems[data.itemId] = data; // Use itemId as the key
});
console.log('Pantry Items:', pantryItems);
console.log('Modified Pantry Items:', modifiedPantryItems);
// Generate the shopping list
const shoppingList = [];
for (const [itemId, itemData] of Object.entries(pantryItems)) {
const modifiedData = modifiedPantryItems[itemId]; 
console.log(`Checking item: ${itemData.itemName}`);
console.log(`Required Quantity: ${itemData.itemQuantity}`);
console.log(`Modified Quantity: ${modifiedData?.itemQuantity || 0}`);
const quantityToBuy = itemData.itemQuantity -
(modifiedData?.itemQuantity || 0);
if (quantityToBuy > 0) {
shoppingList.push({
name: itemData.itemName,
quantityToBuy: quantityToBuy
});
}
}
console.log("Generated Shopping List:", shoppingList);
// Display the shopping list in the table
displayShoppingList(shoppingList);
} catch (error) {
console.error('Error generating shopping list:', error);
}
}
// Function to display the shopping list in the table
function displayShoppingList(shoppingList) {
// Get the table body element (tbody) to append rows
const tableBody =
document.getElementById('Shoppinglist_table').querySelector('tbody');
// Clear the table body (if any previous rows exist)
tableBody.innerHTML = '';
if (shoppingList.length === 0) {
const row = document.createElement("tr");
const messageCell = document.createElement("td");
messageCell.setAttribute("colspan", 2);
messageCell.textContent = "No items to buy";
row.appendChild(messageCell);
tableBody.appendChild(row);
} else {
shoppingList.forEach((item) => {
const name = item.name || 'N/A'; 
const quantity = item.quantityToBuy || 'N/A'; 

const row = document.createElement('tr');
row.innerHTML = `
<td>${name}</td>
<td>${quantity}</td>
`;
tableBody.appendChild(row);
});
}
}
// Back button functionality
document.getElementById("back").addEventListener("click", () => {
window.history.back(); // Navigate back to the previous page
});
