import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '@/features/Dashboard/screens/DashboardScreen';
import FeedScreen from '@/features/Feed/screens/FeedScreen';
import HomeScreen from '@/features/Jobs/screens/HomeScreen';
import MyJobsScreen from '@/features/Jobs/screens/MyJobsScreen';
import MessagesScreen from '@/features/Messages/screens/MessagesScreen';
import ProfileScreen from '@/features/Profile/screens/ProfileScreen';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const Tab = createBottomTabNavigator();

/**
 * MainTabNavigator provides the core tab-based navigation for the application.
 * Implements premium aesthetics with optional blur on iOS and centralized theming.
 */
export const MainTabNavigator = () => {
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const { user } = useApp();
    const isIOS = Platform.OS === 'ios';

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.mutedForeground,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    height: (isIOS ? 64 : 60) + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : (isIOS ? 12 : 8),
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: isIOS ? 0 : 4,
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
                name="MyJobs"
                component={MyJobsScreen}
                options={{
                    tabBarLabel: (user?.role === 'hiring' || user?.role === 'requester') ? 'Postings' : 'My Jobs',
                    tabBarIcon: ({ color, size }) => <Feather name="folder" size={size - 2} color={color} />,
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
