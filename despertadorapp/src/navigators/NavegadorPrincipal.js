import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TelaMensagem from '../screens/TelaMensagem';
import TelaConfiguracao from '../screens/TelaConfiguracao';
import TelaConfiguracaoModal from '../screens/TelaConfiguracaoModal';
import { ContextoAppProvider } from '../contexts/ContextoApp';
import TelaInstrucaoModal from '../screens/TelaInstrucaoModal';

const StackPrincipal = createStackNavigator();
const StackRaiz = createStackNavigator();

function FluxoPrincipal() {
  
return (
    <StackPrincipal.Navigator headerMode='none'>
        <StackPrincipal.Screen name="Mensagem" component={TelaMensagem} />
        <StackPrincipal.Screen name="Configuracao" component={TelaConfiguracao} />
    </StackPrincipal.Navigator>
  );
}

function FluxoRaiz() {
  
  return (
    <StackRaiz.Navigator  headerMode='none' mode='modal'>
        <StackRaiz.Screen name="Principal" component={FluxoPrincipal} />
        <StackRaiz.Screen name="Configuracao Intervalo" component={TelaConfiguracaoModal} />
        <StackRaiz.Screen name="Instrucao" component={TelaInstrucaoModal} />
        {/* <StackRaiz.Screen name="Mensagem Modal" component={MensagemModal} /> */}
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