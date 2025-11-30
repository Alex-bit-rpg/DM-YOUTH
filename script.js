/* ===============================
   MOBILE MENU TOGGLE
================================*/
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("show");
}

/* ===============================
   IMAGE SLIDESHOW
================================*/
let slideIndex = 0;

function showSlides() {
  const slides = document.querySelectorAll(".slides");
  const dots = document.querySelectorAll(".dot");
  if (slides.length === 0) return;

  slides.forEach(slide => slide.style.display = "none");
  dots.forEach(dot => dot.classList.remove("active-dot"));

  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;

  slides[slideIndex - 1].style.display = "block";
  if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add("active-dot");

  setTimeout(showSlides, 5000);
}

document.addEventListener("DOMContentLoaded", showSlides);


/* ===============================
   FIREBASE INITIALIZATION
================================*/
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyDGOxmf-Q2F2GJtZy_g6AaJw9I0J5E8zCs",
    authDomain: "dm-youth.firebaseapp.com",
    databaseURL: "https://dm-youth-default-rtdb.firebaseio.com",
    projectId: "dm-youth",
    storageBucket: "dm-youth.appspot.com",
    messagingSenderId: "536808499850",
    appId: "1:536808499850:web:901c9c7a2a96f88bc58c31"
  };

  // Initialize Firebase only once
  if (!window.firebaseApp) {
    window.firebaseApp = firebase.initializeApp(firebaseConfig);
    window.firebaseDB = firebase.database();
  }
})();


/* ===============================
   ANONYMOUS SUGGESTION BOX
================================*/

const suggestionInput = document.getElementById("suggestionInput");
const submitBtn = document.getElementById("submitBtn");
const suggestionList = document.getElementById("suggestionList");
const clearAllBtn = document.getElementById("clearAllBtn");

// ADMIN PASSWORD
const ADMIN_PASSWORD = "MyStrongAdminPass123";

/* -------------------------
   Submit Suggestion
--------------------------*/
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const text = suggestionInput.value.trim();
    if (!text) {
      alert("Please write something before submitting!");
      return;
    }

    const newSuggestion = {
      text,
      time: new Date().toLocaleString(),
    };

    window.firebaseDB.ref("suggestions").push(newSuggestion)
      .then(() => {
        suggestionInput.value = "";
      })
      .catch(err => console.error("Submit Error:", err));
  });
}


/* -------------------------
   Display Suggestions
--------------------------*/
if (suggestionList) {
  window.firebaseDB.ref("suggestions").on("value", (snapshot) => {
    suggestionList.innerHTML = "";

    if (!snapshot.exists()) {
      suggestionList.innerHTML =
        "<p style='text-align:center;color:gray;'>No suggestions yet.</p>";
      return;
    }

    snapshot.forEach(child => {
      const suggestion = child.val();
      const id = child.key;

      const li = document.createElement("li");
      li.classList.add("suggestion-item");

      li.innerHTML = `
        <p>${suggestion.text}</p>
        <small>Posted at: ${suggestion.time}</small>

        <div class="actions">
          <button onclick="adminEdit('${id}', '${suggestion.text.replace(/'/g, "\\'")}')">✏️ Edit</button>
          <button onclick="adminDelete('${id}')">🗑️ Delete</button>
        </div>
      `;

      suggestionList.appendChild(li);
    });
  });
}


/* -------------------------
   Admin Password Prompt
--------------------------*/
function askAdminPassword() {
  const entered = prompt("Enter admin password:");
  return entered === ADMIN_PASSWORD;
}


/* -------------------------
   Admin Edit Function
--------------------------*/
window.adminEdit = function (id, oldText) {
  if (!askAdminPassword()) {
    alert("Wrong password!");
    return;
  }

  const newText = prompt("Edit suggestion:", oldText);
  if (!newText) return;

  window.firebaseDB.ref("suggestions/" + id).update({
    text: newText,
    time: new Date().toLocaleString(),
  });
};


/* -------------------------
   Admin Delete Function
--------------------------*/
window.adminDelete = function (id) {
  if (!askAdminPassword()) {
    alert("Wrong password!");
    return;
  }

  if (!confirm("Delete this suggestion?")) return;

  window.firebaseDB.ref("suggestions/" + id).remove();
};


/* -------------------------
   Admin Clear All
--------------------------*/
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    if (!askAdminPassword()) {
      alert("Wrong password!");
      return;
    }

    if (confirm("⚠ DELETE ALL suggestions permanently?")) {
      window.firebaseDB.ref("suggestions").remove();
      suggestionList.innerHTML = "";
    }
  });
}


