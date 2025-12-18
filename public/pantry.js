import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import {
    getFirestore, collection, addDoc, deleteDoc, getDocs, doc, updateDoc,
    setDoc, Timestamp
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAoO5ndmgp6dYUewLaIBhPpmpu1het72C4",
  authDomain: "pantry-tracker-4c64e.firebaseapp.com",
  projectId: "pantry-tracker-4c64e",
  storageBucket: "pantry-tracker-4c64e.firebasestorage.app",
  messagingSenderId: "356408623064",
  appId: "1:356408623064:web:ec64ba276dea98981d3cad",
  measurementId: "G-N3GEY9CF7T"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// DOM Elements
const addItemButton = document.getElementById("add-item-button");
const deleteItemButton = document.getElementById("delete-item-button");
const updateItemButton = document.getElementById("update-item-button");
const addItemForm = document.getElementById("add-item-form");
const deleteItemForm = document.getElementById("delete-item-form");
const updateItemForm = document.getElementById("update-item-form");
const cancelButton = document.getElementById("cancel-button");
const delCancelButton = document.getElementById("delcancel-button");
const updateCancelButton = document.getElementById("update-cancel-button");
const overlay = document.getElementById("overlay");
// Variables for current user
let userUid = null; // This will store the user's UID
// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        userUid = user.uid;
        console.log("User logged in:", userUid);
        fetchPantryItems(); // Fetch pantry items for the logged-in user
    } else {
        console.log("No user logged in");
        userUid = null;
    }
});
// Function to get the Firestore reference for the current user's pantry
collection
function getPantryRef() {
    if (!userUid) {
        console.log("No user logged in, cannot access pantry.");
        return null;
    }
    return collection(db, "users", userUid, "pantryItems");
}
// Function to get the reference for the modified pantry collection
function getModifiedPantryRef() {
    if (!userUid) {
        console.log("No user logged in, cannot access modified pantry.");
        return null;
    }
    return collection(db, "users", userUid, "modifiedPantryItems");
}
// Toggle Add Item Form visibility
addItemButton.addEventListener("click", () => {
    addItemForm.classList.toggle("hidden");
    overlay.style.display = "block";
    deleteItemForm.classList.add("hidden");
    updateItemForm.classList.add("hidden");
});
// Toggle Delete Item Form visibility
deleteItemButton.addEventListener("click", () => {
    deleteItemForm.classList.toggle("hidden");
    addItemForm.classList.add("hidden");
    updateItemForm.classList.add("hidden");
});
// Toggle Update Item Form visibility
updateItemButton.addEventListener("click", () => {
    updateItemForm.classList.toggle("hidden");
    addItemForm.classList.add("hidden");
    deleteItemForm.classList.add("hidden");
});
// Cancel Add Item Form
cancelButton.addEventListener("click", (event) => {
    event.preventDefault();
    addItemForm.classList.add("hidden");
    resetAddItemForm();
});
// Cancel Delete Item Form
delCancelButton.addEventListener("click", (event) => {
    event.preventDefault();
    deleteItemForm.classList.add("hidden");
    resetDeleteItemForm();
});
// Cancel Update Item Form
updateCancelButton.addEventListener("click", (event) => {
    event.preventDefault();
    updateItemForm.classList.add("hidden");
    resetUpdateItemForm();
});
// Reset Add Item Form using reset()
function resetAddItemForm() {
    addItemForm.reset();
    addItemForm.classList.add("hidden");
}
// Reset Delete Item Form using reset()
function resetDeleteItemForm() {
    deleteItemForm.reset();
    deleteItemForm.classList.add("hidden");
}
// Reset Update Item Form using reset()
function resetUpdateItemForm() {
    updateItemForm.reset();
    updateItemForm.classList.add("hidden");
}
// Check if an item ID already exists in the user's pantry collection
async function checkIfIdExists(itemId) {
    const pantryRef = getPantryRef();
    if (!pantryRef) return false;
    const snapshot = await getDocs(pantryRef);
    const existingItem = snapshot.docs.find(doc => doc.data().itemId === itemId);
    return existingItem !== undefined; // Return true if ID exists, false
    otherwise
}
// Add Item to Pantry (Firestore)
addItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const itemName = document.getElementById("item-name").value;
    const itemQuantity = document.getElementById("item-quantity").value;
    const expirationDate = document.getElementById("expiration-date").value;
    const itemId = document.getElementById("item-id").value;
    if (itemName && itemQuantity && expirationDate && itemId) {
        try {
            const pantryRef = getPantryRef();
            const modifiedPantryRef = getModifiedPantryRef();
            if (!pantryRef || !modifiedPantryRef) return;
            const idExists = await checkIfIdExists(itemId);
            if (idExists) {
                alert("An item with this ID already exists. Please modify the ID.");
            } else {
                // Add item to both collections
                await addDoc(pantryRef, {
                    itemId,
                    itemName,
                    itemQuantity,
                    expirationDate
                });
                await addDoc(modifiedPantryRef, {
                    itemId,
                    itemName,
                    itemQuantity,
                    expirationDate
                }).then(() => {
                    console.log("Item added to modifiedPantryItems collection");
                }).catch((error) => {
                    console.error("Error adding item to modifiedPantryItems collection: ", error);
                });
                fetchPantryItems(); // Fetch and render pantry list
                resetAddItemForm();
            }
        } catch (error) {
            console.error("Error adding item to Firestore: ", error);
        }
    }
});
deleteItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const itemIdToDelete = document.getElementById("item-id-to-delete").value;
    try {
        const pantryRef = getPantryRef(); // Reference to the pantryItems
        collection
        const modifiedPantryRef = getModifiedPantryRef();
        if (!pantryRef || !modifiedPantryRef) {
            console.error("Pantry or modifiedPantry reference is null");
            return;
        }
        // Fetch documents from pantryItems
        const pantrySnapshot = await getDocs(pantryRef);
        const pantryItemToDelete = pantrySnapshot.docs.find(doc =>
            doc.data().itemId === itemIdToDelete);
        if (pantryItemToDelete) {
            // Delete the document from pantryItems
            await deleteDoc(doc(pantryRef, pantryItemToDelete.id));
            console.log(`Item with ID ${itemIdToDelete} deleted from
pantryItems.`);
            // Fetch documents from modifiedPantryItems
            const modifiedPantrySnapshot = await getDocs(modifiedPantryRef);
            const modifiedItemToDelete = modifiedPantrySnapshot.docs.find(doc =>
                doc.data().itemId === itemIdToDelete);
            if (modifiedItemToDelete) {
                // Delete the document from modifiedPantryItems
                await deleteDoc(doc(modifiedPantryRef, modifiedItemToDelete.id));
                console.log(`Item with ID ${itemIdToDelete} deleted from
modifiedPantryItems.`);
            } else {
                console.warn(`Item with ID ${itemIdToDelete} not found in
modifiedPantryItems.`);
            }
            // Refresh the pantry items list
            fetchPantryItems();
            resetDeleteItemForm();
        } else {
            alert("Item not found in pantryItems collection!");
        }
    } catch (error) {
        console.error("Error deleting item from Firestore: ", error);
    }
});
// Update Item in Pantry (Firestore)
updateItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const itemIdToUpdate = document.getElementById("item-id-to-update").value;
    const updatedQuantity = document.getElementById("updated-quantity").value;
    const updatedExpirationDate = document.getElementById("updated-expirationdate").value;
    try {
        const pantryRef = getPantryRef();
        const modifiedPantryRef = getModifiedPantryRef();
        if (!pantryRef || !modifiedPantryRef) return;
        const snapshot = await getDocs(pantryRef);
        const itemToUpdate = snapshot.docs.find(doc => doc.data().itemId ===
            itemIdToUpdate);
        if (itemToUpdate) {
            // Check if the item exists in the modifiedPantryItems collection
            const modifiedSnapshot = await getDocs(modifiedPantryRef);
            const itemToUpdateInModifiedPantry = modifiedSnapshot.docs.find(doc => doc.data().itemId === itemIdToUpdate);
            if (itemToUpdateInModifiedPantry) {
                // Update in both collections
                await updateDoc(doc(db, "users", userUid, "pantryItems",
                    itemToUpdate.id), {
                    itemQuantity: updatedQuantity ||
                        itemToUpdate.data().itemQuantity,
                    expirationDate: updatedExpirationDate ||
                        itemToUpdate.data().expirationDate
                });
                await updateDoc(doc(db, "users", userUid, "modifiedPantryItems",
                    itemToUpdateInModifiedPantry.id), {
                    itemQuantity: updatedQuantity ||
                        itemToUpdate.data().itemQuantity,
                    expirationDate: updatedExpirationDate ||
                        itemToUpdate.data().expirationDate
                });
                fetchPantryItems(); // Fetch and render updated pantry list
                resetUpdateItemForm();
            } else {
                alert("Item not found in modified pantry!");
            }
        } else {
            alert("Item not found in pantry!");
        }
    } catch (error) {
        console.error("Error updating item in Firestore: ", error);
    }
});
export async function fetchPantryItems() {
    const pantryItemsList = document.getElementById('pantry-list');
    const pantryTableBody = document.querySelector('#pantry-list tbody');
    try {
        const pantryRef = getPantryRef();
        if (!pantryRef) {
            console.error("Pantry reference is null");
            return;
        }
        // Clear the table body content (but not the headers)
        pantryTableBody.innerHTML = '';
        const querySnapshot = await getDocs(pantryRef);
        if (querySnapshot.empty) {
            pantryTableBody.innerHTML = '<tr><td colspan="4">No items in the pantry</td></tr>';
        } else {
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                const itemId = doc.id; // Get the document ID to update the item
                // Log the entire document data for debugging
                console.log("Document ID:", doc.id);
                console.log("Document Data:", item);
                // Adjust to use the correct field names
                const name = item.itemName || 'N/A';
                const quantity = item.itemQuantity || 'N/A';
                const expirationDate = item.expirationDate || 'N/A';
                const id = item.itemId;
                const row = document.createElement('tr');
                row.innerHTML = `
<td>${id}</td>
<td>${name}</td>
<td>${quantity}</td>
<td>${expirationDate}</td>
`;
                pantryTableBody.appendChild(row); // Append to the table body
            });
        }
    }
    catch (error) {
        console.error("Error getting pantry items:", error);
        pantryTableBody.innerHTML = '<tr><td colspan="4">Failed to load items.Please try again later.</td></tr>';
    }
}
document.getElementById('backtodash').addEventListener('click', () => {
    // Here, you could load or redirect to the pantry management page.
    window.location.href = "shoppingList.html";
});



//import dotenv from 'dotenv';
//dotenv.config();

//require('dotenv').config();
// Firebase configuration
// const firebaseConfig = {
//     apiKey: process.env.REACT_APP_FIREBASE_YOUR_API_KEY,
//     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.REACT_APP_FIREBASE_APP_ID,
//     measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID
// };