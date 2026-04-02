import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider } from '@/context/AppContext';
import { RootNavigator } from '@/navigation/RootNavigator';

/**
 * Root Component of the application.
 * Wraps the app in necessary providers for navigation, safe area, and global state.
 */
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
