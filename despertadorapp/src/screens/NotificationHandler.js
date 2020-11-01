import PushNotification from 'react-native-push-notification';
import GerenciadorContextoApp from '../contexts/GerenciadorContextoApp';
import Configuracao from './Configuracao';
import { AppState, BackHandler } from 'react-native';

class NotificationHandler {
  onNotification(notification) {
    console.log('NotificationHandler:', notification);

    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    }
  }

  onRegister(token) {
    console.log('NotificationHandler:', token);

    if (typeof this._onRegister === 'function') {
      this._onRegister(token);
    }
  }

onAction(notification) {
    console.log('[despertadorapp] onAction() ++++++++++++ iniciou ++++++++++++');
    console.log ('[despertadorapp] onAction() acionado: ', notification);

    let oGerenciadorContexto = new GerenciadorContextoApp();
    let oConfiguracao = new Configuracao(oGerenciadorContexto);

    console.log ('[despertadorapp] onAction() - Estado do app: ', AppState.currentState);
    if (AppState.currentState.match(/active/)) {
        console.log ('[despertadorapp] onAction() - Saindo do app...');
        BackHandler.exitApp();
    }
    if(notification) {
      if(notification.action && notification.action.toUpperCase().indexOf('ABRIR') >= 0) {
          console.log ('[despertadorapp] onAction() - invocando o app');
          PushNotification.invokeApp(notification);
      } else {
          console.log ('[despertadorapp] onAction() - Vai agendar novo horario.');
          
          // Reagenda...
          oConfiguracao.verificarNotificacaoEmSegundoPlano(notification.action);
      }
    } else {
      // Provavelmente nunca cairah aqui.
      oConfiguracao.verificarNotificacaoEmSegundoPlano('OBJETO_NOTIFICACAO_NULA');
    }

    console.log('[despertadorapp] onAction() ------------ terminou ------------');
}

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError(err) {
    console.log(err);
  }
  
  attachRegister(handler) {
    this._onRegister = handler;
  }

  attachNotification(handler) {
    this._onNotification = handler;
  }
}

const handler = new NotificationHandler();

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: handler.onRegister.bind(handler),

  // (required) Called when a remote or local notification is opened or received
  onNotification: handler.onNotification.bind(handler),

  // (optional) Called when Action is pressed (Android)
  onAction: handler.onAction.bind(handler),

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: handler.onRegistrationError.bind(handler),

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   */
  requestPermissions: false,
});

export default handler;
