import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logueado: false, // Estado inicial
  email: '', // Email del usuario
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    cambiarEstado: (state) => {
      state.logueado = !state.logueado; // Cambiar el estado de logueado
    },
    cambiarEmail: (state, action) => {
      state.email = action.payload;
    },

  },
});

export const { cambiarEstado, cambiarEmail } = loginSlice.actions; // Exportar las acciones
export default loginSlice.reducer; // Exportar el reducer