import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let userUid = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    userUid = user.uid;
    console.log("User logged in:", userUid);
    populateIngredientList();
  } else {
    console.log("No user logged in");
    userUid = null;
  }
});

function getModifiedPantryRef() {
  if (!userUid) {
    console.log("No user logged in, cannot access modified pantry.");
    return null;
  }
  return collection(db, "users", userUid, "modifiedPantryItems");
}

async function getModifiedPantryItems() {
  const pantryCollection = getModifiedPantryRef();
  const snapshot = await getDocs(pantryCollection);
  const ingredients = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    ingredients.push({
      id: doc.id,
      name: data.itemName,
      quantity: data.itemQuantity,
    });
  });
  return ingredients;
}

async function populateIngredientList() {
  const ingredients = await getModifiedPantryItems();
  const ingredientsContainer = document.getElementById("ingredientSelection");
  ingredientsContainer.innerHTML = '';
  if (ingredients.length === 0) {
    ingredientsContainer.innerHTML = "<p>No ingredients found in your pantry.</p>";
    return;
  }
  ingredients.forEach(ingredient => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = ingredient.name;
    checkbox.id = ingredient.id;
    const label = document.createElement("label");
    label.setAttribute("for", ingredient.id);
    label.textContent = ingredient.name;
    ingredientsContainer.appendChild(checkbox);
    ingredientsContainer.appendChild(label);
    ingredientsContainer.appendChild(document.createElement("br"));
  });
}

window.onload = () => {
  populateIngredientList();
};

document.getElementById('generateButton').addEventListener('click', async () => {
  const selectedIngredient = [];
  const checkboxes = document.querySelectorAll("#ingredientSelection input[type='checkbox']:checked");
  checkboxes.forEach(checkbox => {
    selectedIngredient.push(checkbox.value);
  });

  if (selectedIngredient.length === 0) {
    alert('Please select at least one ingredient.');
    return;
  }

  const mealType = document.getElementById('mealType').value;
  const cuisineType = document.getElementById('cuisineType').value;

  const recipe = await generateRecipes(selectedIngredient, mealType, cuisineType);
  displayrecipe(recipe, mealType, cuisineType);
});

async function generateRecipes(ingredients, mealType, cuisine) {
  const apiKey = "AIzaSyBfgYoq6sIQ6NQxHIlpHDtZdVSmFITMf_o";
  const prompt = `Generate a recipe for a ${mealType} dish from ${cuisine} cuisine using the following ingredients: ${ingredients.join(", ")}.
Please include:
- The name of the dish
- A list of instructions for preparation
- The cooking time
- A list of ingredients with quantities
finally make the content in readable format`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error("Failed to fetch recipe from Gemini API");

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Error generating recipe:", error);
    return "Sorry, we couldn't generate a recipe at the moment.";
  }
}

function displayrecipe(recipe, mealType, cuisine) {
  const recipeContainer = document.getElementById("recipeContainer");
  const formattedRecipe = formatRecipeContent(recipe);
  recipeContainer.innerHTML = `
    <h2>Recipe for ${mealType} (${cuisine} Cuisine)</h2>
    <div>${formattedRecipe}</div>
  `;
}

function formatRecipeContent(recipeText) {
  const lines = recipeText.split('\n').map(line => line.trim()).filter(line => line);
  let htmlContent = '';
  let inList = false;
  for (const line of lines) {
    if (line.startsWith("**") && line.endsWith("**")) {
      htmlContent += `<p><strong>${line.replace(/\*\*/g, '')}</strong></p>`;
    } else if (/^##\s/.test(line)) {
      htmlContent += `<h2>${line.replace(/^##\s/, '')}</h2>`;
    } else if (/^\*\s/.test(line)) {
      if (!inList) { htmlContent += `<ul>`; inList = true; }
      htmlContent += `<li>${line.replace(/^\*\s/, '')}</li>`;
    } else if (/^\d+\.\s/.test(line)) {
      if (!inList) { htmlContent += `<ol>`; inList = true; }
      htmlContent += `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
    } else {
      if (inList) { htmlContent += `</ul>`; inList = false; }
      htmlContent += `<p>${line}</p>`;
    }
  }
  if (inList) htmlContent += `</ul>`;
  return htmlContent;
}

document.getElementById('back').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});




