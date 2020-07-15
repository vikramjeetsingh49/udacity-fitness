import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { AddEntry, History, EntryDetail, Live } from './components';
import { purple, white } from './utils/colors';
import { setLocalNotification } from './utils/helpers';
import reducers from './reducers';
import { useEffect } from 'react';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CustomStatusBar = ({ backgroundColor, ...props }) => {
  return (
    <View style={{ backgroundColor, height: Constants.statusBarHeight }}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
  );
};

const Home = () => (
  <Tab.Navigator
    navigationOptions={{
      header: null,
    }}
    tabBarOptions={{
      activeTintColor: Platform.OS === 'ios' ? purple : white,
      style: {
        backgroundColor: Platform.OS === 'ios' ? white : purple,
        shadowColor: 'rgba(0,0,0,0.24)',
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        shadowOpacity: 1,
      },
    }}
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        switch (route.name) {
          case 'History':
            return <Ionicons name="ios-bookmarks" size={size} color={color} />;
          case 'AddEntry':
            return <FontAwesome name="plus-square" size={size} color={color} />;
          case 'Live':
            return (
              <Ionicons name="ios-speedometer" size={size} color={color} />
            );
        }
      },
    })}
  >
    <Tab.Screen name="History" component={History} />
    <Tab.Screen name="AddEntry" component={AddEntry} />
    <Tab.Screen name="Live" component={Live} />
  </Tab.Navigator>
);

export default function App() {
  useEffect(() => {
    setLocalNotification();
  }, []);
  return (
    <Provider store={createStore(reducers)}>
      <CustomStatusBar backgroundColor={purple} barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen
            name="EntryDetail"
            component={EntryDetail}
            options={{
              headerTintColor: white,
              headerStyle: { backgroundColor: purple },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
