import { View, ScrollView, StyleSheet, Pressable, Switch } from 'react-native';
import { Avatar, Text, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import theme from '../../config/theme';

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

function AuthView({ navigation }) {
  const { user, signOut, biometricAvailable, biometricEnabled, enableBiometric, disableBiometric } = useAuth();

  async function handleBiometricToggle(value) {
    if (value) {
      await enableBiometric();
    } else {
      await disableBiometric();
    }
  }

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
        <MenuItem icon="package-variant-closed" label="Поръчки" onPress={() => navigation.navigate('OrderList')} />
        <MenuItem icon="alert-circle-outline" label="Рекламации" onPress={() => navigation.navigate('ComplaintList')} />
        <MenuItem icon="heart-outline" label="Любими" />
        <MenuItem icon="star-outline" label="Оцени ни" badge={11} />
        <MenuItem icon="bell-outline" label="Известия" badge={10} />
      </View>

      <Divider />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Моят профил</Text>
        <MenuItem icon="account-edit-outline" label="Редакция на профил" onPress={() => navigation.navigate('ProfileEdit')} />
        <MenuItem icon="map-marker-outline" label="Адреси" onPress={() => navigation.navigate('AddressList')} />
        <MenuItem icon="ticket-percent-outline" label="Промо кодове" />
        <MenuItem icon="wallet-giftcard" label="Ваучери" />
      </View>

      <Divider />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Сигурност</Text>
        <MenuItem icon="lock-outline" label="Смяна на парола" onPress={() => navigation.navigate('ChangePassword')} />
        {biometricAvailable && (
          <View style={styles.menuItem}>
            <MaterialCommunityIcons name="fingerprint" size={24} color={theme.colors.text} />
            <Text style={styles.menuLabel}>Вход с биометрия</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        )}
      </View>

      <Divider />

      <View style={styles.section}>
        <MenuItem icon="logout" label="Изход" onPress={signOut} />
      </View>
    </ScrollView>
  );
}

export default function ProfileScreen({ navigation }) {
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
});
