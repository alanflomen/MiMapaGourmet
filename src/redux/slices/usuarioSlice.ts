// src/redux/slices/usuarioSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UsuarioState {
  usuarioId: string | null;
  email: string | null;
  cargando: boolean;
  error: string | null;
}

const initialState: UsuarioState = {
  usuarioId: null,
  email: null,
  cargando: false,
  error: null,
};

const usuarioSlice = createSlice({
  name: 'usuario',
  initialState,
  reducers: {
    setUsuario: (state, action: PayloadAction<{ usuarioId: string; email: string }>) => {
      state.usuarioId = action.payload.usuarioId;
      state.email = action.payload.email;
      state.cargando = false;
      state.error = null;
    },
    limpiarUsuario: (state) => {
      state.usuarioId = null;
      state.email = null;
      state.cargando = false;
      state.error = null;
    },
    setCargando: (state, action: PayloadAction<boolean>) => {
      state.cargando = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.cargando = false;
    },
  },
});

export const { setUsuario, limpiarUsuario, setCargando, setError } = usuarioSlice.actions;

export default usuarioSlice.reducer;
