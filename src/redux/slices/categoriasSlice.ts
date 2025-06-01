// src/redux/slices/categoriasSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export interface Categoria {
  id: number;
  nombre: string;
}

interface CategoriasState {
  listaCategorias: Categoria[];
  cargando: boolean;
  error: string | null;
}

// Thunk para cargar categorías desde Firestore
export const cargarCategorias = createAsyncThunk(
  'categorias/cargarCategorias',
  async (_, { rejectWithValue }) => {
    try {
      const snapshot = await getDocs(collection(db, 'categorias'));
      // Mapear a array de objetos
      return snapshot.docs.map(doc => ({
        id: doc.data().id,
        nombre: doc.data().nombre
      }));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: CategoriasState = {
  listaCategorias: [],
  cargando: false,
  error: null,
};

const categoriasSlice = createSlice({
  name: 'categorias',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(cargarCategorias.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(cargarCategorias.fulfilled, (state, action) => {
        // Ordena alfabéticamente por nombre (ignorando mayúsculas/minúsculas)
        state.listaCategorias = action.payload.slice().sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );
        state.cargando = false;
      })

      .addCase(cargarCategorias.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload as string;
      });
  },
});

export default categoriasSlice.reducer;
