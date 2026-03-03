import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/categories/CategoryScreen';
import ProductScreen from '../screens/categories/ProductScreen';
import ProfileNavigator from './ProfileNavigator';

const HomeStack = createNativeStackNavigator();

export default function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={{ headerBackTitle: '' }} />
      <HomeStack.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.category?.name || 'Категория',
        })}
      />
      <HomeStack.Screen
        name="ProductScreen"
        component={ProductScreen}
        options={{ headerShown: true, title: 'Продукт' }}
      />
      <HomeStack.Screen name="ProfileNav" component={ProfileNavigator} />
    </HomeStack.Navigator>
  );
}
