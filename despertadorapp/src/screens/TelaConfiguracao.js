import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    ScrollView,
    Button,
    Text,
    TextInput,
    Alert
} from 'react-native';
import Util from '../common/Util';
import Slider from '@react-native-community/slider';
import MasterSlider from '../common/MasterSlider';

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

            // let mensagem = await objMensagem.exibirProximaMensagem();
            navigation.navigate('TelaMensagem', { 'exibirMensagem': 'S' });

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
        requestPermissions: true
    });
}


export default class TelaConfiguracao extends Component {

    constructor(props) {
        super(props);
        this.state = {
            h1: '', m1: '', h2: '', m2: '',
            qtdMensagensExibir: 0, qtdMensagensExibidas: 0,
            scrollEnabled: true,
            varTeste: [0, 0], varTeste2: ['', ''],
            horaGeral: [0, 0, 0, 0]
        };
        this.exibirEstatisticas = this.exibirEstatisticas.bind(this);
        this.gerarHoraAleatoria = this.gerarHoraAleatoria.bind(this);
        this.agendarNotificacao = this.agendarNotificacao.bind(this);

        objMensagem = new Mensagem();
        objUtil = new Util();

        configurarNotificacao(this.props.navigation);
        this.exibirEstatisticas();
    }

    componentDidMount() {

    }

    async exibirEstatisticas() {
        let estado = this.state;
        let mensagensExibir = [];
        let mensagensExibidas = [];

        mensagensExibir = await objMensagem.lerMensagensExibir();
        mensagensExibidas = await objMensagem.lerMensagensExibidas();

        if (mensagensExibir instanceof Array) {
            estado.qtdMensagensExibir = mensagensExibir.length;
        }
        if (mensagensExibidas instanceof Array) {
            estado.qtdMensagensExibidas = mensagensExibidas.length;
        }

        this.setState(estado);
    }

    gerarHoraAleatoria() {
        let estado = this.state;
        let dh1 = new Date();
        let dh2 = new Date();

        dh1.setHours(parseInt(estado.h1), parseInt(estado.m1), 0, 0);
        dh2.setHours(parseInt(estado.h2), parseInt(estado.m2), 59, 999);

        let horaNotificacao = objUtil.obterDataHoraAleatoria(dh1, dh2);

        estado.dh1 = dh1.toLocaleTimeString();
        estado.dh2 = dh2.toLocaleTimeString();
        estado.horaNotificacao = horaNotificacao.toLocaleTimeString();
        this.setState(estado);

        return horaNotificacao;
    }

    agendarNotificacao() {
        // let PushNotification = require("react-native-push-notification");
        let dataHora = this.gerarHoraAleatoria();

        PushNotification.localNotificationSchedule({
            //... You can use all the options from localNotifications
            message: 'Desperte sua consciência...',
            playSound: false,
            date: dataHora
        });
    }

    //esses métodos servem para fixar o scrollview enquanto selecionamos um valor no slider
    enableScroll = () => this.setState({ scrollEnabled: true });
    disableScroll = () => this.setState({ scrollEnabled: false });

    setHoraGeral() {
        let estado = this.state;

        estado.h1 = estado.horaGeral[0]+'';
        estado.m1 = estado.horaGeral[1]+'';
        estado.h2 = estado.horaGeral[2]+'';
        estado.m2 = estado.horaGeral[3]+'';

        this.setState(estado);
    }

    render() {
        let estado = this.state;

        return (
            <View style={styles.areaTotal}>
                <View style={styles.areaConfiguracao}>
                    <View style={styles.areaHorasOld}>
                        <Text>Hora inicial</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Slider
                                style={{ width: '35%', height: 20 }}
                                minimumValue={1}
                                maximumValue={24}
                                step={1}
                                onValueChange={(valor) => { estado.h1 = valor.toString(); this.setState(estado); }}
                            />
                            <TextInput textAlign='right' placeholder="HH" size={10} value={estado.h1} onChangeText={(valor) => { estado.h1 = valor; this.setState(estado); }}></TextInput>
                            <Text>h </Text>
                            <TextInput textAlign='right' placeholder="mm" size={10} value={estado.m1} onChangeText={(valor) => { estado.m1 = valor; this.setState(estado); }}></TextInput>
                            <Text>min</Text>
                            <Slider
                                style={{ width: '35%', height: 20 }}
                                minimumValue={1}
                                maximumValue={60}
                                step={1}
                                onValueChange={(valor) => { estado.m1 = valor.toString(); this.setState(estado); }}
                            />
                        </View>

                        <Text>Hora final: </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Slider
                                style={{ width: '35%', height: 20 }}
                                minimumValue={1}
                                maximumValue={24}
                                step={1}
                                onValueChange={(valor) => { estado.h2 = valor.toString(); this.setState(estado); }}
                            />
                            <TextInput textAlign='right' placeholder="HH" size={10} value={estado.h2} onChangeText={(valor) => { estado.h2 = valor; this.setState(estado); }}></TextInput>
                            <Text>h </Text>
                            <TextInput textAlign='right' placeholder="mm" size={10} value={estado.m2} onChangeText={(valor) => { estado.m2 = valor; this.setState(estado); }}></TextInput>
                            <Text>min</Text>
                            <Slider
                                style={{ width: '35%', height: 20 }}
                                minimumValue={1}
                                maximumValue={60}
                                step={1}
                                onValueChange={(valor) => { estado.m2 = valor.toString(); this.setState(estado); }}
                            />
                        </View>

                        <Text>Hora aletoria entre {this.state.dh1} e {this.state.dh2} => {this.state.horaNotificacao}</Text>
                        <Button title='Testar hora aleatória' onPress={this.agendarNotificacao} ></Button>
                    </View>

                    <View style={{ padding: 5 }}>
                        <Text>Mensagens exibidas: {this.state.qtdMensagensExibidas}</Text>
                        <Text>Mensagens a exibir: {this.state.qtdMensagensExibir}</Text>
                    </View>

                    <View style={{ padding: 5 }}>
                        <Button
                            onPress={objMensagem.sincronizarMensagensComServidor}
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
                                    objMensagem.sincronizarMensagensComServidor().then(() => { this.exibirEstatisticas() })
                                }
                            }
                            title="Fazer os dois"
                            color="#ff00ff"
                        />

                    </View>
                </View>

                <Text>horaGeral[0,1]:{estado.horaGeral[0]}:{estado.horaGeral[1]} | horaGeral[2,3]:{estado.horaGeral[2]}:{estado.horaGeral[3]}</Text>

                <View style={styles.areaHoras} >
                    <ScrollView scrollEnabled={this.state.scrollEnabled}>

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

                            onTimeChange={(valor) => { estado.varTeste2 = valor; estado.horaGeral = valor; this.setState(estado); this.setHoraGeral(); }}
                        ></MasterSlider>

                    </ScrollView>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    areaTotal: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
    },
    areaConfiguracao: {
        flexGrow: 1,
        alignSelf: 'stretch',
        padding: 5
    },
    areaMenu: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: '#5FC594',
        width: '100%'
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
        flexShrink: 1,
        width: '100%',
        padding: 5,
        backgroundColor: 'black'
    }
});