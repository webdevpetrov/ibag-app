import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import theme from '../config/theme';

export default function ProductRow({ product, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{product.price} лв.</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  },
});
