import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, Image, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/style';
import { auth } from '../firebase/config';

export default function ProfileScreen() {
    const [foto, setFoto] = useState("");
    const [nombre, setNombre] = useState("");
    const emailActual = auth.currentUser?.email || '';
    const db = useSQLiteContext();
    const [btnGuardarDeshabilitado, setBtnGuardarDeshabilitado] = useState(false);
    const [nombreOriginal, setNombreOriginal] = useState("");
    const [fotoOriginal, setFotoOriginal] = useState("");

    const verifyPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permisos insuficientes',
                'Necesitamos permisos para usar la cámara.',
                [{ text: 'Ok' }]
            );
            return false;
        }
        return true;
    };

    const pickImage = async (useCamera = false) => {
        let result;
        const hasPermission = await verifyPermissions();
        if (!hasPermission) return;

        if (useCamera) {
            result = await ImagePicker.launchCameraAsync({
                base64: true,
                quality: 0.1,
                allowsEditing: true,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                base64: true,
                quality: 0.1,
                allowsEditing: true,
            });
        }
        if (!result.canceled && result.assets && result.assets.length) {
            setFoto(result.assets[0].base64);
            setBtnGuardarDeshabilitado(false);
        }
    };

    useEffect(() => {
        async function setup() {
            try {
                const emailAuth = auth.currentUser?.email || '';
                if (!emailAuth) return;
                //busco al usuario en sqllite, esto lo hago asi porque las rubicas pedian usarlo
                //y cargo la foto, nombre y mail localmente
                const result = await db.getFirstAsync('SELECT * FROM usuario where email = ?', emailAuth);
                if (result) {
                    setNombre(result.nombre || "");
                    setFoto(result.fotoBase64 || "");
                    setNombreOriginal(result.nombre || "");
                    setFotoOriginal(result.fotoBase64 || "");
                } else {
                    console.log("No se encontró el usuario en la base de datos.");
                }
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        }
        setup();
    }, []);
    const guardarCambios = async () => {
        try {
            await db.runAsync(
                'UPDATE usuario SET nombre = ?, email = ?, fotoBase64 = ? WHERE email = ?;',
                nombre, emailActual.toLowerCase(), foto, emailActual.toLowerCase()
            );
            // Actualiza los valores originales para deshabilitar el botón
            setNombreOriginal(nombre);
            setFotoOriginal(foto);
            setBtnGuardarDeshabilitado(true);
            Alert.alert("¡Éxito!", "Datos actualizados correctamente.");
        }
        catch (error) {
            console.error("Error al modificar el usuario:", error);
        }
    };

    const hayCambios = () => {
        //Valido que el Nombre no este vacío
        if (nombre.trim().length == 0)
            return true;
        // Si alguno es diferente, habilita guardar
        return (
            nombre !== nombreOriginal ||
            foto !== fotoOriginal
        ) ? false : true; // true para deshabilitar, false para habilitar xq es un disabled
    };
    const CerrarSesion = async () => {
        try {
            auth.signOut()
        }
        catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    }

    return (
        <View style={styles.container}>
            {nombre ?
                <Text style={styles.tituloPantalla}>Hola, {nombre}!</Text>
                :
                <Text style={styles.tituloPantalla}>  Hola!{"\n"}Por favor, completá tu nombre!
                </Text>}

            <View style={styles.fotoContainer}>
                {foto ? (
                    <Image
                        source={{ uri: 'data:image/jpeg;base64,' + foto }}
                        style={styles.foto}
                    />
                ) : (
                    <Text style={{ color: '#999' }}>Sin foto</Text>
                )}
            </View>
            <View style={styles.row}>
                <TouchableOpacity style={styles.botonFoto} onPress={() => pickImage(true)}>
                    <Text style={styles.botonFotoText}>{foto ? "Cambiar foto  📷" : "Tomar foto 📷"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonGaleria} onPress={() => pickImage(false)}>
                    <Text style={styles.botonGaleriaText}>Elegir otra de galería</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
                placeholderTextColor="#aaaaaa"
            />

            <TextInput
                placeholder="Email"
                value={emailActual}
                style={styles.input}
                keyboardType="email-address"
                placeholderTextColor="#aaaaaa"
                editable={false} //por ahora el mail no lo va a poder editar
            />


            <View style={styles.accionesRow}>
                <TouchableOpacity style={styles.botonGuardar} onPress={guardarCambios} disabled={hayCambios()}>
                    <Text style={styles.botonGuardarText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonCerrarSesion} onPress={CerrarSesion}>
                    <Text style={styles.botonCerrarSesionText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

