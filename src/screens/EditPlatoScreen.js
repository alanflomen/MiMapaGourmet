import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Image, TouchableOpacity,
    Modal, Pressable, ActivityIndicator, Switch, Alert, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DropDownPicker from 'react-native-dropdown-picker';
import { useSelector, useDispatch } from 'react-redux';
import { editarPlato, eliminarPlato } from '../redux/slices/platosSlice';
import { actualizarPlato, borrarPlato } from '../services/platosService'; // Servicios Firebase
import { styles } from '../styles/style';

export default function EditPlatoScreen({ plato, onClose }) {
    const categorias = useSelector(state => state.categorias.listaCategorias || []);
    const dispatch = useDispatch();

    // Estados iniciales con datos del plato recibido
    const [foto, setFoto] = useState(plato.imagenBase64);
    const [titulo, setTitulo] = useState(plato.titulo || '');
    const [descripcion, setDescripcion] = useState(plato.descripcion || '');
    const [notas, setNotas] = useState(plato.notas || '');
    const [puntaje, setPuntaje] = useState(plato.puntaje ? String(plato.puntaje) : '');
    const [precio, setPrecio] = useState(plato.precio ? String(plato.precio) : '');
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState(plato.categoriasIds || []);
    const [openCategorias, setOpenCategorias] = useState(false);
    const [items, setItems] = useState(categorias.map(cat => ({ label: cat.nombre, value: cat.id })));
    const [favorito, setFavorito] = useState(!!plato.favorito);
    const [latitud, setLatitud] = useState(plato.latitud);
    const [longitud, setLongitud] = useState(plato.longitud);
    const [loading, setLoading] = useState(false);
    const [showExito, setShowExito] = useState(false);
    const [showEliminar, setShowEliminar] = useState(false);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitud},${longitud}&key=AIzaSyBIvpR_Lbz-a9RC__LXgIvR4ofZwfHGDbM`;
    const [direccion, setDireccion] = useState("");
    const [showFotoAmpliada, setShowFotoAmpliada] = useState(false);

    useEffect(() => {
        async function fetchDireccion() {
            const dir = await ObtenerDireccion(latitud, longitud);
            setDireccion(dir);
        }
        if (latitud && longitud) {
            fetchDireccion();
        }
    }, [latitud, longitud]);
    const ObtenerDireccion = async () => {
        try {
            const response = await fetch(
                url
            );
            const data = await response.json();
            return data.results[0].formatted_address || "Dirección no encontrada";
        } catch (error) {
            return "Error al obtener dirección";
        }


    }

    // Si cambian las categorías, actualiza el dropdown
    useEffect(() => {
        setItems(categorias.map(cat => ({ label: cat.nombre, value: cat.id })));
    }, [categorias]);

    // Permitir solo números en puntaje y precio
    const handleChangeNumero = (value, setter, decimal = false) => {
        const regex = decimal ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;
        if (regex.test(value)) setter(value);
    };

    // Foto nueva
    const pickImage = async (useCamera = false) => {
        let result;
        if (useCamera) {
            result = await ImagePicker.launchCameraAsync({
                base64: true, quality: 0.7,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                base64: true, quality: 0.7,
            });
        }
        if (!result.canceled && result.assets && result.assets.length) {
            setFoto(result.assets[0].base64);
        }
    };

    // Volver a tomar ubicación
    const handleObtenerUbicacion = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLoading(false);
            Alert.alert('Permiso denegado', 'No se pudo obtener la ubicación.');
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setLatitud(location.coords.latitude);
        setLongitud(location.coords.longitude);
        setLoading(false);
    };

    // Si cambió algún campo relevante
    const haCambiado = () => (
        titulo.trim() !== (plato.titulo || '') ||
        descripcion !== (plato.descripcion || '') ||
        notas !== (plato.notas || '') ||
        puntaje !== (plato.puntaje ? String(plato.puntaje) : '') ||
        precio !== (plato.precio ? String(plato.precio) : '') ||
        favorito !== !!plato.favorito ||
        foto !== plato.imagenBase64 ||
        latitud !== plato.latitud ||
        longitud !== plato.longitud ||
        JSON.stringify(categoriasSeleccionadas) !== JSON.stringify(plato.categoriasIds)
    );

    // Validación: título, foto, categoría y hubo cambios
    const puedeGuardar = titulo.trim().length > 0 && foto && categoriasSeleccionadas.length > 0 && haCambiado();

    // Guardar cambios
    const handleGuardar = async () => {
        setLoading(true);
        try {
            const platoEditado = {
                ...plato,
                titulo,
                descripcion,
                notas,
                puntaje: puntaje ? parseFloat(puntaje) : null,
                precio: precio ? parseFloat(precio) : null,
                categoriasIds: categoriasSeleccionadas,
                favorito,
                latitud,
                longitud,
                imagenBase64: foto,
            };
            await actualizarPlato(platoEditado); // Update en Firestore
            dispatch(editarPlato(platoEditado)); // Update local
            setLoading(false);
            setShowExito(true);
        } catch (err) {
            setLoading(false);
            Alert.alert('Error', 'No se pudo guardar el plato.');
        }
    };

    // Eliminar plato
    const handleEliminar = async () => {
        setLoading(true);
        try {
            await borrarPlato(plato.id); // Borra en Firebase
            dispatch(eliminarPlato(plato.id)); // Borra en Redux
            setLoading(false);
            setShowExito(true);
        } catch (err) {
            setLoading(false);
            Alert.alert('Error', String(err?.message || err));
        }
    };

    // Al cerrar éxito, cerrar ambos modales
    const handleCerrarExito = () => {
        setShowExito(false);
        if (onClose) onClose();
    };

    // Confirmación eliminar
    const mostrarConfirmacionEliminar = () => setShowEliminar(true);
    const cerrarConfirmacionEliminar = () => setShowEliminar(false);


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>


                <Text style={styles.tituloPantalla}>Editar Plato</Text>

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
                        <Text style={styles.botonFotoText}>Reemplazar foto 📷</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.botonGaleria} onPress={() => pickImage(false)}>
                        <Text style={styles.botonGaleriaText}>Reemplazar de galería</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    placeholder="Título *"
                    value={titulo}
                    onChangeText={setTitulo}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Descripción"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Notas personales"
                    value={notas}
                    onChangeText={setNotas}
                    style={styles.input}
                />

                <View style={styles.row}>
                    <TextInput
                        placeholder="Puntaje (1-5)"
                        value={puntaje}
                        onChangeText={v => handleChangeNumero(v, setPuntaje, true)}
                        keyboardType="decimal-pad"
                        maxLength={4}
                        style={[styles.input, { flex: 1 }]}
                    />
                    <TextInput
                        placeholder="Precio $"
                        value={precio}
                        onChangeText={v => handleChangeNumero(v, setPrecio, true)}
                        keyboardType="decimal-pad"
                        maxLength={8}
                        style={[styles.input, { flex: 1 }]}
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

                {/* MAPA */}
                <Text style={styles.subtitulo}>Ubicación del Plato</Text>
                <View style={styles.mapaContainer}>
                    {latitud != null && longitud != null ? <Image style={styles.image} resizeMode="cover"
                        source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?center=${latitud},${longitud}&zoom=15&size=600x300&markers=color:red%7Clabel:P%7C${latitud},${longitud}&key=AIzaSyBIvpR_Lbz-a9RC__LXgIvR4ofZwfHGDbM` }} />
                        : <Text style={{ color: '#999', textAlign: 'center', padding: 20 }}>Ubicación no disponible</Text>}
                </View>
                <View style={styles.ubicacionStack}>
                    <TouchableOpacity style={styles.botonUbicacion} onPress={handleObtenerUbicacion}>
                        <Text style={styles.botonUbicacionText}>Volver a tomar ubicación</Text>
                    </TouchableOpacity>
                    <Text style={styles.ubicacionText}>
                        {latitud && longitud ? `(${latitud.toFixed(5)}, ${longitud.toFixed(5)})` : ''}
                    </Text>
                    <Text style={styles.ubicacionText}>{direccion}</Text>
                </View>


                <Text style={styles.hora}>
                    Registrado: {plato.fechaHora ? new Date(plato.fechaHora).toLocaleString() : '-'}
                </Text>

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#2066e0" />
                    </View>
                )}

                {/* MODAL ÉXITO */}
                <Modal
                    visible={showExito}
                    transparent
                    animationType="fade"
                    onRequestClose={handleCerrarExito}
                >
                    <View style={styles.exitoBg}>
                        <View style={styles.exitoCard}>
                            <Text style={styles.exitoTitulo}>¡Plato actualizado!</Text>
                            <Text style={styles.exitoTexto}>
                                {showEliminar ? 'El plato fue eliminado correctamente.' : 'Los cambios fueron guardados.'}
                            </Text>
                            <TouchableOpacity style={styles.botonOK} onPress={handleCerrarExito}>
                                <Text style={styles.botonOKText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* MODAL CONFIRMACIÓN ELIMINAR */}
                <Modal
                    visible={showEliminar}
                    transparent
                    animationType="fade"
                    onRequestClose={cerrarConfirmacionEliminar}
                >
                    <View style={styles.exitoBg}>
                        <View style={styles.exitoCard}>
                            <Text style={styles.exitoTitulo}>¿Eliminar plato?</Text>
                            <Text style={styles.exitoTexto}>¿Seguro que querés eliminar este plato? Esta acción no se puede deshacer.</Text>
                            <View style={styles.accionesRow}>
                                <TouchableOpacity style={styles.botonCancelarModal} onPress={onClose}>
                                    <Text style={styles.botonCancelarTextModal}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.botonSecundario} onPress={mostrarConfirmacionEliminar}>
                                    <Text style={styles.botonSecundarioText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
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
            {/* BOTONES */}
            <View style={styles.accionesRowEditarPlato}>
                <TouchableOpacity style={styles.botonCancelar} onPress={onClose}>
                    <Text style={styles.botonCancelarText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonEliminar} onPress={mostrarConfirmacionEliminar}>
                    <Text style={styles.botonEliminarText}>Eliminar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.botonGuardar}
                    onPress={handleGuardar}
                    disabled={!puedeGuardar || loading}
                >
                    <Text style={styles.botonGuardarText}>Guardar</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}