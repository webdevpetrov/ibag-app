import { View, Text, StyleSheet } from 'react-native';
import theme from '../config/theme';

export default function Logo() {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.text}>iBag</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pill: {
    width: 100,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '400',
  },
});
