import { useState, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, Alert, Pressable, InteractionManager } from 'react-native';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import theme from '../../config/theme';
import { formatAddress } from '../../utils/address';

const LABEL_ICONS = {
  'Вкъщи': 'home-outline',
  'Офис': 'office-building-outline',
};

export default function AddressListScreen({ navigation }) {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoaded = useRef(false);

  const fetchAddresses = useCallback(async () => {
    setError('');
    if (!hasLoaded.current) setLoading(true);
    try {
      const data = await api.getAddresses(token);
      setAddresses(data.data ?? data);
      hasLoaded.current = true;
    } catch (err) {
      setError(err.message || 'Грешка при зареждане.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        fetchAddresses();
      });
      return () => task.cancel();
    }, [fetchAddresses]),
  );

  function handleDelete(address) {
    Alert.alert(
      'Изтриване на адрес',
      `Сигурни ли сте, че искате да изтриете "${address.label}"?`,
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAddress(token, address.id);
              setAddresses((prev) => prev.filter((a) => a.id !== address.id));
            } catch (err) {
              Alert.alert('Грешка', err.message || 'Неуспешно изтриване.');
            }
          },
        },
      ],
    );
  }

  function renderItem({ item }) {
    const icon = LABEL_ICONS[item.label] || 'map-marker-outline';

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('AddressForm', { address: item })}
      >
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons name={icon} size={28} color={theme.colors.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardLabel}>{item.label}</Text>
          <Text style={styles.cardAddress} numberOfLines={2}>{formatAddress(item) || 'Непопълнен адрес'}</Text>
          {item.contact_name && (
            <Text style={styles.cardContact}>
              {item.contact_name}{item.contact_phone ? ` • ${item.contact_phone}` : ''}
            </Text>
          )}
        </View>
        <IconButton
          icon="delete-outline"
          size={22}
          iconColor="#999"
          onPress={() => handleDelete(item)}
        />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.empty}>
              <Text style={styles.errorText}>{error}</Text>
              <Button mode="text" onPress={() => { hasLoaded.current = false; fetchAddresses(); }}>Опитай отново</Button>
            </View>
          ) : (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="map-marker-off-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Нямате запазени адреси</Text>
            </View>
          )
        }
      />
      <View style={styles.footer}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('AddressForm')}
          buttonColor={theme.colors.primary}
          style={styles.addButton}
        >
          Добави адрес
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loader: {
    marginTop: 60,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#c00',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  cardAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardContact: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  addButton: {
    paddingVertical: 4,
  },
});
