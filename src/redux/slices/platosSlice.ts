import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

// Async thunk para traer todos los platos
export const cargarPlatos = createAsyncThunk(
  'platos/cargarPlatos',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Tomar el UID del usuario logueado
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Usuario no autenticado');

      // 2. Query a Firestore solo por ese usuarioId
      const platosQuery = query(
        collection(db, 'platos'),
        where('usuarioId', '==', uid)
      );
      const snapshot = await getDocs(platosQuery);
      const platos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return platos;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const platosSlice = createSlice({
  name: 'platos',
  initialState: {
    listaPlatos: [],
    cargando: false,
    error: null,
  },
  reducers: {
    agregarPlato: (state, action) => {
      state.listaPlatos.push(action.payload);
    },
    eliminarPlato: (state, action) => {
      state.listaPlatos = state.listaPlatos.filter(plato => plato.id !== action.payload);
    },
    editarPlato: (state, action) => {
      const idx = state.listaPlatos.findIndex(plato => plato.id === action.payload.id);
      if (idx !== -1) {
        state.listaPlatos[idx] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarPlatos.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(cargarPlatos.fulfilled, (state, action) => {
        state.cargando = false;
        state.listaPlatos = action.payload || [];
      })
      .addCase(cargarPlatos.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      });
  }
});

export default platosSlice.reducer;
export const { agregarPlato, editarPlato, eliminarPlato } = platosSlice.actions;
