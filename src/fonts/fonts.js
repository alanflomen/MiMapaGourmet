import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    'Livvic-Regular': require('./Livvic-Regular.ttf'),
    'Livvic-Bold': require('./Livvic-Bold.ttf'),
  });
};