import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from '../screens/SearchScreen';
import ProductScreen from '../screens/categories/ProductScreen';

const SearchStack = createNativeStackNavigator();

export default function SearchNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <SearchStack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: false }} />
      <SearchStack.Screen name="ProductScreen" component={ProductScreen} options={{ headerShown: true, title: 'Продукт' }} />
    </SearchStack.Navigator>
  );
}
