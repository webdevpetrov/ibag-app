import { MD2LightTheme } from 'react-native-paper';

const theme = {
  ...MD2LightTheme,
  colors: {
    ...MD2LightTheme.colors,
    primary: '#138484',
    background: '#F2F2F2',
    surface: '#FFFFFF',
    text: '#111',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: 'rgba(255,255,255,0.6)',
    avatarBackground: '#138484',
    notification: '#f5bf47',
  },
};

export default theme;
