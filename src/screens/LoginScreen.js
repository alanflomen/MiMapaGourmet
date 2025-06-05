import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, Pressable, Image } from 'react-native';
import { useLoginMutation } from '../redux/authApi';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/style';
import { traducirErrorFirebase } from '../utils/traduccionesUtil';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const navigation = useNavigation();
  const [mensajeError, setMensajeError] = useState('');
  const passwordRef = useRef(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleLogin = async () => { //llamo al login
    if (email && password) { //si existen email y password
      try {
        const result = await login({ email, password }); //si es exitoso, se actualiza el auth, cambia el estado y muestra Main
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

  const navigateARegister = async () => { // Navega a la pantalla de registro
    navigation.navigate('Registrarse')
  };

   // Estilo para el icono adentro del input, bien centrado
    const btnVer = {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        paddingBottom: 15,
        paddingRight: 5,
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
      <View style={{ position: 'relative', marginBottom: 8 }}>
        <TextInput
          placeholder="Contraseña"
          secureTextEntry={!showPasswords}
          value={password}
          onChangeText={setPassword}
          style={styles.inputLogin}
          placeholderTextColor="#aaaaaa"
          ref={passwordRef}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity
          style={btnVer}
          onPress={() => setShowPasswords(x => !x)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={showPasswords ? "eye-off-outline" : "eye-outline"}
            size={24}
            color={'#aaaaaa'}
          />
        </TouchableOpacity>
      </View>
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