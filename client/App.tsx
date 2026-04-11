import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { FirebaseProvider } from '@/context/FirebaseContext';
import { RootNavigator } from '@/navigation/RootNavigator';

/**
 * Inner wrapper so we can read `user._id` from AppContext
 * and pass it into FirebaseProvider.
 */
function AppWithFirebase(): React.JSX.Element {
    const { user } = useApp();
    return (
        <FirebaseProvider currentUserId={user?._id ?? null}>
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </FirebaseProvider>
    );
}

/**
 * Root Component of the application.
 * Wraps the app in necessary providers for navigation, safe area, and global state.
 */
function App(): React.JSX.Element {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AppProvider>
                    <AppWithFirebase />
                </AppProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

export default App;
