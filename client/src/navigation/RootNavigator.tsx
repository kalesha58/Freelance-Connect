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
import MessagesScreen from '@/features/Messages/screens/MessagesScreen';
import NewChat from '@/features/Messages/screens/NewChat';
import MessageSettings from '@/features/Messages/screens/MessageSettings';
import SearchMessages from '@/features/Messages/screens/SearchMessages';
import JobDetailScreen from '@/features/Jobs/screens/JobDetailScreen';
import CreateJobScreen from '@/features/Jobs/screens/CreateJobScreen';
import MyJobsScreen from '@/features/Jobs/screens/MyJobsScreen';
import JobPreviewScreen from '@/features/Jobs/screens/JobPreviewScreen';
import ApplicantsScreen from '@/features/Jobs/screens/ApplicantsScreen';
import HireConfirmScreen from '@/features/Jobs/screens/HireConfirmScreen';
import FreelancerProfileScreen from '@/features/Jobs/screens/FreelancerProfileScreen';
import SearchScreen from '@/features/Jobs/screens/SearchScreen';
import FilterModal from '@/features/Jobs/screens/FilterModal';
import { CreatePostScreen, PostCommentsScreen } from '@/features/Feed/screens';
import ProfileSetupScreen from '@/features/Profile/screens/ProfileSetupScreen';
import EditProfileScreen from '@/features/Profile/screens/EditProfileScreen';
import FollowListScreen from '@/features/Profile/screens/FollowListScreen';
import SettingsScreen from '@/features/Profile/screens/SettingsScreen';
import ReferralScreen from '@/features/Profile/screens/ReferralScreen';
import RatingsScreen from '@/features/Profile/screens/RatingsScreen';
import NotificationsScreen from '@/features/Common/screens/NotificationsScreen';
import HelpScreen from '@/features/Common/screens/HelpScreen';
import TermsScreen from '@/features/Common/screens/TermsScreen';
import ReportScreen from '@/features/Common/screens/ReportScreen';

import { MainTabNavigator } from './MainNavigator';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Stack Navigator for the application.
 * Manages switching between Auth and Main application stacks based on session.
 */
export const RootNavigator = () => {
    const { user } = useApp();
    const colors = useColors();

    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                animation: 'fade_from_bottom',
                contentStyle: { backgroundColor: colors.background }
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
            ) : user.isProfileComplete === false ? (
                <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
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
                    <Stack.Screen name="PostComments" component={PostCommentsScreen} options={{ presentation: 'modal' }} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                    <Stack.Screen name="FollowList" component={FollowListScreen} />
                    <Stack.Screen name="Referral" component={ReferralScreen} />
                    <Stack.Screen name="Ratings" component={RatingsScreen} />
                    <Stack.Screen name="Notifications" component={NotificationsScreen} />
                    <Stack.Screen name="Help" component={HelpScreen} />
                    <Stack.Screen name="Terms" component={TermsScreen} />
                    <Stack.Screen name="Report" component={ReportScreen} />
                    <Stack.Screen name="NewChat" component={NewChat} />
                    <Stack.Screen name="MessageSettings" component={MessageSettings} />
                    <Stack.Screen name="SearchMessages" component={SearchMessages} />
                    <Stack.Screen name="Messages" component={MessagesScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};
