import React, { Component } from 'react';
import Mensagem from './Mensagem';
import Util from '../common/Util';
import {
    StyleSheet,
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    AppState,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Image } from 'react-native-elements';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundFetch from 'react-native-background-fetch';
import MensagemModal from '../contexts/MensagemModal';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { FORMAS_AGENDAMENTO } from '../contexts/DadosAppGeral';

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
        super();
        
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
            this.oDadosControleApp.em_segundo_plano = false;
            
            if(!this.oDadosApp.dados_mensagens.mensagem_proxima && !this.oDadosApp.dados_mensagens.mensagem_atual) {

                console.log('[despertadorapp] TelaMensagem.constructor() Vai atribuir mensagem padrão.');
                this.oDadosApp.dados_mensagens.mensagem_atual = '"Honrai as verdades com a prática." - Helena Blavatsky';
            }
        }

        AppState.addEventListener('change', this.oConfiguracao.salvarConfiguracoes);

        this.inicializar = this.inicializar.bind(this);
        this.montarStatus = this.montarStatus.bind(this);
        this.montarStatusConfig = this.montarStatusConfig.bind(this);
        this.montarBotaoProxima = this.montarBotaoProxima.bind(this);
        this.testarAgendarProxima = this.testarAgendarProxima.bind(this);
    }

    componentDidMount() {
        console.log('[despertadorapp] TelaMensagem.componentDidMount() ++++++++++++ iniciou ++++++++++++');
        this.oUtil.fecharMensagem();
        this.oGerenciadorContextoApp.telaAtual = this;
        this.oDadosControleApp.app_estava_fechado = true;
        
        AsyncStorage.flushGetRequests();

        this.oNavegacao.addListener('focus', this.inicializar);

        BackgroundFetch.configure({
            minimumFetchInterval: 15,      // <-- minutes (15 is minimum allowed)
            // Android options
            forceAlarmManager: true,      // <-- Set true to bypass JobScheduler.
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
            console.log('[despertadorapp] TelaMensagem.componentDidMount() [BackgroundFetch] status ', statusToString(status), status);
        });
        console.log('[despertadorapp] TelaMensagem.componentDidMount() ------------ terminou ------------');
    }
    
    inicializar() {
        this.oDadosControleApp.inicializando = true;
        try {
            console.log('[despertadorapp] TelaMensagem.inicializar() ++++++++++++ iniciou ++++++++++++');

            if(this.oDadosControleApp.abrindo_por_notificacao) {
                console.log('[despertadorapp] TelaMensagem.inicializar() this.oDadosControleApp.abrindo_por_notificacao', this.oDadosControleApp.abrindo_por_notificacao);
                this.oDadosControleApp.inicializando = false;
                return;
            }
            
            console.log('[despertadorapp] TelaMensagem.inicializar() this.oDadosApp.dados_mensagens.mensagem_proxima', this.oDadosApp.dados_mensagens.mensagem_proxima);
            console.log('[despertadorapp] TelaMensagem.inicializar() this.oDadosControleApp.app_estava_fechado: ', this.oDadosControleApp.app_estava_fechado);
            console.log('[despertadorapp] TelaMensagem.inicializar() this.oDadosControleApp.salvando_agenda_alterada: ', this.oDadosControleApp.salvando_agenda_alterada);

            if(!this.oDadosControleApp.salvando_agenda_alterada) {
                
                if(!this.oDadosApp.dados_mensagens.mensagem_proxima && !this.oDadosApp.dados_mensagens.mensagem_atual) {

                    console.log('[despertadorapp] TelaMensagem.inicializar() Vai atribuir mensagem padrão.');
                    this.oDadosApp.dados_mensagens.mensagem_atual = '"Honrai as verdades com a prática." - Helena Blavatsky';
                }
                
                this.oConfiguracao.obterAgendaNotificacoesDoDispositivo(() => {

                    this.oMensagem.obterDadosMensagens(() => {
                        
                        if(this.oDadosControleApp.primeira_vez) {
                            // Primeira vez
                            this.oMensagem.definirMensagemExibir(() => {
                                // Obtem novamente a agenda porque salvou a agenda padrao da primeira vez.
                                this.oConfiguracao.obterAgendaNotificacoesDoDispositivo(() => {
                                    this.oConfiguracao.agendarNotificacao(FORMAS_AGENDAMENTO.ao_abrir_aplicativo_primeira_vez);

                                    // Vai para a tela de instrucoes.
                                    this.oNavegacao.navigate('Instrucao');
                                    
                                    this.oUtil.fecharMensagem();
                                    this.oDadosControleApp.inicializando = false;
                                });
                            });
                        } else {
                            let ultimaDataHoraAgendada = this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada;
                            console.log('TelaMensagem.inicializar() - this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada', this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada);

                            if(ultimaDataHoraAgendada) {
                            
                                if(ultimaDataHoraAgendada && ultimaDataHoraAgendada.data_hora_agenda) {
                                    let oUltimaDataHoraAgendada = new Date(ultimaDataHoraAgendada.data_hora_agenda);
                                    let oDataHoraAtual = new Date();
            
                                    console.log('[despertadorapp] TelaMensagem.inicializar() - Ultima data-hora agendada: ', ultimaDataHoraAgendada.data_hora_agenda);
                                    console.log('[despertadorapp] TelaMensagem.inicializar() - Data-hora atual: ', oDataHoraAtual.toLocaleString());
                                    
                                    if(oUltimaDataHoraAgendada < oDataHoraAtual) {
                                        console.log('[despertadorapp] TelaMensagem.inicializar() Data-hora agendada passou e provavelmente a notificacao foi ignorada. Serah reagendada...');
                                        
                                        this.oMensagem.definirMensagemExibir(() => {    
                                            this.oConfiguracao.agendarNotificacao(FORMAS_AGENDAMENTO.ao_abrir_aplicativo);
                                            // Recarrega a tela inicial.
                                            this.oNavegacao.reset({
                                                index: 0,
                                                routes: [{ name: 'Principal' }],
                                            });
                                            this.oDadosControleApp.inicializando = false;
                                        });
                                    } else {
                                        console.log('[despertadorapp] TelaMensagem.inicializar() Data-hora agendada eh maior. Nada a ser feito...');
                                        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
                                        this.oDadosControleApp.inicializando = false;
                                    }
                                } else {
                                    console.log('[despertadorapp] TelaMensagem.inicializar() Data-hora agendada nao encontrada. Serah agendada...');
                                    
                                    this.oMensagem.definirMensagemExibir(() => {
                                        if(this.oConfiguracao.agendarNotificacao(FORMAS_AGENDAMENTO.ao_abrir_aplicativo_sem_data_hora)) {
                                            this.oNavegacao.reset({
                                                index: 0,
                                                routes: [{ name: 'Principal' }],
                                            });
                                        }
                                    });
                                    this.oDadosControleApp.inicializando = false;
                                }
                            } else {
                                console.log('[despertadorapp] TelaMensagem.inicializar() Nao encontrou dados de configuracoes salvos no dispositivo.');
                                this.oGerenciadorContextoApp.atualizarEstadoTela(this);
                                this.oDadosControleApp.inicializando = false;
                            }
                        }
                    });
                });
            } else {
                this.oDadosControleApp.inicializando = false;
            }

            console.log('[despertadorapp] TelaMensagem.inicializar() ------------ terminou ------------');
        } catch (error) {
            console.log('[despertadorapp] TelaMensagem.inicializar() Erro ao inicializar: ', error);
            Alert.alert('Despertador de Consciência', 'Erro ao inicializar: ', error);
            this.oDadosControleApp.inicializando = false;
        }
    }
    
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
            
            if(!this.oDadosControleApp.fazendo_requisicao) {
                
                if (this.oDadosApp.dados_mensagens.qtd_mensagens_exibidas > 0) {
                    return (
                        <View style={{flex: 0.16, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                            <View style={{flexDirection:'row'}}>
                                <Text>Mensagem </Text> 
                                <Text>{this.oDadosApp.dados_mensagens.qtd_mensagens_exibidas}</Text>
                                <Text> de </Text>
                                <Text>{this.oDadosApp.dados_mensagens.qtd_total_mensagens}</Text>
                            </View>
                            {this.montarStatusConfig()}
                        </View>
                    );
                } else {
                    return (
                        <View style={{flex: 0.16, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                            {this.montarStatusConfig()}
                        </View>
                    );
                }
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

    testarAgendarProxima() {
        console.log('testarAgendarProxima() ...-');
        this.oConfiguracao.obterAgendaNotificacoesDoDispositivo(() => {
            this.oConfiguracao.removerUltimaDataHoraAgendada();
            this.oConfiguracao.salvarAgendaNotificacoesNoDispositivo(this.inicializar);
        });
    }

    montarBotaoProxima() {
        if(__DEV__) {
            return (
                <Icon name='arrow-right' onPress={this.testarAgendarProxima}></Icon>
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
                        {this.montarBotaoProxima()}
                    </View>
                    {this.montarStatus()}
                </ImageBackground>
                <MensagemModal />
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
        fontSize: RFPercentage(6.5),
        textAlign: 'center',
        fontFamily: 'ErisblueScript2'
    }
});