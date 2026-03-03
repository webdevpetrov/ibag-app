import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import AddressListScreen from '../screens/addresses/AddressListScreen';
import AddressFormScreen from '../screens/addresses/AddressFormScreen';
import OrderListScreen from '../screens/orders/OrderListScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import ComplaintListScreen from '../screens/complaints/ComplaintListScreen';
import ComplaintFormScreen from '../screens/complaints/ComplaintFormScreen';
import ComplaintDetailScreen from '../screens/complaints/ComplaintDetailScreen';

const ProfileStack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Профил' }}
      />
      <ProfileStack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: 'Редакция на профил' }}
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Смяна на парола' }}
      />
      <ProfileStack.Screen
        name="AddressList"
        component={AddressListScreen}
        options={{ title: 'Адреси' }}
      />
      <ProfileStack.Screen
        name="AddressForm"
        component={AddressFormScreen}
        options={({ route }) => ({
          title: route.params?.address ? 'Редакция на адрес' : 'Нов адрес',
        })}
      />
      <ProfileStack.Screen
        name="OrderList"
        component={OrderListScreen}
        options={{ title: 'Поръчки' }}
      />
      <ProfileStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Поръчка' }}
      />
      <ProfileStack.Screen
        name="ComplaintList"
        component={ComplaintListScreen}
        options={{ title: 'Рекламации' }}
      />
      <ProfileStack.Screen
        name="ComplaintForm"
        component={ComplaintFormScreen}
        options={{ title: 'Нова рекламация' }}
      />
      <ProfileStack.Screen
        name="ComplaintDetail"
        component={ComplaintDetailScreen}
        options={{ title: 'Рекламация' }}
      />
    </ProfileStack.Navigator>
  );
}
