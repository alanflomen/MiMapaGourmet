import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    ActivityIndicator,
    Switch,
    Alert,
    Modal,
    Pressable,
    TouchableOpacity
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DropDownPicker from 'react-native-dropdown-picker';
import { useSelector, useDispatch } from 'react-redux';
import { agregarPlato } from '../redux/slices/platosSlice';
import { CrearPlatoFirebase } from '../services/platosService'; // Servicios Firebase
import { styles } from '../styles/style';


export default function AddPlatoScreen({ onClose }) {
    const categorias = useSelector(state => state.categorias.listaCategorias || []);
    const usuarioId = 1; //useSelector(state => state.usuario.id); // ajustá el path según tu store
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

    // Si cambian las categorías, actualiza el dropdown
    React.useEffect(() => {
        setItems(categorias.map(cat => ({ label: cat.nombre, value: cat.id })));
    }, [categorias]);

    // Obtener ubicación actual
    const handleObtenerUbicacion = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLoading(false);
            Alert.alert('Permiso denegado', 'No se pudo obtener la ubicación. Se generó una de manera aleatorea. Por favor, vaya a configuración y active los permisos de ubicación.');
            setLatitud(-34.6037); // Buenos Aires
            setLongitud(-58.3816); // Buenos Aires
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setLatitud(location.coords.latitude);
        setLongitud(location.coords.longitude);
        setLoading(false);
    };

    // Tomar foto o elegir de galería
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
        }
    };

    // Validación: solo si título, foto y al menos una categoría
    const puedeGuardar = titulo.trim().length > 0 && foto && categoriasSeleccionadas.length > 0;

    // Solo permitir números en puntaje y precio
    const handleChangePuntaje = (value, setter, decimal = false) => {
        let newValue = value.replace(/[^0-9.]/g, ''); // Solo deja números y punto
        // Si hay más de un punto decimal, lo limpia
        const parts = newValue.split('.');
        if (parts.length > 2) newValue = parts[0] + '.' + parts[1];

        // Validar rango (0 a 10)
        const num = parseFloat(newValue);
        if (
            newValue === '' ||
            (num >= 0 && num <= 10)
        ) {
            setter(newValue);
        }
        // Si el usuario intenta poner negativo o >10, no deja escribir el numero
    };

    const handleChangeNumero = (value, setter, decimal = false) => {
        // Solo números (y punto si es decimal)
        const regex = decimal ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;
        if (regex.test(value)) {
            setter(value);
        }
    };


    // Guardar plato
    const handleGuardar = async () => {
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
            console.log('Error', err);
            onClose(); // Cerrar el modal o pantalla
        };
    }

    //Cerrar modal de éxito
    const handleCerrarExito = () => {
        setShowExito(false);
        // Llamá a onClose para cerrar ambos modales
        if (onClose) onClose();
    };

    return (
        <View style={styles.container}>
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
                    <Text style={{ color: '#999' }}>Sin foto</Text>
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

            <TextInput
                placeholder="Título (obligatorio)"
                value={titulo}
                onChangeText={setTitulo}
                style={styles.inputAddPlato}
            />
            <TextInput
                placeholder="Descripción"
                value={descripcion}
                onChangeText={setDescripcion}
                style={styles.inputAddPlato}
            />
            <TextInput
                placeholder="Notas personales"
                value={notas}
                onChangeText={setNotas}
                style={styles.inputAddPlato}
            />

            <View style={styles.row}>
                <TextInput
                    placeholder="Puntaje (0-10)"
                    value={puntaje}
                    onChangeText={v => handleChangePuntaje(v, setPuntaje, true)}
                    keyboardType="decimal-pad"
                    maxLength={4}
                    style={[styles.inputAddPlato, { flex: 1 }]}
                />
                <TextInput
                    placeholder="Precio $"
                    value={precio}
                    onChangeText={v => handleChangeNumero(v, setPrecio, true)}
                    keyboardType="decimal-pad"
                    maxLength={8}
                    style={[styles.inputAddPlato, { flex: 1 }]}
                />
            </View>

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
                <Pressable onPress={!favorito ? () => setFavorito(true) : () => setFavorito(false)}>
                    <Text style={styles.favoritoLabel}>Favorito</Text>
                </Pressable>
                <Switch value={favorito} onValueChange={setFavorito} />
            </View>

            <View style={styles.ubicacionRow}>
                <TouchableOpacity style={latitud == null && longitud == null ? styles.botonUbicacion : styles.botonUbicacionDeshabilitado} onPress={handleObtenerUbicacion} disabled={latitud != null && longitud != null}>
                    <Text style={styles.botonUbicacionText}>{latitud == null && longitud == null ? "Obtener ubicación actual" : "Ubicación Obtenida"}</Text>
                </TouchableOpacity>
                {/* <Text style={styles.ubicacionText}>
          {latitud && longitud ? `(${latitud.toFixed(5)}, ${longitud.toFixed(5)})` : ''}
        </Text> */}
            </View>

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


            <View style={styles.accionesRow}>
                <TouchableOpacity style={styles.botonSecundario} onPress={onClose}>
                    <Text style={styles.botonSecundarioText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={!puedeGuardar || loading ? styles.botonPrimarioDisabled : styles.botonPrimario} onPress={handleGuardar} disabled={!puedeGuardar || loading}>
                    <Text style={styles.botonPrimarioText}>Guardar</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}


