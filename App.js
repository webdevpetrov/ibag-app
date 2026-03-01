import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import BottomTabsNavigator from './src/navigation/BottomNavigation';
import theme from './src/config/theme';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <NavigationContainer>
        <BottomTabsNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
