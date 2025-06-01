import React from 'react';
import { View, Text, ScrollView, Dimensions, SafeAreaView, Platform, StatusBar  } from 'react-native';
import { useSelector } from 'react-redux';
import { PieChart } from 'react-native-chart-kit';
import { styles } from '../styles/style';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
    const platos = useSelector(state => state.platos.listaPlatos || []);
    const categorias = useSelector(state => state.categorias.listaCategorias || []);

    // Cantidad total de platos
    const totalPlatos = platos.length;

    // Promedio de puntaje
    const promedioPuntaje =
        platos.length > 0
            ? (
                platos
                    .filter(p => typeof p.puntaje === 'number' && !isNaN(p.puntaje))
                    .reduce((sum, p) => sum + p.puntaje, 0) /
                platos.filter(p => typeof p.puntaje === 'number' && !isNaN(p.puntaje)).length
            ).toFixed(2)
            : '-';

    // Platos favoritos top 3
    const favoritos = platos.filter(p => p.favorito).slice(0, 3);

    // Pie chart: platos por categoría
    // 1. Inicializa el contador sólo con los ids realmente usados
    const categoriaContador = {};
    platos.forEach(plato => {
        if (Array.isArray(plato.categoriasIds)) {
            plato.categoriasIds.forEach(id => {
                // Si el plato está asociado a la categoría, suma 1
                categoriaContador[id] = (categoriaContador[id] || 0) + 1;
            });
        }
    });

    // 2. Arma el array SOLO con las categorías usadas (count > 0)
    const pieData = Object.keys(categoriaContador)
        .filter(catId => categoriaContador[catId] > 0)
        .map((catId, i) => {
            const categoria = categorias.find(c => String(c.id) === String(catId));
            return {
                name: categoria ? categoria.nombre : 'Sin categoría',
                count: categoriaContador[catId],
                color: chartColors[i % chartColors.length],
                legendFontColor: '#eeeeee',
                legendFontSize: 13,
            };
        })
        .sort((a, b) => b.count - a.count);

    // Filtrar solo platos válidos (puntaje entre 1 y 10)
    const platosValidos = platos.filter(
        p =>
            typeof p.puntaje === 'number' &&
            !isNaN(p.puntaje) &&
            p.puntaje >= 1 &&
            p.puntaje <= 10
    );

    // Encontrar el plato con el puntaje más alto
    const platoTop = platosValidos.reduce((max, p) =>
        (max === null || p.puntaje > max.puntaje) ? p : max
        , null);

    // Obtener el nombre (o un texto alternativo si no hay platos)
    const nombrePlatoTop = platoTop ? platoTop.titulo + " (" + platoTop.puntaje + ")" : 'Sin platos calificados';

    return (
        <SafeAreaView style={styles.containerStats}>
        <ScrollView contentContainerStyle={styles.scrollContentStats}>
            <Text style={styles.title}>Tus estadísticas</Text>
            <View style={styles.box}>
                <Text style={styles.subtitle}>Platos registrados</Text>
                <Text style={styles.total}>{totalPlatos}</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.subtitle}>Promedio de puntaje</Text>
                <Text style={styles.promedio}>✩ {promedioPuntaje} ✩</Text>
                <Text style={styles.subtitle}>Plato mejor puntuado: </Text>
                <Text style={styles.promedio}>{nombrePlatoTop}</Text>
            </View>
            <View style={styles.box}>
                <Text style={styles.subtitle}>Distribución por categoría</Text>
                {pieData.length > 0 ? (
                    <PieChart
                        data={pieData}
                        width={width - 32}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="count"
                        backgroundColor="transparent"
                        paddingLeft="1"
                        hasLegend={true}
                        center={[0, 0]}
                        absolute
                    />
                ) : (
                    <Text style={{ color: '#888', marginTop: 24 }}>No hay datos para graficar.</Text>
                )}
            </View>
            <View style={styles.box}>
                <Text style={styles.subtitle}>Favoritos</Text>
                {favoritos.length > 0 ? (
                    favoritos.map((plato, i) => (
                        <Text key={plato.id} style={styles.favorito}>
                            {i + 1}. {plato.titulo}
                        </Text>
                    ))
                ) : (
                    <Text style={{ color: '#888' }}>Aún no marcaste favoritos.</Text>
                )}
            </View>
        </ScrollView>
        </SafeAreaView>
    );
}

const chartColors = [
    "#2066e0", "#26b1e0", "#53e029", "#ffe44a", "#f36e6e", "#ad7df6", "#ff8f5e", "#7fd1b9"
];

const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(32, 102, 224, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51,51,51,${opacity})`,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
};