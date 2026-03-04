import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import theme from '../config/theme';

export default function CartItem({ item, onIncrement, onDecrement, onRemove, onPress }) {
  const { product, quantity } = item;
  return (
    <Pressable style={styles.item} onPress={onPress}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.imagePlaceholder]} />
      )}
      <View style={styles.itemInfo}>
        <View style={styles.topRow}>
          <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
          <Pressable onPress={onRemove} hitSlop={8}>
            <MaterialCommunityIcons name="close" size={20} color="#999" />
          </Pressable>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.quantityRow}>
            <Pressable style={styles.qtyButtonOutlined} onPress={onDecrement}>
              <MaterialCommunityIcons name="minus" size={20} color={theme.colors.text} />
            </Pressable>
            <View style={styles.qtyBox}>
              <Text style={styles.quantityText}>{quantity}</Text>
            </View>
            <Text style={styles.unitText}>бр.</Text>
            <Pressable style={styles.qtyButton} onPress={onIncrement}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.itemPrice}>{product.price} лв.</Text>
        </View>
      </View>
    </Pressable>
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
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonOutlined: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.text,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBox: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  unitText: {
    fontSize: 14,
    color: '#999',
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});
