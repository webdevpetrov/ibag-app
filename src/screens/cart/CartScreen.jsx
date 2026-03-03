import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/CartItem';
import theme from '../../config/theme';

export default function CartScreen({ navigation }) {
  const { items, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  function confirmRemove(product) {
    Alert.alert(
      'Премахване',
      `Сигурни ли сте, че искате да премахнете "${product.name}" от количката?`,
      [
        { text: 'Отказ', style: 'cancel' },
        { text: 'Премахни', style: 'destructive', onPress: () => removeFromCart(product.id) },
      ],
    );
  }

  function confirmClear() {
    Alert.alert(
      'Изчистване',
      'Сигурни ли сте, че искате да изчистите цялата количка?',
      [
        { text: 'Отказ', style: 'cancel' },
        { text: 'Изчисти', style: 'destructive', onPress: clearCart },
      ],
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Количката е празна</Text>
        <Text style={styles.emptySubtitle}>Добавете продукти, за да продължите</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.product.id)}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Pressable style={styles.clearLink} onPress={confirmClear}>
              <MaterialCommunityIcons name="close-circle-outline" size={18} color="#111" />
              <Text style={styles.clearLinkText}>Изпразни количката</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onIncrement={() => updateQuantity(item.product.id, item.quantity + 1)}
            onDecrement={() => {
              if (item.quantity > 1) {
                updateQuantity(item.product.id, item.quantity - 1);
              } else {
                confirmRemove(item.product);
              }
            }}
            onRemove={() => confirmRemove(item.product)}
          />
        )}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Общо:</Text>
          <Text style={styles.totalValue}>{cartTotal.toFixed(2)} лв.</Text>
        </View>
        <Button
          mode="contained"
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          style={styles.checkoutButton}
          contentStyle={styles.checkoutContent}
          onPress={() => navigation.navigate('Checkout')}
        >
          Поръчай
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
  listHeader: {
    marginBottom: 8,
  },
  clearLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearLinkText: {
    fontSize: 14,
    color: '#111',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  list: {
    padding: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  checkoutButton: {
    borderRadius: 10,
  },
  checkoutContent: {
    paddingVertical: 6,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
});
