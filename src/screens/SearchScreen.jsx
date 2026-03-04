import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { getProducts, searchProducts } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ProductRow from '../components/ProductRow';
import theme from '../config/theme';

export default function SearchScreen({ navigation }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const timerRef = useRef(null);

  const fetchProducts = useCallback((q, pageNum) => {
    const isFirstPage = pageNum === 1;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    const request = q ? searchProducts(token, q, pageNum) : getProducts(token, null, pageNum);

    request
      .then((data) => {
        const items = data.data || [];
        const last = data.last_page || data.meta?.last_page || 1;
        setProducts((prev) => (isFirstPage ? items : [...prev, ...items]));
        setLastPage(last);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const q = query.trim();

    if (!q) {
      setPage(1);
      fetchProducts('', 1);
      return;
    }

    timerRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(q, 1);
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [query, fetchProducts]);

  function handleEndReached() {
    if (!loadingMore && page < lastPage) {
      const next = page + 1;
      setPage(next);
      fetchProducts(query.trim(), next);
    }
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Търсене на продукти..."
        value={query}
        onChangeText={setQuery}
        style={styles.searchbar}
      />

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.infoText}>
            {query.trim() ? 'Няма намерени продукти' : 'Няма налични продукти'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductRow
              product={item}
              onPress={() => navigation.navigate('ProductScreen', { productId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footer} size="small" color={theme.colors.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchbar: {
    margin: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#999',
    fontSize: 15,
  },
  listContent: {
    padding: 12,
    gap: 10,
  },
  footer: {
    paddingVertical: 16,
  },
});
