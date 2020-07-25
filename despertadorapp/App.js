import App from './src/navigators/NavegadorPrincipal';
import { AppRegistry } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import { name as appName } from './app.json';
import Configuracao from './src/screens/Configuracao'
import GerenciadorContextoApp from './src/contexts/GerenciadorContextoApp';

/// Android-only:  BackgroundFetch event-handler when app is terminated.
/// NOTE:  This handler must be placed and registered here in index.js -- DO NOT place this in your App components.
///
const headlessTask = async ({ taskId }) => {
    console.log('[despertadorapp] headlessTask() ++++++++++++ iniciou ++++++++++++');
    console.log('[despertadorapp] headlessTask() taskId =', taskId);

    let oConfiguracao = new Configuracao(new GerenciadorContextoApp());
    oConfiguracao.verificarNotificacaoEmSegundoPlano(taskId);

    console.log('[despertadorapp] headlessTask() ------------ terminou ------------');
};

// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(headlessTask);

AppRegistry.registerComponent(appName, () => App);

export default App;