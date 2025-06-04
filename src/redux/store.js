import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import categoriasReducer from './slices/categoriasSlice';
import platosReducer from './slices/platosSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    platos: platosReducer,
    categorias: categoriasReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});