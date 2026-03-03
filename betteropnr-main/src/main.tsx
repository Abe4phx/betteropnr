import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeNotifications } from "@/lib/notifications";
import { SplashScreen } from '@capacitor/splash-screen';
import { isNativeApp } from '@/lib/platformDetection';
import { configureNativeStatusBar } from '@/lib/nativeStatusBar';

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: any;
  }
}

// Initialize notification system
initializeNotifications();

// Configure native status bar for iOS (prevents overlay on webview)
configureNativeStatusBar();

// Configure splash screen for native apps
if (isNativeApp()) {
  // Splash screen will auto-hide based on capacitor.config.ts settings
  // You can manually control it here if needed
  SplashScreen.show({
    showDuration: 2000,
    autoHide: true,
  });
}

// Register service worker for PWA (only on web, not in native Capacitor app)
if ("serviceWorker" in navigator && !window.Capacitor) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed, but app will still work
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
