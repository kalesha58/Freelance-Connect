import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import DashboardScreen from '@/features/Dashboard/screens/DashboardScreen';
import FeedScreen from '@/features/Feed/screens/FeedScreen';
import HomeScreen from '@/features/Jobs/screens/HomeScreen';
import MessagesScreen from '@/features/Messages/screens/MessagesScreen';
import ProfileScreen from '@/features/Profile/screens/ProfileScreen';
import { useColors } from '@/hooks/useColors';

const Tab = createBottomTabNavigator();

/**
 * MainTabNavigator provides the core tab-based navigation for the application.
 * Implements premium aesthetics with optional blur on iOS and centralized theming.
 */
export const MainTabNavigator = () => {
    const colors = useColors();
    const isIOS = Platform.OS === 'ios';

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.mutedForeground,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: isIOS ? 'transparent' : colors.card,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    elevation: 0,
                    height: 60 + (isIOS ? 20 : 0),
                    paddingBottom: isIOS ? 25 : 10,
                },
                tabBarBackground: () =>
                    isIOS ? (
                        <BlurView
                            style={StyleSheet.absoluteFill}
                            blurType="regular"
                            blurAmount={15}
                        />
                    ) : null,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                },
            }}
        >
            <Tab.Screen
                name="Feed"
                component={FeedScreen}
                options={{
                    tabBarLabel: 'Community',
                    tabBarIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size - 1} color={color} />,
                }}
            />
            <Tab.Screen
                name="Jobs"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Jobs',
                    tabBarIcon: ({ color, size }) => <Feather name="briefcase" size={size - 2} color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <Feather name="user" size={size - 1} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};
