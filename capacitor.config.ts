import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.homedocket.app',
  appName: 'HomeDocket',
  webDir: 'out',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_homedocket',
      iconColor: '#0073FF',
      sound: 'default',
    },
  },
};

export default config;
