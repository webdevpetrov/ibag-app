import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { getProduct } from '../../api/client';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import theme from '../../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductScreen({ route, navigation }) {
  const { token } = useAuth();
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleAddToCart = useCallback(() => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, [product, addToCart]);

  useEffect(() => {
    getProduct(token, productId)
      .then((data) => {
        const p = data.data || data;
        setProduct(p);
        navigation.setOptions({ title: p.name || '' });
      })
      .catch((err) => setError(err.message || 'Грешка при зареждане.'))
      .finally(() => setLoading(false));
  }, [productId, navigation]);

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

  if (!product) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
          <IconButton
            icon={isFavorite(product.id) ? 'heart' : 'heart-outline'}
            iconColor={isFavorite(product.id) ? theme.colors.notification : '#555'}
            size={26}
            style={styles.heartOverlay}
            onPress={() => toggleFavorite(product)}
          />
        </View>

        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price} лв.</Text>

        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          mode="contained"
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
          onPress={handleAddToCart}
          icon={added ? 'check' : 'cart-outline'}
        >
          {added ? 'Добавено!' : 'Добави'}
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
  scrollContent: {
    paddingBottom: 24,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: theme.colors.surface,
  },
  imagePlaceholder: {
    backgroundColor: '#eee',
  },
  heartOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  addButton: {
    borderRadius: 24,
  },
  addButtonContent: {
    paddingVertical: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});
