import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const SinRegistrarTabNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Registrarse"
        component={RegisterScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#222831', // El mismo fondo que toda la app
            elevation: 0, // Para Android, elimina sombra
            shadowOpacity: 0, // Para iOS, elimina sombra
          },
          headerTitleStyle: {
            color: '#00adb5', // Color del título (turquesa neón)
            fontFamily: 'Livvic-Bold',
            
          },
          headerTintColor: '#00adb5', // Color del ícono de "volver" o texto de back
        }}
      />

    </Stack.Navigator>

  );
};

export default SinRegistrarTabNavigator;