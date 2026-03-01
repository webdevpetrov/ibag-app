import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, Text, Avatar, Badge } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CartScreen from '../screens/CartScreen';
import { Link } from '@react-navigation/native';
import theme from '../config/theme';

function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.logo}>
        <Link screen="Home">
            <Text style={styles.logoText}>iBag</Text>
        </Link>
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerLabel}>ПЪРВИ СВОБОДЕН ЧАС</Text>
        <Text style={styles.headerTime}>ДНЕС 20:00 - 21:00</Text>
      </View>
      <View style={styles.avatarContainer}>
        <Avatar.Icon size={44} icon="account" style={{ backgroundColor: theme.colors.avatarBackground }} />
        <Badge style={styles.badge}>21</Badge>
      </View>
    </View>
  );
}

const BottomTabs = createBottomTabNavigator();

export default function BottomTabsNavigator() {
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
            navigation.navigate(route.name, route.params);
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
        component={HomeScreen}
        options={{
          tabBarLabel: 'Начало',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="storefront" color={color} size={size} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Categories"
        component={CategoriesScreen}
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
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Любими',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" color={color} size={size} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Количка',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" color={color} size={size} />
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
});