import { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Card, Button, Chip, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getCategories, getProducts } from '../api/client';
import { getCategoryIcon } from '../config/categoryIcons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import theme from '../config/theme';

const BANNER_PADDING = 12;
const BANNER_GAP = 8;
const CARD_WIDTH = 170;
const IMAGE_HEIGHT = 150;

const BASE_URL = process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/v\d+$/, '');
const bannerUrl = (name) => `${BASE_URL}/storage/banners/${name}`;

const FEATURED_CATEGORIES = [
  { id: 2, name: 'Плодове' },
  { id: 3, name: 'Зеленчуци' },
  { id: 14, name: 'Риба' },
  { id: 34, name: 'Кашкавал' },
  { id: 18, name: 'Телешко и говеждо месо' },
];

const BANNERS = [
  { source: { uri: bannerUrl('z.webp') }, categoryId: 3, categoryName: 'Зеленчуци' },
  { source: { uri: bannerUrl('purina.webp') }, categoryId: 223, categoryName: 'Храна за котки' },
];

const BANNERS_HALF = [
  { source: { uri: bannerUrl('m.webp') }, categoryId: 137, categoryName: 'Маслини' },
  { source: { uri: bannerUrl('d.webp') }, categoryId: 67, categoryName: 'Донъти' },
];

const BANNERS_BOTTOM = [
  { source: { uri: bannerUrl('monge.webp') }, categoryId: 222, categoryName: 'Monge' },
  { source: { uri: bannerUrl('zoo.webp') }, categoryId: 225, categoryName: 'Зоомагазин' },
];

const Banner = memo(function Banner({ source, half, onPress, fullWidth, halfWidth }) {
  const imgStyle = half
    ? [styles.bannerImgHalf, { width: halfWidth, height: halfWidth }]
    : [styles.bannerImg, { width: fullWidth, height: fullWidth * (9 / 16) }];

  const img = <Image source={source} style={imgStyle} />;
  if (!onPress) return img;
  return <TouchableOpacity activeOpacity={0.8} onPress={onPress}>{img}</TouchableOpacity>;
});

const BannerGroup = memo(function BannerGroup({ banners, navigation, half, style, fullWidth, halfWidth }) {
  const navigate = useCallback((b) => {
    navigation.navigate('CategoryScreen', { category: { id: b.categoryId, name: b.categoryName } });
  }, [navigation]);

  return (
    <View style={[styles.banners, style]}>
      {half ? (
        <View style={styles.bannerRow}>
          {banners.map((b) => (
            <Banner
              key={b.categoryId}
              source={b.source}
              half
              fullWidth={fullWidth}
              halfWidth={halfWidth}
              onPress={() => navigate(b)}
            />
          ))}
        </View>
      ) : (
        banners.map((b) => (
          <Banner
            key={b.categoryId}
            source={b.source}
            fullWidth={fullWidth}
            halfWidth={halfWidth}
            onPress={() => navigate(b)}
          />
        ))
      )}
    </View>
  );
});

const ProductCard = memo(function ProductCard({ item, onPress, onAdd, added, favorited, onToggleFavorite }) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Cover
        source={item.image_url ? { uri: item.image_url } : undefined}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <Card.Content style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardPrice}>{item.price} лв.</Text>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button
          mode={added ? 'contained' : 'outlined'}
          compact
          icon={added ? 'check' : 'cart-plus'}
          buttonColor={added ? theme.colors.primary : undefined}
          textColor={added ? theme.colors.onPrimary : theme.colors.primary}
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
          onPress={onAdd}
        >
          {added ? 'Добавено!' : 'Добави'}
        </Button>
        <IconButton
          icon={favorited ? 'heart' : 'heart-outline'}
          iconColor={theme.colors.notification}
          size={20}
          onPress={onToggleFavorite}
          style={styles.heartButton}
        />
      </Card.Actions>
    </Card>
  );
});

const CategoryRow = memo(function CategoryRow({ category, products, navigation, addToCart, isFavorite, toggleFavorite }) {
  const [addedId, setAddedId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleAdd = useCallback((item) => {
    addToCart(item);
    setAddedId(item.id);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAddedId(null), 1500);
  }, [addToCart]);

  const handlePress = useCallback((item) => {
    navigation.navigate('ProductScreen', { productId: item.id });
  }, [navigation]);

  if (!products || products.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{category.name}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {products.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            added={addedId === item.id}
            favorited={isFavorite(item.id)}
            onPress={() => handlePress(item)}
            onAdd={() => handleAdd(item)}
            onToggleFavorite={() => toggleFavorite(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

export default function HomeScreen({ navigation }) {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { width: screenWidth } = useWindowDimensions();
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const fullWidth = screenWidth - BANNER_PADDING * 2;
  const halfWidth = (fullWidth - BANNER_GAP) / 2;

  useEffect(() => {
    const promises = FEATURED_CATEGORIES.map((cat) =>
      getProducts(token, cat.id, 1)
        .then((data) => {
          const list = data.data || data;
          return { id: cat.id, products: Array.isArray(list) ? list : [] };
        })
        .catch(() => ({ id: cat.id, products: [] })),
    );

    Promise.all([
      getCategories(token)
        .then((data) => {
          const all = data.data || data;
          return Array.isArray(all) ? all.slice(0, 9) : [];
        })
        .catch(() => []),
      ...promises,
    ]).then(([cats, ...results]) => {
      setCategories(cats);
      const map = {};
      results.forEach((r) => { map[r.id] = r.products; });
      setProductsByCategory(map);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <BannerGroup banners={BANNERS} navigation={navigation} fullWidth={fullWidth} halfWidth={halfWidth} style={styles.bannersTop} />

      <CategoryRow category={FEATURED_CATEGORIES[0]} products={productsByCategory[2]} navigation={navigation} addToCart={addToCart} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
      <CategoryRow category={FEATURED_CATEGORIES[1]} products={productsByCategory[3]} navigation={navigation} addToCart={addToCart} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />

      <BannerGroup banners={BANNERS_HALF} navigation={navigation} half fullWidth={fullWidth} halfWidth={halfWidth} style={styles.bannersMiddle} />

      <CategoryRow category={FEATURED_CATEGORIES[2]} products={productsByCategory[14]} navigation={navigation} addToCart={addToCart} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
      <CategoryRow category={FEATURED_CATEGORIES[3]} products={productsByCategory[34]} navigation={navigation} addToCart={addToCart} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />

      <BannerGroup banners={BANNERS_BOTTOM} navigation={navigation} fullWidth={fullWidth} halfWidth={halfWidth} style={styles.bannersMiddle} />

      <CategoryRow category={FEATURED_CATEGORIES[4]} products={productsByCategory[18]} navigation={navigation} addToCart={addToCart} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />

      {categories.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Категории</Text>
          <View style={styles.chipWrap}>
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                icon={() => (
                  <MaterialCommunityIcons
                    name={getCategoryIcon(cat.slug)}
                    size={20}
                    color={theme.colors.notification}
                  />
                )}
                style={styles.chip}
                textStyle={styles.chipText}
                onPress={() => navigation.navigate('CategoryScreen', { category: cat })}
              >
                {cat.name}
              </Chip>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Categories')}
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>Виж всички</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
  },
  banners: {
    paddingHorizontal: BANNER_PADDING,
    gap: BANNER_GAP,
  },
  bannersTop: {
    paddingHorizontal: BANNER_PADDING,
    gap: BANNER_GAP,
    marginTop: 16,
  },
  bannersMiddle: {
    paddingHorizontal: BANNER_PADDING,
    gap: BANNER_GAP,
    marginTop: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    gap: BANNER_GAP,
  },
  bannerImg: {
    borderRadius: 12,
  },
  bannerImgHalf: {
    borderRadius: 12,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  cardImage: {
    height: IMAGE_HEIGHT,
    backgroundColor: '#fff',
  },
  cardContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 0,
  },
  cardName: {
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 36,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  },
  cardActions: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  addButton: {
    flex: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
  },
  addButtonLabel: {
    fontSize: 13,
  },
  heartButton: {
    margin: 0,
  },
  categoriesSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  chip: {
    backgroundColor: theme.colors.surface,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  seeAll: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.text,
    textDecorationLine: 'underline',
  },
});
