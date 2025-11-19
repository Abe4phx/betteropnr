/// <reference types="vite/client" />

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: any;
  }
}
