// Import Firebase config (if you're using module imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";


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
// Initialize Firebase app
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app);
// Initialize Firebase Auth
const auth = getAuth(app); // Use the initialized app to get Auth instance
let userUid = null;
// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        userUid = user.uid;
        console.log("User logged in:", userUid);
        loadPantryItems(); // Call the correct function to load pantry items
    } else {
        console.log("No user logged in");
        userUid = null;
    }
});
// Function to get the reference to the pantry items
function getPantryRef() {
    if (!userUid) {
        console.log("No user logged in, cannot access pantry.");
        return null;
    }
    return collection(db, "users", userUid, "modifiedPantryItems");
}
// Function to load and display pantry items from Firestore
export async function loadPantryItems() {
    const pantryItemsList = document.getElementById('pantry-items-list');
    pantryItemsList.innerHTML = ''; // Clear the table first
    try {
        const pantryRef = getPantryRef();
        if (!pantryRef) {
            console.error("Pantry reference is null");
            return;
        }
        const querySnapshot = await getDocs(pantryRef);
        if (querySnapshot.empty) {
            pantryItemsList.innerHTML = '<tr><td colspan="4">No items in the pantry</td></tr>';
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
                const unit = item.expirationDate || 'N/A';
                const row = document.createElement('tr');
                row.innerHTML = `
<td>${name}</td>
<td>${quantity}</td>
<td>${unit}</td>
<td><button class="decrement-btn" data-id="${itemId}">-
</button></td>
`;
                pantryItemsList.appendChild(row);
            });
            // Attach event listener to each decrement button
            const decrementButtons = document.querySelectorAll('.decrement-btn');
            // Inside the event listener
            decrementButtons.forEach((button) => {
                button.addEventListener('click', async (event) => {
                    const itemId = event.target.getAttribute('data-id');
                    console.log("Decrement button clicked for item ID:", itemId);
                    await decrementItemQuantity(itemId);
                    loadPantryItems(); // Reload items to reflect changes
                });
            });
        }
    } catch (error) {
        console.error("Error getting pantry items:", error);
        pantryItemsList.innerHTML = '<tr><td colspan="4">Failed to load items. Please try again later.</td></tr>';
    }
}
// Function to decrement the quantity of an item
async function decrementItemQuantity(itemId) {
    try {
        const pantryRef = getPantryRef();
        const itemDoc = doc(pantryRef, itemId); // Get the document by ID
        const itemSnapshot = await getDoc(itemDoc);
        if (itemSnapshot.exists()) {
            const itemData = itemSnapshot.data();
            let quantity = itemData.itemQuantity;
            // Ensure that quantity is a number
            if (isNaN(quantity)) {
                console.error("Invalid quantity value:", quantity);
                return;
            }
            // Decrement if quantity is greater than 0
            if (quantity > 0) {
                quantity -= 1; // Decrement the quantity
                // Update the quantity in Firestore
                await updateDoc(itemDoc, {
                    itemQuantity: quantity
                });
                console.log("Item quantity updated:", quantity);
            } else {
                console.log("Item quantity is already 0, can't decrement.");
            }
        } else {
            console.log("Item not found!");
        }
    } catch (error) {
        console.error("Error updating item quantity:", error);
    }
}
document.getElementById('backtodash').addEventListener('click', () => {
    // Here, you could load or redirect to the pantry management page.
    window.location.href = "dashboard.html";
});
document.getElementById('toadd').addEventListener('click', () => {
    // Here, you could load or redirect to the pantry management page.
    window.location.href = "pantry.html";
});



const notificationButton = document.getElementById("notification-button");
const notificationContainer = document.getElementById("notification-container");
const notificationMessage = document.getElementById("notification-message");
notificationButton.addEventListener("click", async () => {
    const { expiringItems, expiredItems } = await getExpiringAndExpiredItems();
    let message = "";
    if (expiredItems.length > 0) {
        message += expiredItems.map(item =>
            `Item: ${item.itemName} (ID: ${item.itemId}) expired yesterday
(${item.expirationDate}). It has been deleted.`
        ).join('<br>'); // Display expired items and mention deletion
    }
    if (expiringItems.length > 0) {
        message += (message ? "<br><br>" : "") + expiringItems.map(item =>
            `Item: ${item.itemName} (ID: ${item.itemId}) is going to expire on
${item.expirationDate}.`
        ).join('<br>'); // Display expiring items
    }
    if (message) {
        notificationMessage.innerHTML = message;
        notificationContainer.classList.add("show");
        // Hide notification after 10 seconds
        setTimeout(() => {
            notificationContainer.classList.remove("show");
        }, 10000); // 10 seconds
    } else {
        notificationMessage.innerHTML = "No items are expiring within two days or expired yesterday.";
        notificationContainer.classList.add("show");
        notificationMessage.textContent = "No items are expiring within two days or expired yesterday."
        // Hide notification after 10 seconds
        setTimeout(() => {
            notificationContainer.classList.remove("show");
        }, 10000); // 10 seconds
    }
});
// Check for items expiring within 2 days and those expired exactly 1 day ago
async function getExpiringAndExpiredItems() {
    const pantryRef = getPantryRef();
    const snapshot = await getDocs(pantryRef); // Get pantry items from Firestore
    const pantryItems = snapshot.docs.map(doc => doc.data());
    console.log("Pantry Items:", pantryItems); // Debugging: Log pantry items
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset to midnight for comparison
    const oneDayAgo = new Date(currentDate);
    oneDayAgo.setDate(currentDate.getDate() - 1); // Exactly one day ago
    const twoDaysFromNow = new Date(currentDate);
    twoDaysFromNow.setDate(currentDate.getDate() + 2);
    twoDaysFromNow.setHours(23, 59, 59, 999); // End of the second day
    const expiringItems = [];
    const expiredItems = [];
    for (const item of pantryItems) {
        let expirationDate;
        // Check if expirationDate is a Firestore Timestamp
        if (item.expirationDate && item.expirationDate.seconds) {
            expirationDate = new Date(item.expirationDate.seconds * 1000);
        } else {
            // If expirationDate is stored as a string, parse it
            expirationDate = new Date(item.expirationDate);
        }

        if (isNaN(expirationDate.getTime())) {
            console.error('Invalid expirationDate format for item: ', item);
            continue; // Skip items with invalid expirationDate
        }
        expirationDate.setHours(0, 0, 0, 0); // Reset to midnight for comparison
        // Check if the item expired exactly 1 day ago
        if (expirationDate.getTime() === oneDayAgo.getTime()) {
            expiredItems.push({
                itemId: item.itemId,
                itemName: item.itemName,
                expirationDate: expirationDate.toDateString(),
                docId: item.id, // Store document ID for deletion
            });
        }
        // Check if the item will expire within the next 2 days
        if (expirationDate <= twoDaysFromNow && expirationDate >= currentDate) {
            expiringItems.push({
                itemId: item.itemId,
                itemName: item.itemName,
                expirationDate: expirationDate.toDateString(),
            });
        }
    }
    // Delete expired items from Firestore
    /*for (const expiredItem of expiredItems) {
    await deleteDoc(doc(pantryRef, expiredItem.docId)); // Delete item by its
    document ID
    }*/
    // Delete expired items
    expiredItems.forEach(async (item) => {
        const itemRef = doc(getPantryRef(), item.itemId);
        await deleteDoc(itemRef);
        console.log(`Deleted expired item: ${item.itemName}`);
    });
    return { expiringItems, expiredItems };
}