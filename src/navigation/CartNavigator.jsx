import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/CartScreen';

const CartStack = createNativeStackNavigator();

export default function CartNavigator() {
  return (
    <CartStack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <CartStack.Screen name="CartScreen" component={CartScreen} options={{ title: 'Количка' }} />
    </CartStack.Navigator>
  );
}
