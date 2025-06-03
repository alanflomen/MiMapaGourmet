import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SinRegistrarTabNavigator from './SinRegistrarTabNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import { useSelector } from 'react-redux';
import { auth } from '../firebase/config';
const Stack = createNativeStackNavigator();

export default function StackNavigator() {

  const login = useSelector((state) => state.logueado.logueado); // Acceder al estado de logueado
  console.log(auth.currentUser);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      { auth.currentUser ? <Stack.Screen //cambiar esto por login TODO
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      /> :
      <Stack.Screen name="SinRegistrar" component={SinRegistrarTabNavigator}/>
}
    </Stack.Navigator>
  );
}
