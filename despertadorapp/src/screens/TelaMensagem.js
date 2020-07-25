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


export default class TelaMensagem extends Component {

    constructor(props, value) {
        super(props);

        if (props && props.navigation) {
            this.oNavegacao = props.navigation;
        }

        if (value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTela = this.oDadosApp.tela_mensagem;
            this.oDadosTelaConfiguracao = this.oDadosApp.tela_configuracao;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oMensagem = new Mensagem(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp);
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
            
            AppState.addEventListener('change', this.oConfiguracao.salvarConfiguracoes);
        }

        this.exibirProximaMensagem = this.exibirProximaMensagem.bind(this);
        this.montarStausMensagens = this.montarStausMensagens.bind(this);
        this.carregar = this.carregar.bind(this);

        this.obterMsgTextoDoDispositivo = this.obterMsgTextoDoDispositivo.bind(this);
        this.salvarMsgTextoNoDispositivo = this.salvarMsgTextoNoDispositivo.bind(this);
    }

    componentDidMount() {

        AsyncStorage.flushGetRequests();
        this.obterMsgTextoDoDispositivo();

        if (this.oDadosApp.mensagem.texto == ''){ //inicialização de mensagens para quando o aplicativo é iniciado pela primeira vez
            this.oDadosApp.mensagem.texto = 'Configure os intervalos e aguarde o despertador...';
            if (this.oDadosApp.mensagem_proxima.texto_proxima == '') {
                this.oDadosApp.mensagem_proxima.texto_proxima = '"Honrai as verdades com a prática." - Helena Blavatsky' //essa vai ser a primeira mensagem a ser exibida
            }
        }

        if (this.oConfiguracao) {

            this.oConfiguracao.configurarNotificacao(this, this.oNavegacao);
            this.oConfiguracao.obterConfiguracoesNoDispositivo(this.carregar);
        }
    }

    carregar() {
        let oAgendaNotificacoes = this.oDadosTelaConfiguracao.agenda_notificacoes;
        let oUltimaDataHoraAgendada;

        if (oAgendaNotificacoes && oAgendaNotificacoes.ultima_data_hora_agendada) {
            oUltimaDataHoraAgendada = oAgendaNotificacoes.ultima_data_hora_agendada;

            if (oUltimaDataHoraAgendada && oUltimaDataHoraAgendada.data_hora_agenda) {

                let oDataHoraAgendada = new Date(oUltimaDataHoraAgendada.data_hora_agenda);
                let oAgora = new Date();

                if (oDataHoraAgendada <= oAgora) {
                    this.oDadosControleApp.exibir_mensagem = true;
                }
            }
        }

        if (this.oDadosControleApp.exibir_mensagem) {

            this.oDadosControleApp.exibir_mensagem = false;
            this.oMensagem.lerMensagensExibir(this.exibirProximaMensagem);
        } else {
            this.oMensagem.lerMensagensExibir(() => { this.oGerenciadorContextoApp.atualizarEstadoTela(this); });
        }

        if (!oUltimaDataHoraAgendada || !oUltimaDataHoraAgendada.data_hora_agenda) {

            this.oNavegacao.navigate('Configuracao');
        }
    }

    //fazer o app sortear a proxima mensagem para mostrar nas notificações, e mostrar a mensagem anterior na tela de mensagem
    exibirProximaMensagem() {
        //a ideia é fazer a 'mensagem_proxima' ser exibida somente na notificação
        //quando o usuario abre o app, o que está na 'mensagem_proxima' vira a 'mensagem' que vai ser exibida
        //e após isso uma nova mensagem é sorteada para a 'mensagem_proxima'
        
        if (this.oDadosApp.mensagem_proxima.texto_proxima == '') {//esse if serve para o caso de ser a primeira vez que o usuario está abrindo o app (nenhuma mensagem sorteada)
            this.oDadosApp.mensagem_proxima.texto_proxima = this.oMensagem.obterProximaMensagem();
        } else {
            this.oDadosApp.mensagem.texto = this.oDadosApp.mensagem_proxima.texto_proxima;
            this.oDadosApp.mensagem_proxima.texto_proxima = this.oMensagem.obterProximaMensagem();
        }
        this.salvarMsgTextoNoDispositivo();

        this.oConfiguracao.agendarNotificacao();

        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    montarStausMensagens() {
        if (this.oDadosApp.mensagens_exibir) {

            if (this.oDadosApp.mensagens_exibir.length > 0) {

                return (
                    <View style={{ flex: 0.15, marginTop: 20, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                            <Text style={{ marginRight: 5 }}>Mensagens:</Text>
                            <Text>{this.oDadosApp.mensagens_exibir.length}/{this.oDadosApp.mensagens_exibidas.length + this.oDadosApp.mensagens_exibir.length}</Text>
                        </View>
                    </View>
                );

            } else {

                this.oMensagem.lerMensagensExibir(() => { this.oGerenciadorContextoApp.atualizarEstadoTela(this); });

                return (
                    <View style={{ flex: 0.15, marginTop: 20, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                            <Text style={{ marginRight: 5 }}>Sincronizando mensagens...</Text>
                        </View>
                    </View>
                );
            }

        } else {
            this.oDadosApp.mensagens_exibir = [];

            return (
                <View style={{ flex: 0.15, marginTop: 20, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                        <Text style={{ marginRight: 5 }}>Não há mensagens a exibir</Text>
                    </View>
                </View>
            );
        }
    }

    //para salvar no dispositivo as mensagens que já foram sorteadas e devem ser exibidas (oDadosApp -> mensagem.texto e mensagem_proxima.texto_proxima)
    salvarMsgTextoNoDispositivo (callback, callback2) {
        try {
            AsyncStorage.setItem('mensagem_texto', this.oDadosApp.mensagem.texto)
            AsyncStorage.setItem('mensagem_proxima', this.oDadosApp.mensagem_proxima.texto_proxima)
            .then(() => {
            
                if(callback) {
                    callback();

                    if(callback2) {
                        callback2();
                    }
                };
            })

        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao salvar mensagens no dispositivo: ' + error);
        }
    }

    //para carregar do dispositivo as mensagens que já foram sorteadas (oDadosApp -> mensagem.texto e mensagem_proxima.texto_proxima)
    obterMsgTextoDoDispositivo (callback) {
        try {                   
            let dados;
            
            AsyncStorage.getItem('mensagem_texto').then((valor) => {            
                if(valor) {
                    dados = valor;
                    this.oDadosApp.mensagem.texto = dados;                    
                    if(callback) {
                        callback();
                    }
                }
            })
            AsyncStorage.getItem('mensagem_proxima').then((valor) => {            
                if(valor) {
                    dados = valor;
                    this.oDadosApp.mensagem_proxima.texto_proxima = dados;                    
                    if(callback) {
                        callback();
                    }
                }
            })

        } catch (error) {

            Alert.alert('Despertador de Consciência', 'Erro ao ler mensagem texto do dispositivo: ' + error);
        }
    }

    render() {

        return (

            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back.png')} style={styles.imgBG} resizeMode='stretch'>
                    <View style={{ flex: 0.15, flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'flex-end' }} >
                        <TouchableOpacity onPress={() => this.oNavegacao.navigate('Configuracao')}>
                            <Image source={require('../images/botao_cera.png')} resizeMode='stretch' style={{ width: 85, height: 95, marginRight: 40, justifyContent: 'center' }} >
                                <Icon name="cog" size={25} color="#4d0000" style={{ margin: 23 }} />
                            </Image>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 0.70, margin: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.formataFrase}>
                            {this.oDadosApp.mensagem.texto}
                        </Text>
                    </View>
                    <TouchableOpacity activeOpacity={100} 
                        style={{ flex: 0.15, flexDirection: 'column-reverse', alignItems: 'center', justifyContent: 'center', marginBottom: 10,}} 
                        onLongPress={ () => { this.exibirProximaMensagem() }}
                    >
                        {this.montarStausMensagens()}
                    </TouchableOpacity>                    
                </ImageBackground>
            </View>
        );
    }
}

TelaMensagem.contextType = ContextoApp;

const styles = StyleSheet.create({

    areaTotal: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        backgroundColor: '#F9F8E7'
    },

    imgBG: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    formataFrase: {
        fontSize: 50,
        textAlign: 'center',
        fontFamily: 'ErisblueScript'
    }
});