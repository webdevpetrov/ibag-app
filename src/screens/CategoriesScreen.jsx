import { FlatList, View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import theme from '../config/theme';

const categories = [
  { id: 1, name: 'Плодове и зеленчуци', icon: 'fruit-watermelon' },
  { id: 2, name: 'Месо и риба', icon: 'food-steak' },
  { id: 3, name: 'Млечни и яйца', icon: 'cheese' },
  { id: 4, name: 'Колбаси и деликатеси', icon: 'sausage' },
  { id: 5, name: 'Бистро', icon: 'bowl-mix' },
  { id: 6, name: 'Пекарна', icon: 'bread-slice' },
  { id: 7, name: 'Био', icon: 'sprout' },
  { id: 8, name: 'Фермерски пазар', icon: 'basket' },
  { id: 9, name: 'Специални храни', icon: 'food-apple' },
  { id: 10, name: 'Замразени храни', icon: 'snowflake' },
  { id: 11, name: 'Основни храни и консерви', icon: 'pasta' },
  { id: 12, name: 'Сладко и солено', icon: 'candy' },
  { id: 13, name: 'Напитки', icon: 'bottle-soda' },
  { id: 14, name: 'За бебето и детето', icon: 'baby-bottle-outline' },
  { id: 15, name: 'Други', icon: 'food-apple' },
];

export default function CategoriesScreen() {
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={categories}
      numColumns={2}
      columnWrapperStyle={styles.row}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <MaterialCommunityIcons
            name={item.icon}
            size={37}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.label}>{item.name}</Text>
        </View>
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
});
