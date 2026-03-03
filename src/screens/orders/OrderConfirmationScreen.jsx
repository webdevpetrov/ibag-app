import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { CommonActions } from '@react-navigation/native';
import theme from '../../config/theme';
import { formatAddress } from '../../utils/address';

export default function OrderConfirmationScreen({ route, navigation }) {
  const { order } = route.params;

  function goHome() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'CartScreen' }],
      }),
    );
    navigation.getParent()?.navigate('Home');
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="check-circle" size={72} color={theme.colors.primary} />

      <Text style={styles.title}>Поръчката е приета!</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Номер:</Text>
          <Text style={styles.value}>#{order.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Статус:</Text>
          <Text style={styles.status}>Изчакваща</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Обща сума:</Text>
          <Text style={styles.value}>{parseFloat(order.total).toFixed(2)} лв.</Text>
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={styles.label}>Адрес:</Text>
          <Text style={[styles.value, styles.addressValue]}>{formatAddress(order.address)}</Text>
        </View>
      </View>

      <Button
        mode="contained"
        buttonColor={theme.colors.primary}
        textColor={theme.colors.onPrimary}
        style={styles.button}
        contentStyle={styles.buttonContent}
        onPress={goHome}
      >
        Към начало
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 15,
    color: '#666',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addressValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  status: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e8a317',
  },
  button: {
    borderRadius: 10,
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 6,
  },
});
