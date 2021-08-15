import React, {useState, useEffect } from 'react';
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
import messaging from '@react-native-firebase/messaging';

const StackPrincipal = createStackNavigator();
const StackRaiz = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

  const handleNotifOpen = (remoteMessage) => {
    if(remoteMessage) {
      console.log('Abriu o app com:', remoteMessage);

      if(remoteMessage.data.newStatus) {
        setOrderStatus(remoteMessage.data.newStatus);
      }
    }
  }
  
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
  const [orderStatus, setOrderStatus] = useState('feito');
  
  useEffect(() => {
    // Pedindo permissão de notificação
    const requestNotifPermission = async() =>{
      const authStatus = await messaging().requestPermission();
  
      console.log('Permissão', authStatus);
    }
    requestNotifPermission();

    // Obter o token do dispositivo.
    messaging().getToken().then((token) => {
      console.log('Token do dispositivo:', token);
    })

    // Recebendo notificação Foreground.
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Recebido no Foreground', remoteMessage);
      
      if(remoteMessage.data.newStatus) {
        setOrderStatus(remoteMessage.data.newStatus);
      }
    });

    // Evento para clique na notificacao em background.
    messaging().onNotificationOpenedApp(handleNotifOpen);

    // Evento para clique na notificação com o aplicativo totalmente fechado.
    messaging().getInitialNotification().then(handleNotifOpen);
    return unsubscribe;
  }, []);

    return (
      <ContextoAppProvider>
        <NavigationContainer>
          <FluxoRaiz />
        </NavigationContainer>
      </ContextoAppProvider>
    );
}