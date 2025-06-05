import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { styles } from '../styles/style';
import { useSignupMutation } from '../redux/authApi';
import { traducirErrorFirebase } from '../utils/traduccionesUtil';

const RegisterScreen = () => {
    const db = useSQLiteContext();
    const [nombre, setNombre] = useState(null);
    const [email, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [signup, { isLoading, error }] = useSignupMutation();
    const [mensajeError, setMensajeError] = useState('');
    const passwordRef = useRef(null);
    const emailRef = useRef(null);

    const Registrarse = async () => {
        if (validarCampos()) {
            setMensajeError('Por favor, complete todos los campos.');
            return;
        }
        RegistrarUsuario(); // Registra el usuario
    };

    const RegistrarUsuario = async () => {
        try {
            const emailLowercase = email.toLowerCase(); //guardo el email en minúscula
            const resultSignUp = await signup({ email: emailLowercase, password }); //registro en firebaes

            if (resultSignUp.data) {    //guardo en sqlite el usuario recien creado solo si fue exitoso el registro en firebase
                const result = await db.runAsync(
                    'INSERT INTO usuario (nombre, email) VALUES (?, ?)', nombre, email.toLowerCase());
            } else {
                // Si hubo error, lo mostramos
                console.log(resultSignUp.error);
                const mensaje = traducirErrorFirebase(resultSignUp.error?.data?.message || resultSignUp.error?.error || resultSignUp.error?.message || 'Error desconocido');
                setMensajeError(mensaje);
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
                returnKeyType="go"
                onSubmitEditing={Registrarse}
            />

            <TouchableOpacity
                style={[
                    styles.botonRegistro,
                ]}
                onPress={Registrarse}
            >
                <Text style={styles.botonRegistroText}>Registrarse</Text>
            </TouchableOpacity>
            {mensajeError !== '' && <Text style={styles.error}>{mensajeError}</Text>}
        </View>
    );
};

export default RegisterScreen;