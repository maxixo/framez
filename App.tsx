import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import RootNav from './src/navigation/index';
import { useAuthStore } from './src/stores/authStore';
import { useThemeStore } from './src/stores/themeStore';

export default function App() {
  const init = useAuthStore(s => s.init);
  const isDark = useThemeStore(s => s.isDark);

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <RootNav />
    </>
  );
}
