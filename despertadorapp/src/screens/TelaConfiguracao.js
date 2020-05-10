import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    ScrollView,
    Button,
    ImageBackground,
    Text,
    TextInput,
    Alert,
} from 'react-native';
import Util, { clonarObjeto } from '../common/Util';
import Slider from '@react-native-community/slider';
import MasterSlider from '../common/MasterSlider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { DADOS_INTERVALO, HORA_MENSAGEM } from '../contexts/DadosAppGeral';

var PushNotification = require("react-native-push-notification");

function configurarNotificacao(navigation) {
    PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister: function (token) {
            console.log("TOKEN:", token);
        },

        // (required) Called when a remote or local notification is opened or received
        onNotification: async function (notificacao) {
            console.log("NOTIFICATION:", notificacao);

            // let mensagem = await this.oMensagem.exibirProximaMensagem();
            this.oNavegacao.navigate('TelaMensagem', { 'exibirMensagem': 'S' });

            // process the notification

            // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
            //notification.finish(PushNotificationIOS.FetchResult.NoData);
        },

        // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
        // senderID: "456789",

        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
            alert: true,
            badge: true,
            sound: false
        },

        // Should the initial notification be popped automatically
        // default: true
        popInitialNotification: true,

        /**
         * (optional) default: true
         * - Specified if permissions (ios) and token (android and ios) will requested or not,
         * - if not, you must call PushNotificationsHandler.requestPermissions() later
         */
        requestPermissions: false
    });
}

export default class TelaConfiguracao extends Component {

    constructor(props, value) {
        super(props);

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;            
            this.oRegistradorLog.registrar('TelaConfiguracao.constructor() => Iniciou.');

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTela = this.oDadosApp.tela_configuracao;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.exibirEstatisticas = this.exibirEstatisticas.bind(this);
        // this.gerarHoraAleatoria = this.gerarHoraAleatoria.bind(this);
        this.agendarNotificacao = this.agendarNotificacao.bind(this);
        this.adicionarIntervalo = this.adicionarIntervalo.bind(this);
        this.atribuirListaIntervalosNoDispositivo = this.atribuirListaIntervalosNoDispositivo.bind(this);

        this.oMensagem = new Mensagem();
        this.oUtil = new Util();

        configurarNotificacao(this.props.navigation);
        this.atribuirListaIntervalosNoDispositivo();
        this.exibirEstatisticas();
    }

    componentDidMount() {

    }

    async atribuirListaIntervalosNoDispositivo() {
        let oListaIntervalos = await this.oConfiguracao.obterListaIntervalosNoDispositivo();
        
        if(oListaIntervalos) {
            this.oDadosTela.intervalos_dias_semana = oListaIntervalos;
        }
    }
    async exibirEstatisticas() {
        
        let mensagensExibir = [];
        let mensagensExibidas = [];

        mensagensExibir = await this.oMensagem.lerMensagensExibir();
        mensagensExibidas = await this.oMensagem.lerMensagensExibidas();

        if (mensagensExibir instanceof Array) {
            this.oDadosTela.qtd_mensagens_exibir = mensagensExibir.length;
        }
        if (mensagensExibidas instanceof Array) {
            this.oDadosTela.qtd_mensagens_exibidas = mensagensExibidas.length;
        }

        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    // gerarHoraAleatoria() {
    //     let dh1 = new Date();
    //     let dh2 = new Date();

    //     dh1.setHours(parseInt(this.oDadosTela.h1), parseInt(this.oDadosTela.m1), 0, 0);
    //     dh2.setHours(parseInt(this.oDadosTela.h2), parseInt(this.oDadosTela.m2), 59, 999);

    //     let horaNotificacao = this.oUtil.obterDataHoraAleatoria(dh1, dh2);

    //     this.oDadosTela.dh1 = dh1.toLocaleTimeString();
    //     this.oDadosTela.dh2 = dh2.toLocaleTimeString();
    //     this.oDadosTela.hora_notificacao = horaNotificacao.toLocaleTimeString();
        
    //     this.oGerenciadorContextoApp.atualizarEstadoTela(this);

    //     return horaNotificacao;
    // }

    agendarNotificacao() {
        // let PushNotification = require("react-native-push-notification");
        let oHoraInicial = clonarObjeto(HORA_MENSAGEM);
        let oHoraFinal = clonarObjeto(HORA_MENSAGEM);
        
        oHoraInicial.hora = this.oDadosTela.h1;
        oHoraInicial.minuto = this.oDadosTela.m1;
        oHoraFinal.hora = this.oDadosTela.h2;
        oHoraFinal.minuto = this.oDadosTela.m2;

        let dataHora = this.oConfiguracao.gerarHoraAleatoria(oHoraInicial, oHoraFinal);
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);

        PushNotification.localNotificationSchedule({
            //... You can use all the options from localNotifications
            message: 'Desperte sua consciência...',
            playSound: false,
            date: dataHora
        });
    }

    adicionarIntervalo() {
        let oNovoIntervalo = clonarObjeto(DADOS_INTERVALO);
        
        oNovoIntervalo.hora_inicial.hora = this.oDadosTela.h1;
        oNovoIntervalo.hora_inicial.minuto = this.oDadosTela.m1;
        oNovoIntervalo.hora_final.hora = this.oDadosTela.h2;
        oNovoIntervalo.hora_final.minuto = this.oDadosTela.m2;
        oNovoIntervalo.qtd_mensagens = 1;
        
        this.oConfiguracao.adicionarIntervaloDiaSemana(1, oNovoIntervalo);
    }

    //esses métodos servem para fixar o scrollview enquanto selecionamos um valor no slider
    enableScroll = () => {this.oDadosTela.scroll_enabled = true;this.oGerenciadorContextoApp.atualizarEstadoTela(this);};
    disableScroll = () => {this.oDadosTela.scroll_enabled = false;this.oGerenciadorContextoApp.atualizarEstadoTela(this);};

    setHoraGeral() {

        this.oDadosTela.h1 = this.oDadosTela.hora_geral[0]+'';
        this.oDadosTela.m1 = this.oDadosTela.hora_geral[1]+'';
        this.oDadosTela.h2 = this.oDadosTela.hora_geral[2]+'';
        this.oDadosTela.m2 = this.oDadosTela.hora_geral[3]+'';

        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    render() {

        return (
            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back_edge.png')} style={styles.imgBG} resizeMode='stretch'>
                    <View style={{flex: 0.10, flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'flex-start'}} >
                        <Icon name="caret-left" size={40} color="#022C18" style={{marginLeft: 55}}  onPress={
                        () => {this.oNavegacao.goBack()}} />
                    </View>
                
                    <View style={styles.areaConfiguracao}>
                        <View style={styles.areaHorasOld}>
                            <Text>Hora inicial</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Slider
                                    style={{ width: '35%', height: 20 }}
                                    minimumValue={1}
                                    maximumValue={24}
                                    step={1}
                                    onValueChange={(valor) => { this.oDadosTela.h1 = valor.toString(); this.oGerenciadorContextoApp.atualizarEstadoTela(this);; }}
                                />
                                <TextInput textAlign='right' placeholder="HH" size={10} value={this.oDadosTela.h1} onChangeText={(valor) => { this.oDadosTela.h1 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                                <Text>h </Text>
                                <TextInput textAlign='right' placeholder="mm" size={10} value={this.oDadosTela.m1} onChangeText={(valor) => { this.oDadosTela.m1 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                                <Text>min</Text>
                                <Slider
                                    style={{ width: '35%', height: 20 }}
                                    minimumValue={1}
                                    maximumValue={60}
                                    step={1}
                                    onValueChange={(valor) => { this.oDadosTela.m1 = valor.toString(); this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}
                                />
                            </View>

                            <Text>Hora final: </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Slider
                                    style={{ width: '35%', height: 20 }}
                                    minimumValue={1}
                                    maximumValue={24}
                                    step={1}
                                    onValueChange={(valor) => { this.oDadosTela.h2 = valor.toString(); this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}
                                />
                                <TextInput textAlign='right' placeholder="HH" size={10} value={this.oDadosTela.h2} onChangeText={(valor) => { this.oDadosTela.h2 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                                <Text>h </Text>
                                <TextInput textAlign='right' placeholder="mm" size={10} value={this.oDadosTela.m2} onChangeText={(valor) => { this.oDadosTela.m2 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                                <Text>min</Text>
                                <Slider
                                    style={{ width: '35%', height: 20 }}
                                    minimumValue={1}
                                    maximumValue={60}
                                    step={1}
                                    onValueChange={(valor) => { this.oDadosTela.m2 = valor.toString(); this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}
                                />
                            </View>

                            <Text>Hora aletoria entre {this.oDadosTela.dh1} e {this.oDadosTela.dh2} => {this.oDadosTela.hora_notificacao}</Text>
                            <Button title='Testar hora aleatória' onPress={this.agendarNotificacao} ></Button>
                            <Button title='Testar adicionar intervalo' onPress={this.adicionarIntervalo} ></Button>
                        </View>

                        <View style={{ padding: 5 }}>
                            <Text>Mensagens exibidas: {this.oDadosTela.qtd_mensagens_exibidas}</Text>
                            <Text>Mensagens a exibir: {this.oDadosTela.qtd_mensagens_exibir}</Text>
                        </View>

                        <View style={{ padding: 5 }}>
                            <Button
                                onPress={this.oMensagem.sincronizarMensagensComServidor}
                                title="Buscar novas mensagens no servidor"
                                color="#0000ff"
                            />
                            <Button
                                onPress={this.exibirEstatisticas}
                                title="Atualizar contadores"
                                color="#ff0000"
                            />
                            <Button
                                onPress={
                                    //o .then não está funcionando. this.exibirEstatisticas nao espera o outro método acabar para ser executado
                                    () => {
                                        this.oMensagem.sincronizarMensagensComServidor().then(() => { this.exibirEstatisticas() })
                                    }
                                }
                                title="Fazer os dois"
                                color="#ff00ff"
                            />

                        </View>
                    </View>

                    <Text>horaGeral[0,1]:{this.oDadosTela.hora_geral[0]}:{this.oDadosTela.hora_geral[1]} | horaGeral[2,3]:{this.oDadosTela.hora_geral[2]}:{this.oDadosTela.hora_geral[3]}</Text>

                    <View style={styles.areaHoras} >
                        <ScrollView scrollEnabled={this.oDadosTela.scroll_enabled}>

                            <MasterSlider
                                title='componente MasterSilder!'
                                titlePosition='top'
                                height={100}
                                step={1}
                                initialValues={[500, 1000]} //poderia inicializar o slider com o horário atual
                                minimumValue={0}
                                maximumValue={1440}
                                disableScroll={this.disableScroll}
                                enableScroll={this.enableScroll}

                                onTimeChange={(valor) => { this.oDadosTela.var_teste2 = valor; this.oDadosTela.hora_geral = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); this.setHoraGeral(); }}
                            ></MasterSlider>

                        </ScrollView>
                    </View>
                </ImageBackground>
            </View>
        );
    }
}

TelaConfiguracao.contextType = ContextoApp;

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
    areaConfiguracao: {
        flex: .50,
        alignSelf: 'stretch',
        padding: 5
    },
    areaHorasOld: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
    },
    areaEstatisticas: {

    },
    areaBotao: {

    },
    areaHoras: {
        flex: .38,
        
        padding: 5,
        backgroundColor: 'black'
    }
});