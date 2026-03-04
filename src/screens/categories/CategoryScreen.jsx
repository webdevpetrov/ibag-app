import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getProducts } from '../../api/client';
import { getCategoryIcon } from '../../config/categoryIcons';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import ProductRow from '../../components/ProductRow';
import theme from '../../config/theme';

export default function CategoryScreen({ route, navigation }) {
  const { token } = useAuth();
  const { category } = route.params;
  const subcategories = category.children || [];
  const hasChildren = subcategories.length > 0;

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(!hasChildren);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback((categoryId, pageNum, isRefresh = false) => {
    const isFirstPage = pageNum === 1;
    if (isRefresh) setRefreshing(true);
    else if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    getProducts(token, categoryId, pageNum)
      .then((data) => {
        const items = data.data || [];
        const last = data.last_page || data.meta?.last_page || 1;
        setProducts((prev) => (isFirstPage ? items : [...prev, ...items]));
        setLastPage(last);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Грешка при зареждане.'))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    if (!hasChildren) {
      fetchProducts(category.id, 1);
    }
  }, [category.id, hasChildren, fetchProducts]);

  function handleRefresh() {
    setPage(1);
    fetchProducts(category.id, 1, true);
  }

  function handleEndReached() {
    if (!loadingMore && page < lastPage) {
      const next = page + 1;
      setPage(next);
      fetchProducts(category.id, next);
    }
  }

  if (hasChildren) {
    return (
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.gridContent}
        data={subcategories}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={styles.subcategoryCard}
            onPress={() => navigation.push('CategoryScreen', { category: item })}
          >
            <MaterialCommunityIcons
              name={getCategoryIcon(item.slug)}
              size={37}
              color={theme.colors.primary}
              style={styles.subcategoryIcon}
            />
            <Text style={styles.subcategoryLabel} numberOfLines={2}>{item.name}</Text>
          </Pressable>
        )}
      />
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={products}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ProductRow
          product={item}
          onPress={() => navigation.navigate('ProductScreen', { productId: item.id })}
        />
      )}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>Няма продукти в тази категория.</Text>
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={styles.footer} size="small" color={theme.colors.primary} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gridContent: {
    padding: 10,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  subcategoryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    minHeight: 80,
  },
  subcategoryIcon: {
    marginRight: 10,
  },
  subcategoryLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  listContent: {
    padding: 12,
    gap: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    color: '#999',
    fontSize: 15,
    marginTop: 40,
  },
  footer: {
    paddingVertical: 16,
  },
});
