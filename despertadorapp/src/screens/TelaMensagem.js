import React, { Component } from 'react';
import Mensagem from './Mensagem';
import Util from '../common/Util';
import {
    StyleSheet,
    View,
    Text,
    ImageBackground,
    Alert,
    TouchableOpacity,
    AppState
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Image } from 'react-native-elements';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundFetch, { BackgroundFetchStatus } from 'react-native-background-fetch';

/// Execute a BackgroundFetch.scheduleTask
///
export const scheduleTask = async (name) => {
    try {
      await BackgroundFetch.scheduleTask({
        taskId: name,
        stopOnTerminate: false,
        enableHeadless: true,
        delay: 5000,               // milliseconds (5s)
        forceAlarmManager: true,   // more precise timing with AlarmManager vs default JobScheduler
        periodic: false            // Fire once only.
      });
    } catch (e) {
      console.warn('[BackgroundFetch] scheduleTask falhou.', e);
    }
  }

/// BackgroundFetch event-handler.
/// All events from the plugin arrive here, including #scheduleTask events.
///
const onBackgroundFetchEvent = async (taskId) => {
    console.log('[despertadorapp] onBackgroundFetchEvent() ++++++++++++ iniciou ++++++++++++');
    console.log('[despertadorapp] onBackgroundFetchEvent() taskId = ', taskId);

    if (taskId === 'react-native-background-fetch') {
        // Test initiating a #scheduleTask when the periodic fetch event is received.
        try {
            await scheduleTask('com.transistorsoft.customtask');
        } catch (e) {
            console.warn('[BackgroundFetch] scheduleTask falied', e);
        }
    }
    // Required: Signal completion of your task to native code
    // If you fail to do this, the OS can terminate your app
    // or assign battery-blame for consuming too much background-time
    BackgroundFetch.finish(taskId);
    console.log('[despertadorapp] onBackgroundFetchEvent() ------------ terminou ------------');
};

/// Render BackgroundFetchStatus to text.
export const statusToString = (status) => {
    switch(status) {
      case BackgroundFetch.STATUS_RESTRICTED:
        console.info('[BackgroundFetch] status: restricted');
        return 'restricted';
      case BackgroundFetch.STATUS_DENIED:
        console.info('[BackgroundFetch] status: denied');
        return 'denied';
      case BackgroundFetch.STATUS_AVAILABLE:
        console.info('[BackgroundFetch] status: enabled');
        return 'available';
    }
    return 'unknown';
  };

export default class TelaMensagem extends Component {
    
    constructor(props, value) {
        super(props);

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTela = this.oDadosApp.tela_mensagem;
            this.oDadosTelaConfiguracao = this.oDadosApp.tela_configuracao;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oMensagem = new Mensagem(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
            this.oDadosApp.tela_mensagem.objeto_tela = this;
            AppState.addEventListener('change', this.oConfiguracao.salvarConfiguracoes);
        }

        this.inicializar = this.inicializar.bind(this);
        this.montarStatus = this.montarStatus.bind(this);
        this.montarStatusConfig = this.montarStatusConfig.bind(this);
    }

    componentDidMount() {
        console.log('[despertadorapp] componentDidMount() ++++++++++++ iniciou ++++++++++++');
        
        AsyncStorage.flushGetRequests();

        this.inicializar();
        
        this.oNavegacao.addListener('focus', () => {
            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        });

        BackgroundFetch.configure({
            minimumFetchInterval: 120,      // <-- minutes (15 is minimum allowed)
            // Android options
            forceAlarmManager: false,      // <-- Set true to bypass JobScheduler.
            stopOnTerminate: false,
            enableHeadless: true,
            startOnBoot: true,
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Default
            requiresCharging: false,       // Default
            requiresDeviceIdle: false,     // Default
            requiresBatteryNotLow: false,  // Default
            requiresStorageNotLow: false,  // Default
        }, 
        onBackgroundFetchEvent, 
        (status) => {
            console.log('[despertadorapp] componentDidMount() [BackgroundFetch] status ', statusToString(status), status);
        });
        console.log('[despertadorapp] componentDidMount() ------------ terminou ------------');
    }
    
    inicializar() {
        console.log('[despertadorapp] inicializar() ++++++++++++ iniciou ++++++++++++');

        if(!this.oDadosApp.dados_mensagens.mensagem_proxima) {

            console.log('[despertadorapp] inicializar() Vai atribuir mensagem padrão.');
            this.oDadosApp.dados_mensagens.mensagem_atual = '"Honrai as verdades com a prática." - Helena Blavatsky';
        }
        this.oConfiguracao.obterAgendaNotificacoesDoDispositivo(() => {
            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
            this.oMensagem.obterDadosMensagens(() => {
                this.oGerenciadorContextoApp.atualizarEstadoTela(this);
            });
        });

        console.log('[despertadorapp] inicializar() ------------ terminou ------------');
    }1

    montarStatusConfig() {

        if(this.oConfiguracao.temIntervaloDefinido()) {
            return(
                <View style={{marginTop:1}}>
                    <Text>Aguarde a próxima notificação</Text>
                </View>
            );
        } else {
            return(
                <View style={{marginTop:1}}>
                    <Text>Configure os intervalos</Text>
                </View>
            );
        }
    }

    montarStatus() {
        if(this.oDadosApp.dados_mensagens.lista_mensagens_exibir) {
            let qtdTotal = 0;

            if(this.oDadosApp.dados_mensagens.lista_mensagens_exibir.length > 0) {
                
                qtdTotal = this.oDadosApp.dados_mensagens.lista_mensagens_exibir.length + this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.length;
                if (this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.length > 0) {
                    // Soma um para a mensagem_atual, que ainda não foi adicionada ao array de lidas.
                    qtdTotal += 1; 
                }
                return (
                    <View style={{flex: 0.16, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <View style={{flexDirection:'row'}}>
                            <Text>Mensagem </Text> 
                            <Text>{this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.length}</Text>
                            <Text> de </Text>
                            <Text>{qtdTotal}</Text>
                        </View>
                        {this.montarStatusConfig()}
                    </View>
                );

            } else {
            
                return(
                    <View style={{flex: 0.16, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <Text style={{marginRight:5}}>Sincronizando mensagens...</Text>
                        {this.montarStatusConfig()}
                    </View>
                );    
            }

        } else {
            this.oDadosApp.dados_mensagens.lista_mensagens_exibir = [];

            return(
                <View style={{flex: 0.16, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                    <Text style={{marginRight:5}}>Não há mensagens a exibir</Text>
                    {this.montarStatusConfig()}
                </View>
            );
        }
    }
    render() {
        
        return (
            
            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back.png')} style={styles.imgBG} resizeMode='stretch'>
                    <View style={{flex: 0.17, flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'flex-end'}} >
                        <TouchableOpacity onPress={() => this.oNavegacao.navigate('Configuracao')}>
                            <Image source={require('../images/botao_cera.png')} resizeMode='stretch' style={{width:85, height:95, marginRight:40, justifyContent:'center'}} >
                                <Icon name="cog" size={25} color="#4d0000" style={{margin: 23}}/>
                            </Image>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 0.67, margin: 50, flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                        <Text style={styles.formataFrase}>
                            {this.oDadosApp.dados_mensagens.mensagem_atual}
                        </Text>
                    </View>
                    {this.montarStatus()}
                </ImageBackground>
            </View>
        );
    }
}

TelaMensagem.contextType = ContextoApp;

const styles = StyleSheet.create({
    
    areaTotal: {
        flex: 1,
        flexDirection:'column',
        alignItems:'stretch',
        justifyContent:'center',
        backgroundColor: '#F9F8E7'
    },

    imgBG: {
        flex: 1,
        alignItems:'center',
        justifyContent:'space-between'
    },

    formataFrase: {
        fontSize: 45,
        textAlign: 'center',
        fontFamily: 'ErisblueScript'
    }
});