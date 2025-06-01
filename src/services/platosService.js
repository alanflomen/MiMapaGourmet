import { db } from '../firebase/config'; 
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';

/**
 * Actualiza un plato en Firestore
 * @param {object} plato - El objeto plato, debe tener id.
 */
export const actualizarPlato = async (plato) => {
  if (!plato.id) throw new Error('El plato debe tener un id');
  const ref = doc(db, 'platos', plato.id);
  // Separa el id del resto de los campos
  const { id, ...datos } = plato;
  await updateDoc(ref, datos);
  return true;
};

/**
 * Borra un plato de Firestore por id
 * @param {string} id - El id del plato a borrar
 */
export const borrarPlato = async (id) => {
  if (!id) throw new Error('El id es obligatorio');
  const ref = doc(db, 'platos', id);
  await deleteDoc(ref);
  return true;
};

export const CrearPlatoFirebase = async (plato) => {
        const docRef = await addDoc(collection(db, 'platos'), plato);
        return { ...plato, id: docRef.id };
    };
