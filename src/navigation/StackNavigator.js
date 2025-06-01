import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SinRegistrarTabNavigator from './SinRegistrarTabNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import { useSelector } from 'react-redux';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {

  const login = useSelector((state) => state.logueado.logueado); // Acceder al estado de logueado
  //console.log("Login state:", login);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      { login ? <Stack.Screen //cambiar esto por login TODO
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      /> :
      <Stack.Screen name="SinRegistrar" component={SinRegistrarTabNavigator}/>
}
    </Stack.Navigator>
  );
}
