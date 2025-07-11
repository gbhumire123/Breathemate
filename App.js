import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import HomeScreen from './frontend/src/Home';
import BreatheTestScreen from './frontend/src/BreatheTest';
import JournalScreen from './frontend/src/Journal';
import SettingsScreen from './frontend/src/Settings';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Breathe Test') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00ffff',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#1f1f1f',
          borderTopColor: '#00ffff',
        },
        headerStyle: {
          backgroundColor: '#0f0f0f',
        },
        headerTintColor: '#00ffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Breathe Test" component={BreatheTestScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}