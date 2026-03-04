import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Configure native status bar for iOS Capacitor builds.
 * Prevents the status bar from overlaying the webview content.
 * Only runs on native iOS - no effect on web or Android.
 */
export const configureNativeStatusBar = async (): Promise<void> => {
  // Only run on native iOS
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return;
  }

  try {
    // Prevent status bar from overlaying webview content
    await StatusBar.setOverlaysWebView({ overlay: false });
    
    // Set dark style (light text) to match app theme
    await StatusBar.setStyle({ style: Style.Dark });
    
    // Set background color to match app header
    await StatusBar.setBackgroundColor({ color: '#0F1222' });
  } catch (error) {
    console.warn('Failed to configure native status bar:', error);
  }
};
