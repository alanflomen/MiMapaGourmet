import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Dimensions, Switch, Pressable, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/style';

const MapScreen = () => {
    const platos = useSelector((state) => state.platos.listaPlatos);
    const categorias = useSelector((state) => state.categorias.listaCategorias || []);
    const [busqueda, setBusqueda] = useState('');
    const [soloFavoritos, setSoloFavoritos] = useState(false);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(
        categorias.map(cat => ({ label: cat.nombre, value: cat.id }))
    );
    useEffect(() => {
        setItems(categorias.map(cat => ({ label: cat.nombre, value: cat.id })));
    }, [categorias]);

    const platosFiltrados = platos
        .filter(item => {
            const coincideTexto =
                item.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                item.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
            const coincideFavorito = !soloFavoritos || item.favorito;
            const coincideCategoria =
                categoriasSeleccionadas.length === 0 ||
                (item.categoriasIds && item.categoriasIds.some(id => categoriasSeleccionadas.includes(id)));
            return coincideTexto && coincideFavorito && coincideCategoria;
        });
    //armo la url, tiene 3 partes:
    //1. el centro del mapa, que es el promedio de las coordenadas de los platos filtrados, asi queda centrado
    //   si no hay platos, se usa un valor por defecto (Buenos Aires)
    //2. el tamaño del mapa, que es el ancho y alto de la pantalla
    //3. los marcadores, que son los platos filtrados con sus coordenadas
    const markersParams = platosFiltrados.map((p, idx) =>
        `markers=color:red%7Clabel:${String.fromCharCode(65 + (idx % 26))}%7C${p.latitud},${p.longitud}`
    ).join('&');

    const { width, height } = Dimensions.get('window');
    const ancho = Math.round(width);
    const alto = Math.round(height);
    const altoXancho = ancho + "x" + alto;
    function calcularCentroComoString(platos) {
        const coords = platos.filter(p =>
            typeof p.latitud === 'number' && typeof p.longitud === 'number'
        );
        if (!coords.length) return "-34.6037,-58.3816";
        const suma = coords.reduce(
            (acc, p) => ({
                lat: acc.lat + p.latitud,
                lng: acc.lng + p.longitud,
            }),
            { lat: 0, lng: 0 }
        );
        const lat = suma.lat / coords.length;
        const lng = suma.lng / coords.length;
        return `${lat.toFixed(5)},${lng.toFixed(5)}`;
    }
    const promedioCentro = calcularCentroComoString(platosFiltrados);

    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${promedioCentro}&zoom=12&size=${altoXancho}&${markersParams}&key=AIzaSyBIvpR_Lbz-a9RC__LXgIvR4ofZwfHGDbM`;

    return (
        <View style={styles.container}>
            <Text style={styles.tituloPantalla}>Mapas de todos los platos</Text>
            <View style={{ zIndex: open ? 5000 : 1, paddingHorizontal: 8, marginBottom: 8 }}>
                <View style={{ position: 'relative', width: '100%', marginBottom: 8 }}>
                    <TextInput
                        placeholder="Buscar..."
                        placeholderTextColor={'#aaaa'}
                        value={busqueda}
                        onChangeText={setBusqueda}
                        style={[styles.input, { paddingRight: 38 }]} // Dejá espacio para la X (borrar búsqueda)
                    />
                    {busqueda.length > 0 && (
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                right: 10,
                                top: 0,
                                bottom: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                            }}
                            onPress={() => setBusqueda('')}
                        >
                            <Ionicons name="close-circle" size={22} color="#d00" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                        <DropDownPicker
                            open={open}
                            setOpen={setOpen}
                            items={items}
                            setItems={setItems}
                            multiple={true}
                            value={categoriasSeleccionadas}
                            setValue={setCategoriasSeleccionadas}
                            placeholder="Categorías..."
                            mode="BADGE"
                            showBadgeDot={true}
                            searchable={true}
                            listMode="MODAL"
                            badgeColors={["#2066e0"]}
                            dropDownDirection="BOTTOM"
                            searchPlaceholder="Escriba una categoría..."
                            zIndex={open ? 9999 : 1}
                            zIndexInverse={1}
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            placeholderStyle={styles.dropdownPlaceholder}
                            labelStyle={styles.dropdownLabel}
                            selectedItemLabelStyle={styles.dropdownSelectedLabel}
                            listItemContainerStyle={styles.dropdownListItem}
                            arrowIconStyle={styles.dropdownArrow}
                            translation={{
                                NOTHING_TO_SHOW: "No hay categorías disponibles"
                            }}
                            listItemLabelStyle={{
                                color: '#aaaaaa', // El color que quieras
                                fontSize: 15,
                                fontWeight: '500',
                                fontFamily: 'Livvic-Regular',
                            }}
                            tickIconStyle={{
                                tintColor: "#00adb5", // el color que quieras para el check
                                width: 22,
                                height: 22,
                            }}
                        />
                    </View>
                    <Pressable style={styles.button} onPress={!soloFavoritos ? () => setSoloFavoritos(true) : () => setSoloFavoritos(false)}>
                        <Text style={styles.favoritosTextLabel}>Solo {"\n"}favoritos</Text>
                    </Pressable>
                    <Switch value={soloFavoritos} onValueChange={setSoloFavoritos} />
                </View>
            </View>
            <View style={styles.imageContainer}>
                <Image style={styles.imagen}
                    source={{ uri: staticMapUrl }}
                />
            </View>
        </View>
    );
};

export default MapScreen;
