import { useState, useEffect, useCallback } from 'react';
import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getCategories } from '../api/client';
import { getCategoryIcon } from '../config/categoryIcons';
import Loader from '../components/Loader';
import theme from '../config/theme';

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(() => {
    getCategories()
      .then((data) => setCategories(data.data || data))
      .catch((err) => setError(err.message || 'Грешка при зареждане.'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function handleRefresh() {
    setRefreshing(true);
    fetchCategories();
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
      contentContainerStyle={styles.content}
      data={categories}
      numColumns={2}
      columnWrapperStyle={styles.row}
      keyExtractor={(item) => String(item.id)}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('CategoryScreen', { category: item })}
        >
          <MaterialCommunityIcons
            name={getCategoryIcon(item.slug)}
            size={37}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.label}>{item.name}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 10,
    gap: 10,
  },
  row: {
    gap: 10,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    minHeight: 80,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
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
});
