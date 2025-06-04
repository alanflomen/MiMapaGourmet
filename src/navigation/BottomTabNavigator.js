import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatsScreen from '../screens/StatsScreen';
import HomeScreen from '../screens/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'fast-food-outline';
          } else if (route.name === 'Mapas') {
            iconName = 'map';
          } else if (route.name === 'Stats') {
            iconName = 'stats-chart';
          } else if (route.name === 'Perfil') {
            iconName = 'person-circle-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={focused ? 28 : 24}
              color={focused ? '#00adb5' : '#aaaaaa'}
            />
          );
        },
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              fontSize: 13,
              marginBottom: 2,
              letterSpacing: 0.4,
              fontFamily: focused ? 'Livvic-Bold' : 'Livvic-Regular',
              color: focused ? '#00adb5' : '#aaaaaa',
            }}
          >
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: '#393e46',
          borderTopWidth: 0,
          height: 66,
          paddingBottom: 10,
          paddingTop: 6,
          shadowColor: '#00adb5',
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          elevation: 12,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Mapas" component={MapScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>

  );
}