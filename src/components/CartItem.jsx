import { View, Text, Image, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import theme from '../config/theme';

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  const { product, quantity } = item;
  return (
    <View style={styles.item}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.imagePlaceholder]} />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.itemPrice}>{product.price} лв.</Text>
        <View style={styles.quantityRow}>
          <IconButton
            icon="minus"
            size={18}
            mode="outlined"
            style={styles.qtyButton}
            onPress={onDecrement}
          />
          <Text style={styles.quantityText}>{quantity}</Text>
          <IconButton
            icon="plus"
            size={18}
            mode="outlined"
            style={styles.qtyButton}
            onPress={onIncrement}
          />
          <IconButton
            icon="close"
            size={20}
            iconColor="#999"
            style={styles.removeButton}
            onPress={onRemove}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 10,
    padding: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    backgroundColor: '#eee',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  qtyButton: {
    margin: 0,
    width: 30,
    height: 30,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 28,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 'auto',
    margin: 0,
  },
});
