import { Capacitor } from '@capacitor/core';

/**
 * Detect if the app is running as a native app via Capacitor
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Detect if the app is running in a web browser
 */
export function isWebApp(): boolean {
  return !Capacitor.isNativePlatform();
}

/**
 * Get the current platform (ios, android, web)
 */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}
