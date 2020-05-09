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

        estado.h1 = estado.horaGeral[0].toString();
        estado.m1 = estado.horaGeral[1].toString();
        estado.h2 = estado.horaGeral[2].toString();
        estado.m2 = estado.horaGeral[3].toString();

        this.setState(estado);
    }

    render() {
        let estado = this.state;

        return (
            <View style={styles.areaTotal}>
                <View style={styles.areaConfiguracao}>

                    {/*VIEW COM OS INTERVALOS*/}
                    <View style={{ borderBottomWidth: 2 }}>

                        <Text style={styles.titulos}>Intervalos de exibição</Text>

                        <View style={styles.areaHoras} >
                            <ScrollView scrollEnabled={this.state.scrollEnabled} style={{ maxHeight: 150 }}>
                                <MasterSlider
                                    title='Intervalo 1'
                                    initialValues={[500, 1000]} //poderia inicializar o slider com o horário atual
                                    disableScroll={this.disableScroll} //essa linha é necessaria para não scrollar enquanto seleciona
                                    enableScroll={this.enableScroll} //essa linha é necessaria para não scrollar enquanto seleciona

                                    onTimeChange={(valor) => { estado.varTeste2 = valor; estado.horaGeral = valor; this.setState(estado); this.setHoraGeral(); }}
                                ></MasterSlider>
                                <MasterSlider
                                    title='Intervalo 2'
                                    initialValues={[500, 1000]} //poderia inicializar o slider com o horário atual
                                    disableScroll={this.disableScroll} //essa linha é necessaria para não scrollar enquanto seleciona
                                    enableScroll={this.enableScroll} //essa linha é necessaria para não scrollar enquanto seleciona

                                    onTimeChange={(valor) => { estado.varTeste2 = valor; estado.horaGeral = valor; this.setState(estado); this.setHoraGeral(); }}
                                ></MasterSlider>
                            </ScrollView>
                        </View>

                        <View style={styles.areaBotao}>
                            <Button title='ADD' onPress={() => {
                                Alert.alert('adiciona um novo slider para seleção de novo intervalo')
                            }} />
                            <Button title='Remove' onPress={() => {
                                Alert.alert('habilita o delete de intervalos quando o usuário tocar em um deles')
                            }} />
                        </View>
                    </View>


                    {/*VIEW COM OS HORÁRIOS FIXOS*/}
                    <View style={{ borderBottomWidth: 2, justifyContent: 'space-around' }}>
                        <Text style={styles.titulos}> Horários Fixos</Text>

                        <View style={styles.areaHoraFixa}>

                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                                <View style={styles.intervaloFixo}>

                                    <Text>Horário: </Text>
                                    <TextInput style={{ textAlign: 'right' }} placeholder="HH" size={10} value={estado.h1} onChangeText={(valor) => { estado.h1 = valor; this.setState(estado); }}></TextInput>
                                    <Text>h </Text>
                                    <TextInput style={{ textAlign: 'right' }} placeholder="mm" size={10} value={estado.m1} onChangeText={(valor) => { estado.m1 = valor; this.setState(estado); }}></TextInput>
                                    <Text>min</Text>
                                </View>

                                <Button title='Adicionar' onPress={() => {
                                    Alert.alert('adiciona um novo horário fixo na lista ao lado')
                                }} />

                            </View>

                            <View style={styles.areaHoras, { maxHeight: 50 }}>
                                <ScrollView>
                                    <Text style={{}}>hora fixa 1 (botao remover)</Text>
                                    <Text style={{}}>hora fixa 2 (botao remover)</Text>
                                    <Text style={{}}>hora fixa 3 (botao remover)</Text>
                                    <Text style={{}}>hora fixa 4 (botao remover)</Text>
                                    <Text style={{}}> . . . </Text>
                                </ScrollView>
                            </View>


                        </View>

                    </View>

                    <View style={styles.areaHorasStats}>
                        <Text>Hora aletoria entre {this.state.dh1} e {this.state.dh2} => {this.state.horaNotificacao}</Text>
                        <Button title='Testar hora aleatória' onPress={this.agendarNotificacao} ></Button>
                    </View>

                    <View style={{ padding: 5 }}>
                        <Text style={styles.titulos}>Estatísticas</Text>
                        <Text>Mensagens exibidas: {this.state.qtdMensagensExibidas}</Text>
                        <Text>Mensagens a exibir: {this.state.qtdMensagensExibir}</Text>

                        <Button
                            onPress={
                                //o .then não está funcionando. this.exibirEstatisticas nao espera o outro método acabar para ser executado
                                () => {
                                    objMensagem.sincronizarMensagensComServidor().then(() => { this.exibirEstatisticas() })
                                }
                            }
                            title="Buscar novas mensagens e atualizar contadores"
                            color="blue"
                        />
                    </View>
                </View>



            </View>
        );
    }
}

const styles = StyleSheet.create({
    areaTotal: {
        flex: 1,
        maxHeight: '100%',
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

    areaHoras: {
        //flexShrink: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 5,
        //backgroundColor: 'blue'
    },

    areaBotao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 10,
    },

    areaHoraFixa: {
        flexDirection: 'row',
    },

    intervaloFixo: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },



    areaEstatisticas: {

    },

    areaHorasStats: {
        borderBottomWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },

    titulos: {
        fontSize: 25,
        alignSelf: 'center',
        padding: 5,
    }

});