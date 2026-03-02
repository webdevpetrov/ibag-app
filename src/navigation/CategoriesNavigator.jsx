import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryScreen from '../screens/CategoryScreen';
import ProductScreen from '../screens/ProductScreen';

const CategoriesStack = createNativeStackNavigator();

export default function CategoriesNavigator() {
  return (
    <CategoriesStack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <CategoriesStack.Screen name="CategoriesScreen" component={CategoriesScreen} options={{ title: 'Категории' }} />
      <CategoriesStack.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={({ route }) => ({ title: route.params.category.name })}
      />
      <CategoriesStack.Screen name="ProductScreen" component={ProductScreen} options={{ title: '' }} />
    </CategoriesStack.Navigator>
  );
}
