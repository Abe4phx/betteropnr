import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.betteropnr',
  appName: 'BetterOpnr',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#FF6B6B",
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0F1222'
    }
  }
};

export default config;
