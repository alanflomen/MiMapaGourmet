import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, Image, ActivityIndicator, Switch, Alert, Modal,
    Pressable, TouchableOpacity, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DropDownPicker from 'react-native-dropdown-picker';
import { useSelector, useDispatch } from 'react-redux';
import { agregarPlato } from '../redux/slices/platosSlice';
import { CrearPlatoFirebase } from '../services/platosService'; // Servicios Firebase
import { styles } from '../styles/style';
import { auth } from '../firebase/config';

export default function AddPlatoScreen({ onClose }) {
    const categorias = useSelector(state => state.categorias.listaCategorias || []);
    const usuarioId = auth.currentUser ? auth.currentUser.uid : null;
    const dispatch = useDispatch();

    // States de los campos
    const [foto, setFoto] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [notas, setNotas] = useState('');
    const [puntaje, setPuntaje] = useState('');
    const [precio, setPrecio] = useState('');
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [openCategorias, setOpenCategorias] = useState(false);
    const [items, setItems] = useState(
        categorias.map(cat => ({ label: cat.nombre, value: cat.id }))
    );
    const [favorito, setFavorito] = useState(false);
    const [latitud, setLatitud] = useState(null);
    const [longitud, setLongitud] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showExito, setShowExito] = useState(false);
    const [showFotoAmpliada, setShowFotoAmpliada] = useState(false);
    const [errores, setErrores] = useState([]);
    const descripcionRef = useRef(null);
    const notasPersRef = useRef(null);
    const puntajeRef = useRef(null);
    const precioRef = useRef(null);
    const scrollViewRef = useRef(null);

    // Permisos cámara
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

    React.useEffect(() => {
        setItems(categorias.map(cat => ({ label: cat.nombre, value: cat.id })));
    }, [categorias]);

    // Ubicación
    const handleObtenerUbicacion = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLoading(false);
            Alert.alert('Permiso denegado', 'No se pudo obtener la ubicación. Se generó una de manera aleatorea. Por favor, vaya a configuración y active los permisos de ubicación.');
            setLatitud(-34.6037);
            setLongitud(-58.3816);
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setLatitud(location.coords.latitude);
        setLongitud(location.coords.longitude);
        setLoading(false);
    };

    // Tomar/galería
    const pickImage = async (useCamera = false) => {
        let result;
        const hasPermission = await verifyPermissions();
        if (!hasPermission) return;
        if (useCamera) {
            result = await ImagePicker.launchCameraAsync({
                base64: true, quality: 0.1, allowsEditing: true,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                base64: true, quality: 0.1, allowsEditing: true,
            });
        }
        if (!result.canceled && result.assets && result.assets.length) {
            setFoto(result.assets[0].base64);
        }
    };

    // Solo permitir números
    const handleChangePuntaje = (value, setter, decimal = false) => {
        let newValue = value.replace(/[^0-9.]/g, '');
        const parts = newValue.split('.');
        if (parts.length > 2) newValue = parts[0] + '.' + parts[1];
        const num = parseFloat(newValue);
        if (newValue === '' || (num >= 0 && num <= 10)) {
            setter(newValue);
        }
    };
    const handleChangeNumero = (value, setter, decimal = false) => {
        const regex = decimal ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;
        if (regex.test(value)) {
            setter(value);
        }
    };

    // Validación de campos obligatorios
    const validarCampos = () => {
        const nuevosErrores = [];
        if (!titulo.trim()) nuevosErrores.push('El título es obligatorio.');
        if (!foto) nuevosErrores.push('La foto es obligatoria.');
        if (categoriasSeleccionadas.length === 0) nuevosErrores.push('Debes elegir al menos una categoría.');
        // Podés agregar más validaciones si querés (puntaje, precio, etc)
        return nuevosErrores;
    };

    // Guardar plato
    const handleGuardar = async () => {
        const nuevosErrores = validarCampos();
        setErrores(nuevosErrores);
        if (nuevosErrores.length > 0 && scrollViewRef.current) {
            // Scroll al final
            setTimeout(() => {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }, 50); // Un pequeño delay para que se rendericen los errores primero
            return;
        }

        setLoading(true);
        try {
            const nuevoPlato = {
                titulo,
                descripcion,
                notas,
                puntaje: puntaje ? parseFloat(puntaje) : null,
                precio: precio ? parseFloat(precio) : null,
                categoriasIds: categoriasSeleccionadas,
                favorito,
                latitud,
                longitud,
                fechaHora: new Date().toISOString(),
                imagenBase64: foto,
                usuarioId
            };
            const platoGuardado = await CrearPlatoFirebase(nuevoPlato);
            dispatch(agregarPlato(platoGuardado));
            setLoading(false);
            setShowExito(true);
        } catch (err) {
            setLoading(false);
            onClose();
        }
    };

    //Cerrar modal de éxito
    const handleCerrarExito = () => {
        setShowExito(false);
        if (onClose) onClose();
    };

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1, backgroundColor: '#222831' }} ref={scrollViewRef} contentContainerStyle={{ padding: 18, paddingBottom: 30 }}>
                <Text style={styles.tituloPantalla}>Nuevo Plato</Text>

                {/* FOTO */}
                <View style={styles.fotoContainer}>
                    {foto ? (
                        <TouchableOpacity onPress={() => setShowFotoAmpliada(true)}>
                            <Image
                                source={{ uri: 'data:image/jpeg;base64,' + foto }}
                                style={styles.foto}
                            />
                        </TouchableOpacity>
                    ) : (
                        <Text style={{ color: '#999', textAlign: 'center', fontFamily: 'Livvic-Regular' }}>Sin foto{"\n"}(obligatoria)</Text>
                    )}
                </View>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.botonFoto} onPress={() => pickImage(true)}>
                        <Text style={styles.botonFotoText}>Tomar foto 📷</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botonGaleria} onPress={() => pickImage(false)}>
                        <Text style={styles.botonGaleriaText}>Elegir de galería</Text>
                    </TouchableOpacity>
                </View>

                {/* INPUTS CON LABELS */}
                <Text style={styles.labelInput}>Título (obligatorio)</Text>
                <TextInput
                    placeholder="Ej.: Torta Marquisse"
                    value={titulo}
                    placeholderTextColor="#aaaa"
                    onChangeText={setTitulo}
                    style={styles.inputAddPlato}
                    returnKeyType="next"
                    onSubmitEditing={() => descripcionRef.current.focus()}
                />
                <Text style={styles.labelInput}>Descripción</Text>
                <TextInput
                    placeholder="Ej.: Mucho chocolate"
                    value={descripcion}
                    placeholderTextColor="#aaaa"
                    onChangeText={setDescripcion}
                    style={styles.inputAddPlato}
                    returnKeyType="next"
                    ref={descripcionRef}
                    onSubmitEditing={() => notasPersRef.current.focus()}
                />
                <Text style={styles.labelInput}>Notas personales (hasta 200 caract.)</Text>
                <TextInput
                    placeholder="Ej.: La mejor que probé..."
                    placeholderTextColor="#aaaa"
                    value={notas}
                    onChangeText={setNotas}
                    style={styles.inputAddPlato}
                    returnKeyType="next"
                    ref={notasPersRef}
                    multiline={true}
                    numberOfLines={3}
                    maxLength={200}
                    onSubmitEditing={() => puntajeRef.current.focus()}
                />
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 4 }}>
                        <Text style={styles.labelInput}>Puntaje (0-10)</Text>
                        <TextInput
                            placeholder="Ej.: 9.95"
                            placeholderTextColor="#aaaa"
                            value={puntaje}
                            onChangeText={v => handleChangePuntaje(v, setPuntaje, true)}
                            keyboardType="decimal-pad"
                            maxLength={4}
                            style={[styles.inputAddPlato, { flex: 1 }]}
                            returnKeyType="next"
                            onSubmitEditing={() => precioRef.current.focus()}
                            ref={puntajeRef}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 4 }}>
                        <Text style={styles.labelInput}>Precio $</Text>
                        <TextInput
                            placeholder="Ej.: $1500"
                            placeholderTextColor="#aaaa"
                            value={precio}
                            onChangeText={v => handleChangeNumero(v, setPrecio, true)}
                            keyboardType="decimal-pad"
                            maxLength={8}
                            style={[styles.inputAddPlato, { flex: 1 }]}
                            ref={precioRef}
                        />
                    </View>
                </View>

                <Text style={styles.labelInput}>Categorías (obligatorio)</Text>
                <DropDownPicker
                    open={openCategorias}
                    setOpen={setOpenCategorias}
                    items={items}
                    setItems={setItems}
                    multiple={true}
                    value={categoriasSeleccionadas}
                    setValue={setCategoriasSeleccionadas}
                    placeholder="Seleccioná una o más categorías..."
                    mode="BADGE"
                    showBadgeDot={true}
                    searchable={true}
                    searchPlaceholder="Escriba una categoría..."
                    listMode="SCROLLVIEW"
                    maxHeight={240}
                    zIndex={4000}
                    zIndexInverse={1000}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    labelStyle={styles.dropdownLabel}
                    selectedItemLabelStyle={styles.dropdownSelectedLabel}
                    listItemContainerStyle={styles.dropdownListItem}
                    arrowIconStyle={styles.dropdownArrow}
                    badgeColors={["#2066e0"]}
                    dropDownDirection="AUTO"
                />

                <View style={styles.favoritoRow}>
                    <Pressable onPress={() => setFavorito(!favorito)}>
                        <Text style={styles.favoritoLabel}>Favorito</Text>
                    </Pressable>
                    <Switch value={favorito} onValueChange={setFavorito} />
                </View>

                <View style={styles.ubicacionRow}>
                    <TouchableOpacity style={latitud == null && longitud == null ? styles.botonUbicacion : styles.botonUbicacionDeshabilitado} onPress={handleObtenerUbicacion} disabled={latitud != null && longitud != null}>
                        <Text style={styles.botonUbicacionText}>{latitud == null && longitud == null ? "Obtener ubicación actual" : "Ubicación Obtenida"}</Text>
                    </TouchableOpacity>
                </View>

                {/* ERRORES DE VALIDACIÓN */}
                {errores.length > 0 && (
                    <View style={{ marginTop: 12, marginBottom: 4, alignSelf: 'center' }}>
                        {errores.map((err, i) => (
                            <Text key={i} style={{ color: 'red', marginBottom: 2, fontFamily: 'Livvic-Bold' }}>{err}</Text>
                        ))}
                    </View>
                )}

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#2066e0" />
                    </View>
                )}

                {/* MODAL DE ÉXITO */}
                <Modal
                    visible={showExito}
                    transparent
                    animationType="fade"
                    onRequestClose={handleCerrarExito}
                >
                    <View style={styles.exitoBg}>
                        <View style={styles.exitoCard}>
                            <Text style={styles.exitoTitulo}>¡Plato creado!</Text>
                            <Text style={styles.exitoTexto}>El plato fue guardado correctamente.</Text>
                            <TouchableOpacity style={styles.botonOK} onPress={handleCerrarExito}>
                                <Text style={styles.botonOKText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    visible={showFotoAmpliada}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowFotoAmpliada(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPressOut={() => setShowFotoAmpliada(false)}
                        style={styles.fotoModalBg}
                    >
                        <View style={styles.fotoModalContainer}>
                            <TouchableOpacity
                                style={styles.cerrarX}
                                onPress={() => setShowFotoAmpliada(false)}
                            >
                                <Text style={{ fontSize: 32, color: '#c00', fontWeight: 'bold' }}>×</Text>
                            </TouchableOpacity>
                            <Image
                                source={{ uri: 'data:image/jpeg;base64,' + foto }}
                                style={styles.fotoAmpliada}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>

            </ScrollView>
            <View style={styles.accionesRow}>
                <TouchableOpacity style={styles.botonSecundario} onPress={onClose}>
                    <Text style={styles.botonSecundarioText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonPrimario} onPress={handleGuardar}>
                    <Text style={styles.botonPrimarioText}>Guardar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
