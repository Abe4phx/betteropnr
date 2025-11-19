import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeNotifications } from "@/lib/notifications";

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: any;
  }
}

// Initialize notification system
initializeNotifications();

// Register service worker for PWA (only on web, not in native Capacitor app)
if ("serviceWorker" in navigator && !window.Capacitor) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed, but app will still work
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
