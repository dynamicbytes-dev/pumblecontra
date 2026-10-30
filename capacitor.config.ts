import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tujuego.pumblecontra',
  appName: 'Pumble Contra',
  webDir: 'dist',
  backgroundColor: '#070913',
  server: {
    androidScheme: 'https'
  }
};

export default config;
