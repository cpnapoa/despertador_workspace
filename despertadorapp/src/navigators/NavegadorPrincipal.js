import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TelaMensagem from '../screens/TelaMensagem';
import TelaConfiguracao from '../screens/TelaConfiguracao';
import { ContextoAppProvider } from '../contexts/ContextoApp';

const Stack = createStackNavigator();

function FluxoPrincipal() {
  
  return (
    <Stack.Navigator headerMode='none'>
        <Stack.Screen name="Mensagem" component={TelaMensagem} />
        <Stack.Screen name="Configuracao" component={TelaConfiguracao} />
    </Stack.Navigator>
  );
}

export default function App() {
    return (
      <ContextoAppProvider>
        <NavigationContainer>
          <FluxoPrincipal />
        </NavigationContainer>
      </ContextoAppProvider>
    );
  }