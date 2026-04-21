import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

console.log("🚀 license-check.js loaded");

const firebaseConfig = {
  apiKey: "AIzaSyCgDPotM7W7Rlyl4RCajKb1PiA3ekeIA9Q",
  authDomain: "license-ha.firebaseapp.com",
  projectId: "license-ha",
  storageBucket: "license-ha.firebasestorage.app",
  messagingSenderId: "369998064376",
  appId: "1:369998064376:web:85770ffa657fa95254690d"
};

const LICENSE_KEY = "HA-3D-2026-0009";
const CACHE_KEY = 'license_cache_3d_v1'; // localStorage key
const CACHE_EXPIRY_DAYS = 7; // How long cache is valid (7 days)

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Firebase initialized");

function createOverlay(message) {
  let overlay = document.getElementById("license-overlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "license-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.95);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: Arial, sans-serif;
    text-align: center;
  `;

  overlay.innerHTML = `
    <div>
      <h2>Access Denied</h2>
      <p id="license-message">${message}</p>
    </div>
  `;

  document.body.appendChild(overlay);
  return overlay;
}

function block(msg) {
  console.error("❌ ACCESS DENIED:", msg);
  const overlay = createOverlay(msg);
  overlay.querySelector("#license-message").textContent = msg;
  return false;
}

function allow() {
  console.log("✅ ACCESS GRANTED");
  const overlay = document.getElementById("license-overlay");
  if (overlay) overlay.remove();
  return true;
}

// Check if cache is expired
function isCacheExpired(lastChecked) {
  const lastDate = new Date(lastChecked);
  const now = new Date();
  const daysDiff = (now - lastDate) / (1000 * 60 * 60 * 24);
  return daysDiff > CACHE_EXPIRY_DAYS;
}

// Save verification status to localStorage
function saveLicenseStatus(status, reason = "") {
  try {
    const statusData = {
      licenseKey: LICENSE_KEY,
      status: status, // "allow" or "denied"
      lastChecked: new Date().toISOString(),
      reason: reason,
      version: '1.0'
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(statusData));
    console.log("💾 Saved to localStorage:", statusData);
    return true;
  } catch (error) {
    console.error("❌ Failed to save to localStorage:", error);
    return false;
  }
}

// Load verification status from localStorage
function loadLicenseStatus() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log("📭 No cached license data found");
      return null;
    }
    
    const statusData = JSON.parse(cached);
    
    // Validate the cached data
    if (statusData.licenseKey !== LICENSE_KEY) {
      console.warn("⚠️ License key mismatch in cache");
      localStorage.removeItem(CACHE_KEY); // Remove invalid cache
      return null;
    }
    
    // Check if cache is expired
    if (isCacheExpired(statusData.lastChecked)) {
      console.warn("⚠️ Cached license data expired");
      localStorage.removeItem(CACHE_KEY); // Remove expired cache
      return null;
    }
    
    console.log("📖 Loaded from cache:", statusData);
    return statusData;
  } catch (error) {
    console.warn("⚠️ Failed to read from cache:", error);
    return null;
  }
}

// Clear cached license data
function clearLicenseCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log("🧹 License cache cleared");
}

// Main license check with offline support
async function checkLicense() {
  console.log("🔑 Checking license:", LICENSE_KEY);
  
  // Check if we have valid cached data first
  const cachedStatus = loadLicenseStatus();
  
  // Try online verification first
  try {
    console.log("🌐 Attempting online verification...");
    const ref = doc(db, "licenses", LICENSE_KEY);
    const snap = await getDoc(ref);
    
    if (!snap.exists()) {
      console.log("❌ License not found in Firebase");
      
      // Save denied status to cache
      saveLicenseStatus("denied", "License not found in database");
      
      // If we have cached "allow" but now it's denied, show specific message
      if (cachedStatus && cachedStatus.status === "allow") {
        return block("License was revoked. Please contact support.");
      }
      
      return block("Invalid license key");
    }
    
    const data = snap.data();
    console.log("📦 Online license data:", data);
    
    if (data.status !== "allow") {
      console.log("❌ License not approved");
      
      // Save denied status to cache
      saveLicenseStatus("denied", "License not approved by admin");
      
      // If we have cached "allow" but now it's denied
      if (cachedStatus && cachedStatus.status === "allow") {
        return block("License access was suspended. Please contact support.");
      }
      
      return block("License not approved by admin");
    }
    
    // Online verification SUCCESS
    console.log("✅ Online verification successful");
    
    // Save ALLOW status to cache for future offline use
    saveLicenseStatus("allow", "Online verification successful");
    
    return allow();
    
  } catch (error) {
    console.warn("⚠️ Online verification failed (possibly offline):", error);
    
    // Online failed - use cached data if available
    if (cachedStatus) {
      console.log("📴 Using cached verification data");
      
      if (cachedStatus.status === "allow") {
        console.log("✅ Offline access granted (cached from:", cachedStatus.lastChecked + ")");
        return allow();
      } else {
        console.log("❌ Offline access denied (cached status:", cachedStatus.status + ")");
        return block("License was denied: " + (cachedStatus.reason || "No reason provided"));
      }
    } else {
      // No cached data and no internet
      console.log("❌ No cached license data and offline");
      return block("No valid license found. Please connect to internet for verification.");
    }
  }
}

// Add manual refresh button (optional, for debugging)
function addRefreshButton() {
  const refreshBtn = document.createElement('button');
  refreshBtn.textContent = 'Refresh License';
  refreshBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 9999;
    font-size: 12px;
  `;
  
  refreshBtn.onclick = async () => {
    clearLicenseCache();
    alert('License cache cleared. Refreshing verification...');
    await checkLicense();
  };
  
  document.body.appendChild(refreshBtn);
}

// Optional: Add periodic cache validation
function setupCacheValidation() {
  // Check cache every hour
  setInterval(() => {
    const cachedStatus = loadLicenseStatus();
    if (cachedStatus && isCacheExpired(cachedStatus.lastChecked)) {
      console.log("🔄 Cache expired, attempting to refresh...");
      // Cache will be refreshed on next checkLicense call
    }
  }, 60 * 60 * 1000); // 1 hour
}

// Start check when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  // Optional: Add refresh button for testing
  // addRefreshButton();
  
  // Optional: Setup periodic cache validation
  // setupCacheValidation();
  
  // Start license check
  checkLicense();
});

// Export functions for manual control (optional)
window.licenseManager = {
  checkLicense,
  clearLicenseCache,
  getCachedStatus: loadLicenseStatus
};
