import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderConfirmationScreen from '../screens/orders/OrderConfirmationScreen';
import ProductScreen from '../screens/categories/ProductScreen';

const CartStack = createNativeStackNavigator();

export default function CartNavigator() {
  return (
    <CartStack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <CartStack.Screen name="CartScreen" component={CartScreen} options={{ title: 'Количка' }} />
      <CartStack.Screen name="ProductScreen" component={ProductScreen} options={{ title: 'Продукт' }} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Поръчка' }} />
      <CartStack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ title: 'Успешно направена поръчка', headerBackVisible: false }}
      />
    </CartStack.Navigator>
  );
}
