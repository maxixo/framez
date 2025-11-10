import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AuthScreen from './../screens/AuthScreen';
import FeedScreen from './../screens/FeedScreen';
import CreatePostScreen from './../screens/CreatePostScreen';
import ProfileScreen from './../screens/ProfileScreen';
import { useAuthStore } from './../stores/authStore';
import { useThemeStore } from './../stores/themeStore';


        const Stack = createNativeStackNavigator();
        const Tabs = createBottomTabNavigator();


        function TabsNav() {
          const isDark = useThemeStore((s) => s.isDark);
          const colors = {
            tabBg: isDark ? '#0f0f10' : '#fff',
            border: isDark ? '#1f1f22' : '#e5e7eb',
            active: isDark ? '#e5e7eb' : '#111',
            inactive: isDark ? '#a1a1aa' : '#9ca3af',
          } as const;

          return (
            <Tabs.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: colors.active,
                tabBarInactiveTintColor: colors.inactive,
                tabBarStyle: {
                  height: 60,
                  paddingBottom: 8,
                  paddingTop: 8,
                  backgroundColor: colors.tabBg,
                  borderTopColor: colors.border,
                  borderTopWidth: 1,
                },
                tabBarIcon: ({ color, size }) => {
                  let icon: keyof typeof Feather.glyphMap = 'circle';
                  switch (route.name) {
                    case 'Feed':
                      icon = 'home';
                      break;
                    case 'Create':
                      icon = 'plus-square';
                      break;
                    case 'Profile':
                      icon = 'user';
                      break;
                  }
                  return <Feather name={icon} size={size ?? 22} color={color} />;
                },
              })}
            >
              <Tabs.Screen name="Feed" component={FeedScreen} />
              <Tabs.Screen name="Create" component={CreatePostScreen} />
              <Tabs.Screen name="Profile" component={ProfileScreen} />
            </Tabs.Navigator>
          );
        }


        export default function RootNav() {
        const { session, loading } = useAuthStore();
        const isDark = useThemeStore((s) => s.isDark);


        if (loading) {
        return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        </View>
        );
        }


        return (
        <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
        <Stack.Screen name="App" component={TabsNav} />
        ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
        )}
        </Stack.Navigator>
        </NavigationContainer>
        );
        }
