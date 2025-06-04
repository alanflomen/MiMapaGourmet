import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, Pressable, Image } from 'react-native';
import { useLoginMutation } from '../redux/authApi';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/style';
import { useDispatch } from 'react-redux';
import { traducirErrorFirebase } from '../utils/traduccionesUtil';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const navigation = useNavigation();
  const [mensajeError, setMensajeError] = useState('');
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (email && password) {
      try {
        const result = await login({ email, password });
        if (result.data) {
          setMensajeError('');
        } else {
          const mensaje = traducirErrorFirebase(result.error?.data?.message || result.error?.error || result.error?.message || 'Error desconocido');
          setMensajeError(mensaje);
        }
      }
      catch (error) {
        const mensaje = traducirErrorFirebase(error.message);
        setMensajeError(mensaje);
      }

    } else {
      setMensajeError('Por favor, complete todos los campos.');
    }
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
        keyboardType='email-address'
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current.focus()}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.inputLogin}
        placeholderTextColor="#aaaaaa"
        ref={passwordRef}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
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
      {mensajeError !== '' && <Text style={styles.error}>{mensajeError}</Text>}
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