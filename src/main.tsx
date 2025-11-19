import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeNotifications } from "@/lib/notifications";

// Initialize notification system
initializeNotifications();

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed, but app will still work
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
