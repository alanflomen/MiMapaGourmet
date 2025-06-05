import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, } from 'react-native';
import { useDispatch } from 'react-redux';
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
    const [password2, setPassword2] = useState("");
    const [signup, { isLoading, error }] = useSignupMutation();
    const [mensajeError, setMensajeError] = useState('');
    const passwordRef = useRef(null);
    const password2Ref = useRef(null);
    const emailRef = useRef(null);

    const Registrarse = async () => {
        const errorMsg = validarCampos();
        if (errorMsg) {
            setMensajeError(errorMsg);
            return;
        }
        setMensajeError('');
        RegistrarUsuario(); // Registra el usuario
    };

    const RegistrarUsuario = async () => {
        try {
            const emailLowercase = email.toLowerCase();
            const resultSignUp = await signup({ email: emailLowercase, password });

            if (resultSignUp.data) {
                await db.runAsync(
                    'INSERT INTO usuario (nombre, email) VALUES (?, ?)', nombre, emailLowercase);
            } else {
                // Si hubo error, lo mostramos
                const mensaje = traducirErrorFirebase(resultSignUp.error?.data?.message || resultSignUp.error?.error || resultSignUp.error?.message || 'Error desconocido');
                setMensajeError(mensaje);
            }
        }
        catch (error) {
            const mensaje = traducirErrorFirebase(error.message || 'Error desconocido');
            setMensajeError(mensaje);
        }
    };

    // Devuelve string con el mensaje de error o '' si todo OK
    const validarCampos = () => {
        if (!nombre || !password || !email || !password2) {
            return 'Por favor, complete todos los campos.';
        }
        if (password !== password2) {
            return 'Las contraseñas no coinciden.';
        }
        return '';
    };

    return (
        <View style={styles.containerRegister}>
            <Text style={styles.title}>
                ¡Bienvenid@!{"\n"}Completá todos los campos
            </Text>

            <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={styles.inputRegister}
                placeholderTextColor="#aaaaaa"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current.focus()}
            />

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setMail}
                style={styles.inputRegister}
                keyboardType="email-address"
                placeholderTextColor="#aaaaaa"
                ref={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
            />

            <TextInput
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.inputRegister}
                placeholderTextColor="#aaaaaa"
                ref={passwordRef}
                returnKeyType="next"
                onSubmitEditing={() => password2Ref.current.focus()}
            />

            <TextInput
                placeholder="Repetir contraseña"
                secureTextEntry
                value={password2}
                onChangeText={setPassword2}
                style={styles.inputRegister}
                placeholderTextColor="#aaaaaa"
                ref={password2Ref}
                returnKeyType="go"
                onSubmitEditing={Registrarse}
            />

            <TouchableOpacity
                style={styles.botonRegistro}
                onPress={Registrarse}
            >
                <Text style={styles.botonRegistroText}>Registrarse</Text>
            </TouchableOpacity>
            {mensajeError !== '' && <Text style={styles.error}>{mensajeError}</Text>}
        </View>
    );
};

export default RegisterScreen;