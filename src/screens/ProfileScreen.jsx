import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Avatar, Text, Divider, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import theme from '../config/theme';

function MenuItem({ icon, label, badge, onPress }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={24} color={theme.colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={styles.menuRight}>
        {badge != null && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
      </View>
    </Pressable>
  );
}

function GuestView({ navigation }) {
  return (
    <View style={styles.guestContainer}>
      <Avatar.Icon
        size={80}
        icon="account"
        style={{ backgroundColor: theme.colors.primary }}
      />
      <Text style={styles.guestTitle}>Влез в акаунта си</Text>
      <Text style={styles.guestSubtitle}>
        За да управляваш поръчките и профила си
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Login')}
        style={styles.guestButton}
        buttonColor={theme.colors.primary}
      >
        Вход
      </Button>
      <Text
        style={styles.guestLink}
        onPress={() => navigation.navigate('Register')}
      >
        Регистрация
      </Text>
    </View>
  );
}

function AuthView({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.greeting}>
        <Avatar.Text
          size={64}
          label={user.name.charAt(0).toUpperCase()}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text style={styles.greetingText}>
          {`Здравей,\n${user.name}`}
        </Text>
      </View>

      <Divider />

      <View style={styles.section}>
        <MenuItem icon="package-variant-closed" label="Поръчки" />
        <MenuItem icon="heart-outline" label="Любими" />
        <MenuItem icon="star-outline" label="Оцени ни" badge={11} />
        <MenuItem icon="bell-outline" label="Известия" badge={10} />
      </View>

      <Divider />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Моят профил</Text>
        <MenuItem icon="map-marker-outline" label="Адреси" />
        <MenuItem icon="ticket-percent-outline" label="Промо кодове" />
        <MenuItem icon="wallet-giftcard" label="Ваучери" />
      </View>

      <Divider />

      <View style={styles.section}>
        <MenuItem icon="logout" label="Изход" onPress={signOut} />
      </View>
    </ScrollView>
  );
}

export default function ProfileScreen({ navigation }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <GuestView navigation={navigation} />;
  }

  return <AuthView navigation={navigation} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    color: theme.colors.text,
  },
  section: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    color: theme.colors.text,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: theme.colors.notification,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    color: theme.colors.text,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  guestButton: {
    marginTop: 24,
    paddingVertical: 4,
    width: '100%',
  },
  guestLink: {
    marginTop: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});
