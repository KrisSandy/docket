import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.homedocket.app',
  appName: 'HomeDocket',
  webDir: 'out',
  server: {
    // SPA fallback — route all unknown paths to index.html
    // so client-side router handles /item/[id], /add/[categoryId], etc.
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_homedocket',
      iconColor: '#0073FF',
      sound: 'default',
    },
  },
};

export default config;
