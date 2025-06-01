import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const categorias = [
  "Pizza", "Hamburguesa", "Sushi", "Pastas", "Parrilla", "Pollo", "Pescados y Mariscos", "Vegetariano", "Vegano", "Postres",
  "Empanadas", "Ensaladas", "Comida China", "Comida Japonesa", "Comida Mexicana", "Comida Árabe", "Comida Española",
  "Comida Francesa", "Comida India", "Comida Peruana", "Comida Italiana", "Sandwiches", "Comida Rápida", "Café y Pastelería",
  "Helados", "Cervezas y Tragos", "Sopas", "Tapas", "Milanesas", "Tacos", "Guisos", "Wok", "Carnes Exóticas", "Barbacoa",
  "Brunch", "Arepas", "Ramen", "Bagels", "Wraps", "Bowls"
];

export async function cargarCategoriasIniciales() {
  for (let i = 0; i < categorias.length; i++) {
    const id = i + 1;
    try {
      await setDoc(doc(collection(db, 'categorias'), id.toString()), {
        id: id,
        nombre: categorias[i]
      });
      console.log(`Categoría ${categorias[i]} insertada con ID ${id}`);
    } catch (error) {
      console.error(`Error insertando categoría ${categorias[i]}:`, error);
    }
  }
  console.log('¡Categorías insertadas!');
}
