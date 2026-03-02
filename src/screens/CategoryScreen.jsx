import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getProducts } from '../api/client';
import { getCategoryIcon } from '../config/categoryIcons';
import Loader from '../components/Loader';
import theme from '../config/theme';

export default function CategoryScreen({ route, navigation }) {
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

    getProducts(categoryId, pageNum)
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
        <Pressable
          style={styles.productRow}
          onPress={() => navigation.navigate('ProductScreen', { productId: item.id })}
        >
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.imagePlaceholder]} />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price} лв.</Text>
          </View>
        </Pressable>
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
  productRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#eee',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
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
