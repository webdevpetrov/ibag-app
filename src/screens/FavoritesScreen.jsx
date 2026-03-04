import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFavorites } from '../context/FavoritesContext';
import Loader from '../components/Loader';
import theme from '../config/theme';

function FavoriteItem({ item, onPress, onRemove }) {
  const product = item.product || item;

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{product.price} лв.</Text>
      </View>
      <IconButton
        icon="heart"
        iconColor={theme.colors.notification}
        size={24}
        onPress={onRemove}
      />
    </TouchableOpacity>
  );
}

export default function FavoritesScreen({ navigation }) {
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  if (isLoading) {
    return <Loader />;
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="heart-outline" size={64} color={theme.colors.disabled} />
        <Text style={styles.emptyText}>Нямате любими продукти</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FavoriteItem
            item={item}
            onPress={() => {
              const productId = item.product?.id ?? item.product_id;
              navigation.navigate('ProductScreen', { productId });
            }}
            onRemove={() => toggleFavorite(item.product || { id: item.product_id })}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  imagePlaceholder: {
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  name: {
    fontSize: 15,
    color: theme.colors.text,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.disabled,
  },
});
