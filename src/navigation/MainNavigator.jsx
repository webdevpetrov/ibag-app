import { View, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, Text, Avatar, Badge } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions, Link } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import HomeNavigator from './HomeNavigator';
import CategoriesNavigator from './CategoriesNavigator';
import SearchScreen from '../screens/SearchScreen';
import FavoritesNavigator from './FavoritesNavigator';
import CartNavigator from './CartNavigator';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import theme from '../config/theme';

function Header() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();

  function handleAvatarPress() {
    navigation.navigate('Home', { screen: 'ProfileNav', params: { screen: 'Profile' } });
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.logo}>
        <Link screen="Home" params={{ screen: 'HomeScreen' }}>
            <Text style={styles.logoText}>iBag</Text>
        </Link>
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerLabel}>ПЪРВИ СВОБОДЕН ЧАС</Text>
        <Text style={styles.headerTime}>ДНЕС 20:00 - 21:00</Text>
      </View>
      <Pressable style={styles.avatarContainer} onPress={handleAvatarPress}>
        <Avatar.Text
          size={44}
          label={user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          style={{ backgroundColor: theme.colors.avatarBackground }}
        />
        <Badge style={styles.badge}>21</Badge>
      </Pressable>
    </View>
  );
}

const BottomTabs = createBottomTabNavigator();

export default function BottomTabsNavigator() {
  const { cartCount } = useCart();

  return (
    <BottomTabs.Navigator
      screenOptions={{
        header: () => <Header />,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          labeled={true}
          compact={true}
          shifting={false}
          activeColor={theme.colors.onPrimary}
          inactiveColor={theme.colors.onPrimaryMuted}
          activeIndicatorStyle={{ backgroundColor: 'transparent' }}
          style={{ backgroundColor: theme.colors.primary }}
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route }) => {
            if (route.state?.routes?.length > 1) {
              navigation.dispatch({
                ...CommonActions.reset({
                  index: 0,
                  routes: [{ name: route.state.routes[0].name }],
                }),
                target: route.state.key,
              });
            }
            navigation.navigate(route.name);
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }
            return null;
          }}
          getLabelText={({ route }) => descriptors[route.key].options.tabBarLabel}
        />
      )}
    >
      <BottomTabs.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Начало',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="storefront" color={color} size={size} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Categories"
        component={CategoriesNavigator}
        options={{
          tabBarLabel: 'Категории',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-text" color={color} size={size} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Търсене',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={size} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Favorites"
        component={FavoritesNavigator}
        options={{
          tabBarLabel: 'Любими',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" color={color} size={size} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Cart"
        component={CartNavigator}
        options={{
          tabBarLabel: 'Количка',
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialCommunityIcons name="cart" color={color} size={size} />
              {cartCount > 0 && (
                <Badge size={16} style={styles.cartBadge}>{cartCount}</Badge>
              )}
            </View>
          ),
        }}
      />
    </BottomTabs.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  logo: {
    width: 84,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: theme.colors.onPrimary,
    fontSize: 23,
    fontWeight: '400',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerLabel: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  headerTime: {
    color: theme.colors.onPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: theme.colors.notification,
  },
});
