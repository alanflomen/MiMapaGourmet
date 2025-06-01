import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import logeadoReducer from './slices/loginSlice';
import categoriasReducer from './slices/categoriasSlice';
import platosReducer from './slices/platosSlice';
import usuarioReducer from './slices/usuarioSlice';
export const store = configureStore({
  reducer: {
    //[authApi.reducerPath]: authApi.reducer,
    logueado: logeadoReducer,
    platos: platosReducer,
    usuario: usuarioReducer,
    categorias: categoriasReducer,
    // filtros: filtrosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});