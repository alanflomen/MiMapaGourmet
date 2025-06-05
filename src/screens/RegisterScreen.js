import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { styles } from '../styles/style';
import { useSignupMutation } from '../redux/authApi';
import { traducirErrorFirebase } from '../utils/traduccionesUtil';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = () => {
    const db = useSQLiteContext();
    const [nombre, setNombre] = useState(null);
    const [email, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
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
            const emailLowercase = email.toLowerCase();  //guardo el email en minúscula
            const resultSignUp = await signup({ email: emailLowercase, password }); //registro en firebaes

            if (resultSignUp.data) { //guardo en sqlite el usuario recien creado solo si fue exitoso el registro en firebase
                await db.runAsync(
                    'INSERT INTO usuario (nombre, email) VALUES (?, ?)', nombre, emailLowercase);
            } else {
                const mensaje = traducirErrorFirebase(resultSignUp.error?.data?.message || resultSignUp.error?.error || resultSignUp.error?.message || 'Error desconocido');
                setMensajeError(mensaje);
            }
        }
        catch (error) {
            const mensaje = traducirErrorFirebase(error.message || 'Error desconocido');
            setMensajeError(mensaje);
        }
    };

    const validarCampos = () => {
        if (!nombre || !password || !email || !password2) {
            return 'Por favor, complete todos los campos.';
        }
        if (password !== password2) {
            return 'Las contraseñas no coinciden.';
        }
        return '';
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
                placeholder="E-mail"
                value={email}
                onChangeText={setMail}
                style={styles.inputRegister}
                keyboardType="email-address"
                placeholderTextColor="#aaaaaa"
                ref={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
            />

            {/* Campo contraseña */}
            <View style={{ position: 'relative', marginBottom: 8 }}>
                <TextInput
                    placeholder="Contraseña"
                    secureTextEntry={!showPasswords}
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.inputRegister, { paddingRight: 38 }]}
                    placeholderTextColor="#aaaaaa"
                    ref={passwordRef}
                    returnKeyType="next"
                    onSubmitEditing={() => password2Ref.current.focus()}
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

            {/* Campo repetir contraseña */}
            <View style={{ position: 'relative', marginBottom: 8 }}>
                <TextInput
                    placeholder="Repetir contraseña"
                    secureTextEntry={!showPasswords}
                    value={password2}
                    onChangeText={setPassword2}
                    style={[styles.inputRegister, { paddingRight: 38 }]}
                    placeholderTextColor="#aaaaaa"
                    ref={password2Ref}
                    returnKeyType="go"
                    onSubmitEditing={Registrarse}
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
                style={[styles.botonRegistro, isLoading && { opacity: 0.6 }]}
                onPress={Registrarse}
                disabled={isLoading}
            >
                <Text style={styles.botonRegistroText}>
                    {isLoading ? "Registrando..." : "Registrarse"}
                </Text>
            </TouchableOpacity>

            {mensajeError !== '' && <Text style={styles.error}>{mensajeError}</Text>}
        </View>
    );
};

export default RegisterScreen;