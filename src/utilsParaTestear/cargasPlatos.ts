import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config'; 

async function insertarPlatosEjemplo() {
  const usuarioId = "uid_demo"; // Cambiá por el UID real de tu usuario
  const platos = [
    {
      categoriasIds: [1, 2],
      descripcion: "Pizza napolitana con mozzarella y tomate fresco.",
      favorito: true,
      fechaHora: Timestamp.fromDate(new Date("2024-06-01T20:30:00")),
      imagenBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
      latitud: -34.6037,
      longitud: -58.3816,
      notas: "Excelente masa y sabor.",
      precio: 3500.50,
      puntaje: 4.8,
      titulo: "Pizza Napolitana",
      usuarioId
    },
    {
      categoriasIds: [3, 7],
      descripcion: "Sushi de salmón fresco, 12 piezas.",
      favorito: false,
      fechaHora: Timestamp.fromDate(new Date("2024-06-02T21:15:00")),
      imagenBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
      latitud: -34.6095,
      longitud: -58.3829,
      notas: "Muy fresco, volvería.",
      precio: 4200.00,
      puntaje: 4.5,
      titulo: "Sushi Salmón Clásico",
      usuarioId
    },
    {
      categoriasIds: [4],
      descripcion: "Hamburguesa doble con cheddar, panceta y barbacoa.",
      favorito: true,
      fechaHora: Timestamp.fromDate(new Date("2024-06-03T19:00:00")),
      imagenBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
      latitud: -34.6010,
      longitud: -58.3770,
      notas: "La mejor hamburguesa del barrio.",
      precio: 2800.25,
      puntaje: 5.0,
      titulo: "Hamburguesa Doble BBQ",
      usuarioId
    },
    {
      categoriasIds: [5, 10],
      descripcion: "Helado artesanal de dulce de leche y chocolate.",
      favorito: false,
      fechaHora: Timestamp.fromDate(new Date("2024-06-04T22:10:00")),
      imagenBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
      latitud: -34.6101,
      longitud: -58.3842,
      notas: "Muy cremoso, porciones generosas.",
      precio: 1500.00,
      puntaje: 4.2,
      titulo: "Helado Dulce Tentación",
      usuarioId
    },
    {
      categoriasIds: [6, 11],
      descripcion: "Ensalada César con pollo grillado, croutons y parmesano.",
      favorito: true,
      fechaHora: Timestamp.fromDate(new Date("2024-06-05T13:45:00")),
      imagenBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
      latitud: -34.6025,
      longitud: -58.3863,
      notas: "Muy fresca y abundante.",
      precio: 2100.75,
      puntaje: 4.7,
      titulo: "Ensalada César",
      usuarioId,
    },
  ];

  for (let plato of platos) {
    await addDoc(collection(db, "platos"), plato);
  }
  console.log("¡5 platos insertados!");
}