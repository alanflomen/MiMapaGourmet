import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import { cambiarEstado, cambiarEmail } from '../redux/slices/loginSlice';
import { useSQLiteContext } from 'expo-sqlite';
import { styles } from '../styles/style';
import { useSignupMutation } from '../redux/authApi';
import { traducirErrorFirebase } from '../utils/traduccionesUtil';

const RegisterScreen = () => {
    const dispatch = useDispatch();
    const db = useSQLiteContext();
    const [nombre, setNombre] = useState(null);
    const [email, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [signup, { isLoading, error }] = useSignupMutation();
    const [mensajeError, setMensajeError] = useState('');

    const Registrarse = async () => {
        if (validarCampos()) {
            error = "Por favor, complete todos los campos.";
            return
        }
        if (!esEmailValido(email)) {
            Alert.alert("Por favor, ingrese un email válido.");
            return;
        }
        RegistrarUsuario(); // Registra el usuario
    };

    const esEmailValido = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const RegistrarUsuario = async () => {
        try {
            const emailLowercase = email.toLowerCase();
            console.log("Email en minúsculas:", emailLowercase);
            console.log("Contraseña:", password);
            const resultSignUp = await signup({ email: emailLowercase, password });

            if (resultSignUp.data) {
                const result = await db.runAsync(
                    'INSERT INTO usuario (nombre, email) VALUES (?, ?)', nombre, email.toLowerCase());
                dispatch(cambiarEstado()); // Cambiar el estado de logueado en Redux
                dispatch(cambiarEmail(email.toLowerCase())); // Cambiar el email en Redux
            } else {
                // Si hubo error, lo mostramos
                console.log(resultSignUp.error);
                const mensaje = traducirErrorFirebase(resultSignUp.error?.data?.message || resultSignUp.error?.error || resultSignUp.error?.message || 'Error desconocido');
                setMensajeError(mensaje);
                //Alert.alert('Error', 'No se pudo registrar. Intenta con otro email.');
            }

        }
        catch (error) {
            console.error("Error al registrar el usuario:", error.message);
            const mensaje = traducirErrorFirebase(error.message || 'Error desconocido');
            setMensajeError(mensaje);
        }
    };
    const validarCampos = () => {
        return !nombre || !password || !email;
    };
    return (
        <View style={styles.containerRegister}>
            <Text style={styles.title}>
                ¡Bienvenid@!{"\n"}Complete todos los campos
            </Text>

            <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={styles.inputRegister}
                placeholderTextColor="#aaaaaa"
            />

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setMail}
                style={styles.inputRegister}
                keyboardType="email-address"
                placeholderTextColor="#aaaaaa"
            />
            <TextInput
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.inputRegister}
                placeholderTextColor="#aaaaaa"
            />

            <TouchableOpacity
                style={[
                    styles.botonRegistro,
                    validarCampos() && { opacity: 0.6 }
                ]}
                onPress={Registrarse}
                disabled={validarCampos()}
            >
                <Text style={styles.botonRegistroText}>Registrarse</Text>
            </TouchableOpacity>
            {mensajeError !== '' && <Text style={styles.error}>{mensajeError}</Text>}
        </View>
    );
};

export default RegisterScreen;