/* ------------------------------
   Navbar Toggle
------------------------------ */
/* ------------------------------
   Mobile Navbar Toggle
------------------------------ */
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("show");
}

/* ------------------------------
   Slideshow Functionality
------------------------------ */
let slideIndex = 0;
function showSlides() {
  const slides = document.querySelectorAll(".slides");
  const dots = document.querySelectorAll(".dot");
  if (slides.length === 0) return;

  slides.forEach(slide => (slide.style.display = "none"));
  dots.forEach(dot => dot.classList.remove("active-dot"));

  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;

  slides[slideIndex - 1].style.display = "block";
  if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add("active-dot");

  setTimeout(showSlides, 5000);
}
showSlides();

/* ------------------------------
   Anonymous Suggestion Box (Firebase)
------------------------------ */
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// Ensure Firebase DB is available
const db = window.firebaseDB;
if (!db) console.error("Firebase DB not found! Make sure firebase is initialized in HTML.");

// Admin Password
const ADMIN_PASSWORD = "MyStrongAdminPass123";

// DOM Elements
const suggestionInput = document.getElementById("suggestionInput");
const submitBtn = document.getElementById("submitBtn");
const suggestionList = document.getElementById("suggestionList");
const clearAllBtn = document.getElementById("clearAllBtn");

/* ----------------------------
   Submit New Suggestion
---------------------------- */
submitBtn?.addEventListener("click", () => {
  const text = suggestionInput.value.trim();
  if (!text) return alert("Please type something before submitting!");

  const newSuggestion = {
    text,
    time: new Date().toLocaleString(),
  };

  push(ref(db, "suggestions"), newSuggestion)
    .then(() => {
      suggestionInput.value = "";
    })
    .catch(err => console.error("Error submitting suggestion:", err));
});

/* ----------------------------
   Display Suggestions in Real-time
---------------------------- */
onValue(ref(db, "suggestions"), snapshot => {
  suggestionList.innerHTML = "";

  if (!snapshot.exists()) {
    suggestionList.innerHTML = "<p style='text-align:center; color:gray;'>No suggestions yet.</p>";
    return;
  }

  snapshot.forEach(childSnap => {
    const suggestion = childSnap.val();
    const id = childSnap.key;

    const li = document.createElement("li");
    li.classList.add("suggestion-item");

    li.innerHTML = `
      <p>${suggestion.text}</p>
      <small>Posted at: ${suggestion.time}</small>
      <div class="action-buttons">
        <button class="edit" onclick="adminEdit('${id}', '${suggestion.text.replace(/'/g, "\\'")}')">✏️ Edit</button>
        <button class="delete" onclick="adminDelete('${id}')">🗑️ Delete</button>
      </div>
    `;

    suggestionList.appendChild(li);
  });
});

/* ----------------------------
   Admin Authentication
---------------------------- */
function askAdminPassword() {
  const entered = prompt("Enter admin password:");
  return entered === ADMIN_PASSWORD;
}

/* ----------------------------
   Admin Edit Suggestion
---------------------------- */
window.adminEdit = function(id, oldText) {
  if (!askAdminPassword()) {
    alert("❌ Wrong password! Only admin can edit.");
    return;
  }

  const newText = prompt("Edit suggestion:", oldText);
  if (!newText || newText.trim() === "") return;

  const updates = {};
  updates[`suggestions/${id}/text`] = newText.trim();
  updates[`suggestions/${id}/time`] = new Date().toLocaleString();

  update(ref(db), updates)
    .then(() => alert("✅ Suggestion updated"))
    .catch(err => console.error("Error updating suggestion:", err));
};

/* ----------------------------
   Admin Delete Suggestion
---------------------------- */
window.adminDelete = function(id) {
  if (!askAdminPassword()) {
    alert("❌ Wrong password! Only admin can delete.");
    return;
  }

  if (!confirm("Are you sure you want to delete this suggestion?")) return;

  remove(ref(db, "suggestions/" + id))
    .then(() => alert("🗑️ Suggestion deleted"))
    .catch(err => console.error("Error deleting suggestion:", err));
};

/* ----------------------------
   Admin Clear All Suggestions
---------------------------- */
clearAllBtn?.addEventListener("click", () => {
  if (!askAdminPassword()) {
    alert("❌ Wrong password! Only admin can clear all suggestions.");
    return;
  }

  if (!confirm("⚠️ Are you sure you want to delete ALL suggestions?")) return;

  remove(ref(db, "suggestions"))
    .then(() => {
      suggestionList.innerHTML = "";
      alert("🧹 All suggestions cleared!");
    })
    .catch(err => console.error("Error clearing suggestions:", err));
});
