import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SinRegistrarTabNavigator from './SinRegistrarTabNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import { auth } from '../firebase/config';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';


export default function StackNavigator() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {user ? <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      /> :
        <Stack.Screen name="SinRegistrar" component={SinRegistrarTabNavigator} />
      }
    </Stack.Navigator>
  );
}
