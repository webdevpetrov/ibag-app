import { useState, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, Pressable, InteractionManager } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import theme from '../../config/theme';
import { formatDate, formatFullDate } from '../../utils/dates';
import { COMPLAINT_STATUS } from '../../config/complaints';

export default function ComplaintListScreen({ navigation }) {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const hasLoaded = useRef(false);

  const fetchComplaints = useCallback(async (p = 1) => {
    setError('');
    if (p === 1 && !hasLoaded.current) setLoading(true);
    else if (p > 1) setLoadingMore(true);

    try {
      const data = await api.getComplaints(token, p);
      const list = data.data ?? [];
      if (p === 1) {
        setComplaints(list);
      } else {
        setComplaints((prev) => [...prev, ...list]);
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
        fetchComplaints(1);
      });
      return () => task.cancel();
    }, [fetchComplaints]),
  );

  function handleLoadMore() {
    if (!loadingMore && page < lastPage) {
      fetchComplaints(page + 1);
    }
  }

  function renderItem({ item }) {
    const { day, month } = formatDate(item.created_at);
    const status = COMPLAINT_STATUS[item.status] || COMPLAINT_STATUS.pending;

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id })}
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
            <Text style={styles.infoLabel}>Поръчка:</Text>
            <Text style={styles.infoValue}>#{item.order_id}</Text>
          </View>
        </View>

        <View style={styles.subjectRow}>
          <Text style={styles.subjectText} numberOfLines={1}>{item.subject}</Text>
        </View>

        {item.description ? (
          <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={complaints}
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
              <Button mode="text" onPress={() => { hasLoaded.current = false; fetchComplaints(1); }}>Опитай отново</Button>
            </View>
          ) : (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Нямате рекламации</Text>
            </View>
          )
        }
        ListFooterComponent={loadingMore ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.footerLoader} />
        ) : null}
      />
      <View style={styles.footer}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('ComplaintForm')}
          buttonColor={theme.colors.primary}
          style={styles.addButton}
        >
          Нова рекламация
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
  subjectRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
    lineHeight: 18,
  },
  footerLoader: {
    paddingVertical: 16,
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
