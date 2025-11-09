import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import RootNav from './src/navigation/index';
import { useAuthStore } from './src/stores/authStore';

export default function App() {
  const init = useAuthStore(s => s.init);

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <RootNav />
    </>
  );
}
