import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProductScreen from '../screens/categories/ProductScreen';

const FavoritesStack = createNativeStackNavigator();

export default function FavoritesNavigator() {
  return (
    <FavoritesStack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <FavoritesStack.Screen name="FavoritesScreen" component={FavoritesScreen} options={{ title: 'Любими' }} />
      <FavoritesStack.Screen name="ProductScreen" component={ProductScreen} options={{ headerShown: true, title: 'Продукт' }} />
    </FavoritesStack.Navigator>
  );
}
