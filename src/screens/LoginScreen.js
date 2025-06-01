import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Pressable, Image } from 'react-native';
import { useLoginMutation } from '../redux/authApi';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/style';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const navigation = useNavigation();

  const handleLogin = async () => {
    // if (email && password) {
    //   await login({ email, password });
    // }
  };
  const navigateARegister = async () => {
    navigation.navigate('Registrarse')
  };

  return (
    <View style={styles.containerLogin}>
      <Image
        source={require('../images/logo.png')}
        resizeMode="contain"
        style={styles.imageLogin}></Image>
      <Text style={styles.titleLogin}>Iniciar sesión</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.inputLogin}
        autoCapitalize="none"
        placeholderTextColor="#aaaaaa"
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.inputLogin}
        placeholderTextColor="#aaaaaa"
      />
      <TouchableOpacity
        style={styles.botonLogin}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.botonLoginText}>
          {isLoading ? "Ingresando..." : "Ingresar"}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Pressable onPress={navigateARegister}>
        {({ pressed }) => (
          <Text
            style={[
              styles.linkRegistrarse,
              pressed && { color: '#ffb347' } // Naranja pastel solo cuando está presionado
            ]}
          >
            ¿No tienes cuenta? Regístrate aquí
          </Text>
        )}
      </Pressable>
    </View>
  );
}