import React from 'react';
import StackNavigator from './src/navigation/StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { auth } from './src/firebase/config';
import { SQLiteProvider } from 'expo-sqlite';


// const [user, setUser] = useState(null);

// useEffect(() => {
//   const unsubscribe = onAuthStateChanged(auth, setUser);
//   return unsubscribe;
// }, []);

export const initalizeDB = async (db) => {
  try {
    await db.execAsync("CREATE TABLE IF NOT EXISTS usuario (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, email TEXT NOT NULL, fotoBase64 TEXT);")
  }
  catch (error) {
    console.error("Error al inicializar la base:", error);
  }
};
export default function App() {
  return (
    <SQLiteProvider databaseName="miMapaGourmet" onInit={initalizeDB}>
      <Provider store={store}>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </Provider>
    </SQLiteProvider>
  );
}