import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { TextInput as PaperInput, Button, ActivityIndicator } from 'react-native-paper';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import theme from '../../config/theme';
import { formatAddress } from '../../utils/address';

export default function CheckoutScreen({ navigation }) {
  const { items, cartTotal, clearCart } = useCart();
  const { token } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getAddresses(token);
        const list = data.data ?? data;
        setAddresses(list);
        const defaultAddr = list.find((a) => a.is_default) ?? list[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch {
      } finally {
        setLoadingAddresses(false);
      }
    })();
  }, [token]);

  async function handleSubmit() {
    setErrors({});

    if (!selectedAddressId) {
      setErrors({ address_id: ['Моля, изберете адрес за доставка.'] });
      return;
    }

    setSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const data = await api.createOrder(token, {
        address_id: selectedAddressId,
        notes,
        items: orderItems,
      });

      clearCart();
      navigation.replace('OrderConfirmation', { order: data.data ?? data });
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length > 0) {
        setErrors(err.errors);
      } else {
        Alert.alert('Грешка', err.message || 'Нещо се обърка.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text style={styles.sectionTitle}>Адрес за доставка</Text>

        {loadingAddresses ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
        ) : addresses.length === 0 ? (
          <View style={styles.noAddress}>
            <Text style={styles.noAddressText}>Нямате запазени адреси.</Text>
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => navigation.navigate('Home', { screen: 'ProfileNav', params: { screen: 'AddressForm' } })}
              textColor={theme.colors.primary}
              style={styles.addAddressButton}
            >
              Добави адрес
            </Button>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;
              return (
                <Pressable
                  key={addr.id}
                  style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                  onPress={() => setSelectedAddressId(addr.id)}
                >
                  <View style={styles.addressRadio}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.addressContent}>
                    <Text style={styles.addressLabel}>{addr.label || 'Адрес'}</Text>
                    <Text style={styles.addressText} numberOfLines={2}>{formatAddress(addr)}</Text>
                    <Text style={styles.addressContact}>
                      {addr.contact_name} • {addr.contact_phone}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
        {errors.address_id && <Text style={styles.error}>{errors.address_id[0]}</Text>}

        <PaperInput
          label="Бележки"
          mode="outlined"
          value={notes}
          onChangeText={setNotes}
          placeholder="Допълнителни бележки (по желание)"
          multiline
          numberOfLines={3}
          autoCorrect={false}
          style={[styles.paperInput, { marginTop: 20 }]}
        />
        {errors.notes && <Text style={styles.error}>{errors.notes[0]}</Text>}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Резюме на поръчката</Text>

        {items.map((item) => {
          const lineTotal = (parseFloat(item.product.price) * item.quantity).toFixed(2);
          return (
            <View key={item.product.id} style={styles.summaryItem}>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.summaryQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.summaryPrice}>{lineTotal} лв.</Text>
            </View>
          );
        })}

        <View style={styles.footerInner}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Общо:</Text>
            <Text style={styles.totalValue}>{cartTotal.toFixed(2)} лв.</Text>
          </View>
          {errors.items && <Text style={styles.error}>{errors.items[0]}</Text>}
          <Button
            mode="contained"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            style={styles.submitButton}
            contentStyle={styles.submitContent}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            Потвърди поръчката
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  paperInput: {
    backgroundColor: theme.colors.surface,
  },
  error: {
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 4,
  },
  loader: {
    marginVertical: 16,
  },
  noAddress: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  noAddressText: {
    fontSize: 15,
    color: '#999',
  },
  addAddressButton: {
    borderColor: theme.colors.primary,
  },
  addressList: {
    gap: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#eee',
  },
  addressCardSelected: {
    borderColor: theme.colors.primary,
  },
  addressRadio: {
    marginRight: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  addressContact: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  summaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  summaryName: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  summaryQty: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  summaryPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  footerInner: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  submitButton: {
    borderRadius: 10,
  },
  submitContent: {
    paddingVertical: 6,
  },
});
