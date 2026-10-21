import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import ExploreScreen from '../screens/ExploreScreen';
import BookingsScreen from '../screens/BookingsScreen';
import BlacklistScreen from '../screens/BlacklistScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CaregiverDetailsScreen from '../screens/CaregiverDetailsScreen';
import BookCaregiverScreen from '../screens/BookCaregiverScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from '../screens/ServicesScreen';
import PoliciesScreen from '../screens/PoliciesScreen';
import ContactUsScreen from '../screens/ContactUsScreen';

import SideMenu from '../components/SideMenu';
import { DrawerProvider, useDrawer } from '../context/DrawerContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { useLocale } from '../locales';

export const navigationRef = createNavigationContainerRef();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { t } = useLocale();
  const { isAuthenticated, user } = useAuth();
  const { setCurrentScreen } = useDrawer();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ServicesTab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'ExploreTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'BookingsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'SafetyTab') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size || 22} color={color} />;
        },
      })}
      screenListeners={({ route }) => ({
        state: () => {
          if (route.name === 'HomeTab') setCurrentScreen('Home');
          else if (route.name === 'ServicesTab') setCurrentScreen('Services');
          else if (route.name === 'ExploreTab') setCurrentScreen('Explore');
          else if (route.name === 'BookingsTab') setCurrentScreen('Bookings');
          else if (route.name === 'SafetyTab') setCurrentScreen('Safety');
          else if (route.name === 'ProfileTab') setCurrentScreen('Profile');
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: t('home') }}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ServicesScreen}
        options={{ tabBarLabel: t('services') }}
      />
      {isAuthenticated && user?.role === 'user' && (
        <Tab.Screen
          name="ExploreTab"
          component={ExploreScreen}
          options={{ tabBarLabel: t('explore') }}
        />
      )}
      {isAuthenticated && (
        <Tab.Screen
          name="BookingsTab"
          component={BookingsScreen}
          options={{ tabBarLabel: t('bookings') }}
        />
      )}
      {isAuthenticated && user?.role === 'user' && (
        <Tab.Screen
          name="SafetyTab"
          component={BlacklistScreen}
          options={{ tabBarLabel: t('safety') }}
        />
      )}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: t('profile') }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <View style={styles.rootWrapper}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Services" component={ServicesScreen} />
          <Stack.Screen name="Policies" component={PoliciesScreen} />
          <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen name="CaregiverDetails" component={CaregiverDetailsScreen} />
          <Stack.Screen name="BookCaregiver" component={BookCaregiverScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Global Animated Side Menu */}
      <SideMenu navigation={navigationRef} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <DrawerProvider>
      <RootNavigator />
    </DrawerProvider>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1e8f2',
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#4a154b',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
