export default {
  expo: {
    name: 'Chicken Disease Detector',
    slug: 'cdd-app',
    version: '1.0.0',
    sdkVersion: '53.0.0',
    extra: {
      supabaseUrl: 'https://navvzhjgwqihdbdallia.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdnZ6aGpnd3FpaGRiZGFsbGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzExNzcsImV4cCI6MjA2NDc0NzE3N30.WaZpo0mOYn5tTW-NVN85EcYME05U34kIvpNMRWHS9oA',
      predictionApiUrl: 'https://747a-2001-4455-6f3-a00-dd29-7ce8-1951-677.ngrok-free.app/predict', // OR your deployed URL

      API_BASE_URL: 'https://747a-2001-4455-6f3-a00-dd29-7ce8-1951-677.ngrok-free.app',
    },
    scheme: "cddapp",
    deepLinking: true,
    platforms: ["ios", "android"],
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
  },
};

