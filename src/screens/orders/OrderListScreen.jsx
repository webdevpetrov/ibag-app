import { useState, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, Pressable, Platform, InteractionManager } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import theme from '../../config/theme';
import { formatDate, formatFullDate } from '../../utils/dates';
import { formatAddress } from '../../utils/address';
import { ORDER_STATUS } from '../../config/orders';

export default function OrderListScreen({ navigation }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const hasLoaded = useRef(false);

  const fetchOrders = useCallback(async (p = 1) => {
    setError('');
    if (p === 1 && !hasLoaded.current) setLoading(true);
    else if (p > 1) setLoadingMore(true);

    try {
      const data = await api.getOrders(token, p);
      const list = data.data ?? [];
      if (p === 1) {
        setOrders(list);
      } else {
        setOrders((prev) => [...prev, ...list]);
      }
      setPage(data.meta?.current_page ?? p);
      setLastPage(data.meta?.last_page ?? 1);
      hasLoaded.current = true;
    } catch (err) {
      setError(err.message || 'Грешка при зареждане.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        fetchOrders(1);
      });
      return () => task.cancel();
    }, [fetchOrders]),
  );

  function handleLoadMore() {
    if (!loadingMore && page < lastPage) {
      fetchOrders(page + 1);
    }
  }

  function renderItem({ item }) {
    const { day, month } = formatDate(item.created_at);
    const status = ORDER_STATUS[item.status] || ORDER_STATUS.pending;
    const phone = item.address?.contact_phone ?? item.phone;
    const addr = formatAddress(item.address);
    const itemsCount = item.items_count ?? item.items?.length ?? 0;

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <View style={styles.dateBanner}>
          <Text style={styles.dateDay}>{day}</Text>
          <View>
            <Text style={styles.dateMonth}>{month}</Text>
            <Text style={styles.dateTime}>{formatFullDate(item.created_at).split(', ')[1]}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.infoLabel}>Статус:</Text>
            <Text style={[styles.infoValue, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={styles.infoRight}>
            <Text style={styles.infoLabel}>Общо:</Text>
            <Text style={styles.infoValue}>{parseFloat(item.total).toFixed(2)} лв.</Text>
          </View>
        </View>

        <View style={styles.idRow}>
          <Text style={styles.orderId}>#{item.id}</Text>
        </View>

        {phone && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Телефон:</Text>
            <Text style={styles.detailValue}>{phone}</Text>
          </View>
        )}

        {addr ? (
          <Text style={styles.addressText} numberOfLines={2}>{addr}</Text>
        ) : null}

        {itemsCount > 0 && (
          <Text style={styles.itemsCount}>{itemsCount} {itemsCount === 1 ? 'продукт' : 'продукта'}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.empty}>
              <Text style={styles.errorText}>{error}</Text>
              <Button mode="text" onPress={() => { hasLoaded.current = false; fetchOrders(1); }}>Опитай отново</Button>
            </View>
          ) : (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="package-variant" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Нямате поръчки</Text>
            </View>
          )
        }
        ListFooterComponent={loadingMore ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.footerLoader} />
        ) : null}
      />
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
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dateDay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  dateMonth: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  dateTime: {
    fontSize: 13,
    color: '#999',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  infoRight: {
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  idRow: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  orderId: {
    fontSize: 13,
    color: '#999',
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  detailRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#999',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 4,
    lineHeight: 18,
  },
  itemsCount: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 6,
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
