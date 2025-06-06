import React, { useEffect, useState } from 'react';
//import { insertarPlatosEjemplo } from '../utils/insertarPlatosEjemplo'; // cargar plactos de ejemplo si es necesario
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, Switch, Pressable, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { cargarPlatos } from '../redux/slices/platosSlice';
import { cargarCategorias } from '../redux/slices/categoriasSlice';
import DropDownPicker from 'react-native-dropdown-picker';
import AddPlatoScreen from './AddPlatoScreen';
import EditPlatoScreen from './EditPlatoScreen';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/style';
import { loadFonts } from '../fonts/fonts';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();

  const platos = useSelector((state) => state.platos.listaPlatos);
  const cargando = useSelector((state) => state.platos.cargando);
  const categorias = useSelector((state) => state.categorias.listaCategorias || []);
  const [busqueda, setBusqueda] = useState('');
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    categorias.map(cat => ({ label: cat.nombre, value: cat.id }))
  );
  const [modalAddPlatoVisible, setModalAddPlatoVisible] = useState(false);
  const [platoAEditar, setPlatoAEditar] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const handleAbrirEditar = (plato) => setPlatoAEditar(plato);
  const handleCerrarEditar = () => setPlatoAEditar(null);
  useEffect(() => {
    // Cargar platos al montar la pantalla
    dispatch(cargarPlatos());
    dispatch(cargarCategorias());
  }, [dispatch]);

  useEffect(() => { //cargo las fonts al iniciar
    const loadAllFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };

    loadAllFonts();
  }, []);

  useEffect(() => {
    setItems(categorias.map(cat => ({ label: cat.nombre, value: cat.id })));
  }, [categorias]);

  const platosFiltrados = platos
    .filter(item => {
      // Filtro por texto (título o descripción)
      const coincideTexto =
        item.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

      // Filtro favoritos
      const coincideFavorito = !soloFavoritos || item.favorito;

      // Filtro categorías
      const coincideCategoria =
        categoriasSeleccionadas.length === 0 ||
        (item.categoriasIds && item.categoriasIds.some(id => categoriasSeleccionadas.includes(id)));

      return coincideTexto && coincideFavorito && coincideCategoria;
    })
    .slice()
    .sort((a, b) => {
      const fechaA = a.fechaHora ? new Date(a.fechaHora) : new Date(0);
      const fechaB = b.fechaHora ? new Date(b.fechaHora) : new Date(0);
      return fechaB.getTime() - fechaA.getTime(); // más nuevos primero
    });

  // Renderizar cada plato como una card
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleAbrirEditar(item)}
    >
      {/* Foto miniatura del plato */}
      <View style={styles.imgContainer}>
        {item.imagenBase64 ? (
          <Image
            source={{ uri: 'data:image/jpeg;base64,' + item.imagenBase64 }}
            style={styles.img}
          />
        ) : (
          <View style={styles.imgPlaceholder}>
            <Text>Sin foto</Text>
          </View>
        )}
      </View>
      {/* Detalles del plato */}
      <View style={styles.cardContent}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.tituloPantalla}>Mi Mapa Gourmet</Text>
      <View style={[styles.filtrosContainer, { zIndex: open ? 1000 : 1 }]}>
        {/* Input de búsqueda */}
        <View style={{ position: 'relative', width: '100%', marginBottom: 8 }}>
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor={'#aaaaaa'}
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

        {/* Dropdown de categorías */}
        <View
          style={{
            zIndex: open ? 5000 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 8,
            gap: 2,
          }}
        >
          <View style={{ flex: 1 }}>
            <DropDownPicker
              open={open}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownPlaceholder}
              labelStyle={styles.dropdownLabel}
              selectedItemLabelStyle={styles.dropdownSelectedLabel}
              listItemContainerStyle={styles.dropdownListItem}
              arrowIconStyle={styles.dropdownArrow}
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
              zIndex={open ? 5000 : 1}
              zIndexInverse={1}
              translation={{
                NOTHING_TO_SHOW: "No hay categorías disponibles"
              }}
            />
          </View>
          {/* Favoritos: label y switch juntos */}
          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 110, }}>
            <Pressable
              onPress={() => setSoloFavoritos(!soloFavoritos)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',   // Esto asegura que todo quede alineado al centro verticalmente
                minWidth: 110,
                paddingVertical: 2,
                // Opcional, para que no quede apretado
              }}
            >
              <Text
                style={[
                  styles.favoritosTextLabel,
                  { flexShrink: 1, flexGrow: 0, marginRight: 6, textAlignVertical: 'center' }
                ]}
              >
                Solo {"\n"}favoritos
              </Text>
              <Switch
                value={soloFavoritos}
                onValueChange={setSoloFavoritos}
                style={{ marginLeft: 2 }}
              />
            </Pressable>

          </View>

        </View>


      </View>

      {cargando ? (
        <Text style={styles.cargando}>Cargando...</Text>
      ) : platos.length === 0 ? (
        <Text style={styles.vacio}>¡Todavía no agregaste ningún plato!</Text>
      ) : (
        platosFiltrados.length === 0 ?
          <Text style={styles.vacio}>¡No hay resultados!</Text>
          : <FlatList
            data={platosFiltrados}
            keyExtractor={item => item.id?.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
      )}


      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalAddPlatoVisible(true)}
      >
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalAddPlatoVisible}
        animationType="slide"
        onRequestClose={() => setModalAddPlatoVisible(false)}
        presentationStyle="pageSheet"
      >
        <AddPlatoScreen onClose={() => setModalAddPlatoVisible(false)} />
      </Modal>
      <Modal
        visible={!!platoAEditar}
        animationType="slide"
        onRequestClose={handleCerrarEditar}
      >
        {platoAEditar && (
          <EditPlatoScreen
            plato={platoAEditar}
            onClose={handleCerrarEditar}
          />
        )}
      </Modal>
    </View>
  );
}