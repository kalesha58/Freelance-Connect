import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Auth Screens
import SplashScreen from '@/features/Auth/screens/SplashScreen';
import OnboardingScreen from '@/features/Auth/screens/OnboardingScreen';
import LoginScreen from '@/features/Auth/screens/LoginScreen';
import SignupScreen from '@/features/Auth/screens/SignupScreen';
import ForgotPasswordScreen from '@/features/Auth/screens/ForgotPasswordScreen';
import OTPVerificationScreen from '@/features/Auth/screens/OTPVerificationScreen';
import ResetPasswordScreen from '@/features/Auth/screens/ResetPasswordScreen';

// Main App Screens
import ChatScreen from '@/features/Messages/screens/ChatScreen';
import JobDetailScreen from '@/features/Jobs/screens/JobDetailScreen';
import CreateJobScreen from '@/features/Jobs/screens/CreateJobScreen';
import MyJobsScreen from '@/features/Jobs/screens/MyJobsScreen';
import JobPreviewScreen from '@/features/Jobs/screens/JobPreviewScreen';
import ApplicantsScreen from '@/features/Jobs/screens/ApplicantsScreen';
import HireConfirmScreen from '@/features/Jobs/screens/HireConfirmScreen';
import FreelancerProfileScreen from '@/features/Jobs/screens/FreelancerProfileScreen';
import SearchScreen from '@/features/Jobs/screens/SearchScreen';
import FilterModal from '@/features/Jobs/screens/FilterModal';
import CreatePostScreen from '@/features/Feed/screens/CreatePostScreen';
import SettingsScreen from '@/features/Profile/screens/SettingsScreen';
import RatingsScreen from '@/features/Profile/screens/RatingsScreen';
import NotificationsScreen from '@/features/Common/screens/NotificationsScreen';
import HelpScreen from '@/features/Common/screens/HelpScreen';
import TermsScreen from '@/features/Common/screens/TermsScreen';
import ReportScreen from '@/features/Common/screens/ReportScreen';

import { MainTabNavigator } from './MainNavigator';
import { useApp } from '@/context/AppContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Stack Navigator for the application.
 * Manages switching between Auth and Main application stacks based on session.
 */
export const RootNavigator = () => {
    const { user } = useApp();

    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                animation: 'fade_from_bottom',
                contentStyle: { backgroundColor: '#fff' }
            }}
        >
            {!user ? (
                <>
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
                    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Main" component={MainTabNavigator} />
                    <Stack.Screen name="Chat" component={ChatScreen} />
                    <Stack.Screen name="JobDetail" component={JobDetailScreen} />
                    <Stack.Screen name="CreateJob" component={CreateJobScreen} />
                    <Stack.Screen name="MyJobs" component={MyJobsScreen} />
                    <Stack.Screen name="JobPreview" component={JobPreviewScreen} />
                    <Stack.Screen name="Applicants" component={ApplicantsScreen} />
                    <Stack.Screen name="HireConfirm" component={HireConfirmScreen} />
                    <Stack.Screen name="FreelancerProfile" component={FreelancerProfileScreen} />
                    <Stack.Screen name="Search" component={SearchScreen} />
                    <Stack.Screen name="FilterModal" component={FilterModal} options={{ presentation: 'modal' }} />
                    <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ presentation: 'modal' }} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="Ratings" component={RatingsScreen} />
                    <Stack.Screen name="Notifications" component={NotificationsScreen} />
                    <Stack.Screen name="Help" component={HelpScreen} />
                    <Stack.Screen name="Terms" component={TermsScreen} />
                    <Stack.Screen name="Report" component={ReportScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};
