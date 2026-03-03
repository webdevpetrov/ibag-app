import { useState, useEffect } from 'react';
import { View, Image, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import theme from '../../config/theme';
import { formatDate, formatFullDate } from '../../utils/dates';
import { formatAddress } from '../../utils/address';
import { ORDER_STATUS } from '../../config/orders';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getOrder(token, orderId);
        setOrder(data.data ?? data);
      } catch (err) {
        setError(err.message || 'Грешка при зареждане.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, orderId]);

  function handleCancel() {
    Alert.alert(
      'Отказ на поръчка',
      'Сигурни ли сте, че искате да откажете тази поръчка?',
      [
        { text: 'Не', style: 'cancel' },
        {
          text: 'Откажи',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const data = await api.cancelOrder(token, orderId);
              setOrder(data.data ?? data);
            } catch (err) {
              Alert.alert('Грешка', err.message || 'Неуспешен отказ.');
              try {
                const fresh = await api.getOrder(token, orderId);
                setOrder(fresh.data ?? fresh);
              } catch {}
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Поръчката не е намерена.'}</Text>
        <Button mode="text" onPress={() => navigation.goBack()}>Назад</Button>
      </View>
    );
  }

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
  const { day, month } = formatDate(order.created_at);
  const phone = order.address?.contact_phone ?? order.phone;
  const addr = formatAddress(order.address);

  function renderHeader() {
    return (
      <View>
        <View style={styles.dateBanner}>
          <Text style={styles.dateDay}>{day}</Text>
          <View>
            <Text style={styles.dateMonth}>{month}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Поръчка от:</Text>
            <Text style={styles.infoValue}>{formatFullDate(order.created_at)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Обща сума:</Text>
            <Text style={styles.infoValueBold}>{parseFloat(order.total).toFixed(2)} лв.</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Статус:</Text>
            <Text style={[styles.infoValueBold, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {addr ? (
          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>Адрес:</Text>
            <Text style={styles.addressText}>{addr}</Text>
          </View>
        ) : null}

        {phone && (
          <View style={styles.phoneRow}>
            <Text style={styles.addressLabel}>Телефон:</Text>
            <Text style={styles.phoneValue}>{phone}</Text>
          </View>
        )}

        {order.notes ? (
          <View style={styles.notesSection}>
            <Text style={styles.addressLabel}>Бележки:</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        ) : null}

        {order.status === 'pending' && (
          <Button
            mode="outlined"
            textColor="#EF4444"
            style={styles.cancelButton}
            onPress={handleCancel}
            loading={cancelling}
            disabled={cancelling}
          >
            Откажи поръчката
          </Button>
        )}

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Продукти ({order.items?.length ?? 0})</Text>
      </View>
    );
  }

  function renderItem({ item }) {
    const imageUrl = item.product?.image_url;
    return (
      <View style={styles.itemRow}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <MaterialCommunityIcons name="image-off-outline" size={24} color="#ccc" />
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.product?.name ?? `Продукт #${item.product_id}`}</Text>
          <Text style={styles.itemQty}>x{item.quantity}</Text>
        </View>
        <View style={styles.itemPrices}>
          <Text style={styles.itemSubtotal}>{parseFloat(item.subtotal).toFixed(2)} лв.</Text>
          <Text style={styles.itemUnitPrice}>{parseFloat(item.unit_price).toFixed(2)} лв./бр.</Text>
        </View>
      </View>
    );
  }

  function renderFooter() {
    return (
      <View style={styles.totalSection}>
        <Divider />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Общо:</Text>
          <Text style={styles.totalValue}>{parseFloat(order.total).toFixed(2)} лв.</Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={order.items ?? []}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.list}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#c00',
    marginBottom: 12,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 16,
  },
  dateDay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateMonth: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    gap: 4,
  },
  infoCell: {
    minWidth: '30%',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  infoValueBold: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  addressSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  phoneRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  phoneValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  notesSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  cancelButton: {
    borderColor: '#EF4444',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  itemImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 13,
    color: '#666',
  },
  itemPrices: {
    alignItems: 'flex-end',
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemUnitPrice: {
    fontSize: 12,
    color: '#999',
  },
  totalSection: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
