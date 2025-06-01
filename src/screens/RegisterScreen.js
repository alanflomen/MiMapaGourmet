import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { cambiarEstado, cambiarEmail } from '../redux/slices/loginSlice';
import { useSQLiteContext } from 'expo-sqlite';
import { styles } from '../styles/style';

const RegisterScreen = () => {
    const dispatch = useDispatch();
    const db = useSQLiteContext();
    const [nombre, setNombre] = useState(null);
    const [email, setMail] = useState("");

    const Registrarse = async () => {
        //console.log(email);
        if (!esEmailValido(email)) {
            Alert.alert("Por favor, ingrese un email válido.");
            return;
        }
        RegistrarUsuario(); // Registra el usuario en SQLite
        dispatch(cambiarEstado()); // Cambiar el estado de logueado en Redux
        dispatch(cambiarEmail(email.toLowerCase())); // Cambiar el email en Redux
    };

    const esEmailValido = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const RegistrarUsuario = async () => {
        try {
            const result = await db.runAsync(
                'INSERT INTO usuario (nombre, email) VALUES (?, ?)', nombre, email.toLowerCase());
        }
        catch (error) {
            console.error("Error al registrar el usuario:", error);
        }
    };
    const validarCampos = () => {
        return !nombre || !email;
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
        </View>
    );
};

export default RegisterScreen;