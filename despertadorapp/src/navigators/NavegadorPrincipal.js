import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TelaMensagem from '../screens/TelaMensagem';
import TelaConfiguracao from '../screens/TelaConfiguracao';
import TelaConfiguracaoModal from '../screens/TelaConfiguracaoModal';
import { ContextoApp, ContextoAppProvider } from '../contexts/ContextoApp';
import TelaInstrucaoModal from '../screens/TelaInstrucaoModal';
import TelaConfiguracaoNotificacao from '../screens/TelaConfiguracaoNotificacao';
import {TabBarConfiguracao} from '../screens/TabBarConfiguracao';
import { Value } from 'react-native-reanimated';

const StackPrincipal = createStackNavigator();
const StackRaiz = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

function FluxoPrincipal() {
  
return (
    <StackPrincipal.Navigator headerMode='none'>
        <StackPrincipal.Screen name="Mensagem" component={TelaMensagem} />
        <StackPrincipal.Screen name="Configuracao" component={FluxoConfiguracoes} />
    </StackPrincipal.Navigator>
  );
}
const contexto = ContextoApp;

function FluxoConfiguracoes() {
  
  return (
    <ContextoApp.Consumer >
      {value => 
        <Tab.Navigator tabBar={props => <TabBarConfiguracao {...props} gerenciador={value.gerenciador} />} >
            <Tab.Screen name="Intervalos" component={TelaConfiguracao} />
            <Tab.Screen name="Desbloqueio" component={TelaConfiguracaoNotificacao} />
        </Tab.Navigator>
      }
    </ContextoApp.Consumer>
    );
}

function FluxoRaiz() {
  
  return (
    <StackRaiz.Navigator  headerMode='none' mode='modal'>
        <StackRaiz.Screen name="Principal" component={FluxoPrincipal} />
        <StackRaiz.Screen name="Inclusao Intervalo" component={TelaConfiguracaoModal} />
        <StackRaiz.Screen name="Instrucao" component={TelaInstrucaoModal} />
    </StackRaiz.Navigator>
  );
}

export default function App() {
    return (
      <ContextoAppProvider>
        <NavigationContainer>
          <FluxoRaiz />
        </NavigationContainer>
      </ContextoAppProvider>
    );
}