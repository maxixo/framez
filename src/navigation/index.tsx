import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthScreen from './../screens/AuthScreen';
import FeedScreen from './../screens/FeedScreen';
import CreatePostScreen from './../screens/CreatePostScreen';
import ProfileScreen from './../screens/ProfileScreen';
import { useAuthStore } from './../stores/authStore';
import { ActivityIndicator, View } from 'react-native';


        const Stack = createNativeStackNavigator();
        const Tabs = createBottomTabNavigator();


        function TabsNav() {
        return (
        <Tabs.Navigator screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="Feed" component={FeedScreen} />
        <Tabs.Screen name="Create" component={CreatePostScreen} />
        <Tabs.Screen name="Profile" component={ProfileScreen} />
        </Tabs.Navigator>
        );
        }


        export default function RootNav() {
        const { session, loading } = useAuthStore();


        if (loading) {
        return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        </View>
        );
        }


        return (
        <NavigationContainer>
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