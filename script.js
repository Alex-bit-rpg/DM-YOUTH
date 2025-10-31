/* -----------------------------
   Mobile Navbar Toggle
------------------------------ */
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("show");
}

/* -----------------------------
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

  setTimeout(showSlides, 5000); // every 5 seconds
}
showSlides();

/* -----------------------------
   Anonymous Suggestion Box
------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const suggestionInput = document.getElementById("suggestionInput");
  const submitBtn = document.getElementById("submitBtn");
  const suggestionList = document.getElementById("suggestionList");
  const clearAllBtn = document.getElementById("clearAllBtn");

  // Load existing suggestions from localStorage
  let suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];

  // Save suggestions to localStorage
  function saveSuggestions() {
    localStorage.setItem("suggestions", JSON.stringify(suggestions));
  }

  // Display all suggestions
  function displaySuggestions() {
    suggestionList.innerHTML = "";

    if (suggestions.length === 0) {
      suggestionList.innerHTML = "<p style='text-align:center; color:gray;'>No suggestions yet.</p>";
      return;
    }

    suggestions.forEach((item, index) => {
      const li = document.createElement("li");
      li.classList.add("suggestion-item");

      li.innerHTML = `
        <p>${item.text}</p>
        <small>Posted at: ${item.time}</small>
        <div class="action-buttons">
          <button class="edit" onclick="editSuggestion(${index})">✏️ Edit</button>
          <button class="delete" onclick="deleteSuggestion(${index})">🗑️ Delete</button>
        </div>
      `;

      suggestionList.appendChild(li);
    });
  }

  // Add a new suggestion
  submitBtn?.addEventListener("click", () => {
    const text = suggestionInput.value.trim();
    if (text === "") {
      alert("Please write something before submitting!");
      return;
    }

    const newSuggestion = {
      text,
      time: new Date().toLocaleString(),
    };

    suggestions.push(newSuggestion);
    saveSuggestions();
    displaySuggestions();
    suggestionInput.value = "";
  });

  // Delete a suggestion
  window.deleteSuggestion = function (index) {
    if (confirm("Are you sure you want to delete this suggestion?")) {
      suggestions.splice(index, 1);
      saveSuggestions();
      displaySuggestions();
    }
  };

  // Edit a suggestion (within 10 minutes)
  window.editSuggestion = function (index) {
    const now = new Date();
    const suggestionTime = new Date(suggestions[index].time);
    const diffMinutes = (now - suggestionTime) / 60000;

    if (diffMinutes > 10) {
      alert("You can only edit within 10 minutes after posting.");
      return;
    }

    const newText = prompt("Edit your suggestion:", suggestions[index].text);
    if (newText !== null && newText.trim() !== "") {
      suggestions[index].text = newText.trim();
      saveSuggestions();
      displaySuggestions();
    }
  };

  // Clear all suggestions
  clearAllBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all suggestions?")) {
      suggestions = [];
      saveSuggestions();
      displaySuggestions();
    }
  });

  // Initial display on page load
  displaySuggestions();
});
