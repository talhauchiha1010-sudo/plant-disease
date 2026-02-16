/* dashboard.js
   Client-side interactions:
   - Auth check & Logout
   - sidebar toggle
   - single image selection + preview
   - REAL AI detection (Flask backend)
   - weather widget
*/

import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* =========================
   GLOBAL ERROR CATCHERS
========================= */
window.addEventListener("error", function (e) {
  console.error("Global JS Error:", e.error);
});

window.addEventListener("unhandledrejection", function (e) {
  console.error("Unhandled Promise Rejection:", e.reason);
});

/* =========================
   SAFE DOM LOADER
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const imageInput = document.getElementById('imageInput');
  const previewGrid = document.getElementById('previewGrid');
  const detectBtn = document.getElementById('detectBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resultContent = document.getElementById('resultContent');

  const weatherTemp = document.getElementById('weatherTemp');
  const weatherDesc = document.getElementById('weatherDesc');
  const weatherLocation = document.getElementById('weatherLocation');
  const weatherNote = document.getElementById('weatherNote');

  const userAvatar = document.getElementById('userAvatar');
  const userNameDisplay = document.querySelector('.user-name');
  const logoutBtn = document.getElementById('logoutBtn');
  const retryLocBtn = document.getElementById('retryLocBtn');

  let image = null;
  let imageURL = null;
  let isDetecting = false;

  /* =========================
     AUTH LOGIC (FIXED)
  ========================= */
  onAuthStateChanged(auth, (user) => {

    if (!user) {
      console.log("User not logged in → redirecting");
      window.location.href = "/";   // ✅ FIXED
      return;
    }

    if (user.displayName) {
      userNameDisplay.textContent = user.displayName;

      const initials = user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      userAvatar.textContent = initials;

    } else if (user.email) {
      userNameDisplay.textContent = user.email;
      userAvatar.textContent = user.email.substring(0, 2).toUpperCase();
    }

  });

  /* =========================
     LOGOUT (FIXED)
  ========================= */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await signOut(auth);
        window.location.href = "/";   // ✅ FIXED
      } catch (error) {
        alert("Logout failed: " + error.message);
      }
    });
  }

  /* =========================
     SIDEBAR
  ========================= */
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebar.setAttribute(
        'aria-hidden',
        sidebar.classList.contains('open') ? 'false' : 'true'
      );
    });
  }

  /* =========================
     IMAGE PREVIEW
  ========================= */
  function renderPreviews() {
    if (!previewGrid) return;

    previewGrid.innerHTML = '';
    if (!image) return;

    const item = document.createElement('div');
    item.className = 'preview-item';

    const img = document.createElement('img');

    if (imageURL) URL.revokeObjectURL(imageURL);

    imageURL = URL.createObjectURL(image);
    img.src = imageURL;
    img.alt = image.name;

    const btn = document.createElement('button');
    btn.type = "button";
    btn.className = 'preview-remove';
    btn.textContent = '✕';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearImage();
    });

    item.appendChild(img);
    item.appendChild(btn);
    previewGrid.appendChild(item);
  }

  function clearImage() {
    image = null;

    if (imageURL) {
      URL.revokeObjectURL(imageURL);
      imageURL = null;
    }

    if (imageInput) imageInput.value = "";
    if (previewGrid) previewGrid.innerHTML = "";
    if (resultContent) resultContent.textContent = "Cleared image.";
  }

  if (imageInput) {
    imageInput.addEventListener('change', (ev) => {
      const file = ev.target.files[0];
      if (!file || !file.type.startsWith('image/')) return;

      image = file;
      renderPreviews();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearImage();
    });
  }

  if (detectBtn) {
    detectBtn.addEventListener('click', async (e) => {

      e.preventDefault();
      e.stopPropagation();

      if (isDetecting) return;

      if (!image) {
        resultContent.textContent = "Please upload a plant image before detecting.";
        return;
      }

      isDetecting = true;
      detectBtn.disabled = true;
      resultContent.textContent = "Analyzing image with AI...";

      try {
        const formData = new FormData();
        formData.append("image", image);

        const response = await fetch("/predict", {  // ✅ cleaner
          method: "POST",
          body: formData
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();

        resultContent.innerHTML = `
          <div><strong>${data.disease}</strong> — ${data.confidence}%</div>
          <div style="margin-top:8px; opacity:.8;">
            Prediction generated by trained TensorFlow model.
          </div>
        `;

      } catch (error) {
        resultContent.textContent =
          "Prediction failed. Make sure backend is running.";
      }

      detectBtn.disabled = false;
      isDetecting = false;
    });
  }

  /* =========================
     WEATHER
  ========================= */
  async function loadWeather() {

    if (!navigator.geolocation) {
      weatherDesc.textContent = "Geolocation not supported";
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {

      const lat = pos.coords.latitude.toFixed(4);
      const lon = pos.coords.longitude.toFixed(4);

      weatherLocation.textContent = `${lat}, ${lon}`;

      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;

        const resp = await fetch(url);
        const data = await resp.json();

        const tempC = Math.round(data.current_weather.temperature);

        weatherTemp.textContent = `${tempC}°C`;
        weatherDesc.textContent = "Live Weather";
        weatherNote.textContent =
          `Updated: ${new Date().toLocaleTimeString()}`;

      } catch {
        weatherTemp.textContent = "--°C";
        weatherDesc.textContent = "Weather unavailable";
      }

    });
  }

  loadWeather();

});
