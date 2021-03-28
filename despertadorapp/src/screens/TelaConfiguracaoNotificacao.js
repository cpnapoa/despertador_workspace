import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    Alert
} from 'react-native';
import Util, { clonarObjeto } from '../common/Util';
import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import BatteryWhitelist from "react-native-battery-whitelist";
import { TouchableOpacity } from 'react-native';

export default class TelaConfiguracaoNotificacao extends Component {

    constructor(props, value) {
        super();
        
        if(props) {
            if(props.navigation) {
                this.oNavegacao = props.navigation;
            }
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTela = this.oDadosApp.tela_configuracao;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oMensagem = new Mensagem();
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);
            this.verificarOtimizacaoBateria = this.verificarOtimizacaoBateria.bind(this);
            this.configurarAutoInicio = this.configurarAutoInicio.bind(this);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }   
        this.temConfiguracaoAutoInicio = false;
        this.estiloBotaoNotificacao = false;
        this.estiloTextoNotificacao = false;
        this.funcaoBotaoNotificacao = this.configurarAutoInicio;
    }
    async componentDidMount() {
        this.estiloBotaoNotificacao = clonarObjeto(styles.botao);
        this.estiloTextoNotificacao = clonarObjeto(styles.textoBotao);
        
        BatteryWhitelist.hasWhitelistIntent().then((hasIntent) => {
            
            this.temConfiguracaoAutoInicio = hasIntent;

            if(!hasIntent) {
                this.estiloBotaoNotificacao.backgroundColor = 'darkseagreen';
                this.estiloTextoNotificacao.color = 'gainsboro';
                this.funcaoBotaoNotificacao = () => {this.oUtil.exibirMensagem('Nenhuma liberação de notificação é necessária.', true)};
            }
            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        })
    }
    async configurarAutoInicio () {
        
        this.oUtil.exibirMensagem('A configuração de gerenciamento de energia do seu dispositivo será aberta.\n\nHabilite a opção de auto-inicialização para este aplicativo e desabilite as opções que bloqueiam aplicativos em suspensão (que não estão em uso).', true, async () =>{
            try {
                await BatteryWhitelist.startWhitelistActivity();
            } catch (error) {
                console.error(error);
            }
        });
    }
    
    verificarOtimizacaoBateria() {
        
        console.log('verificarOtimizacaoBateria...');
        RNDisableBatteryOptimizationsAndroid.isBatteryOptimizationEnabled().then((isEnabled)=>{
            console.log(`isBatteryOptimizationEnabled = ${isEnabled}`);
            if(isEnabled){
                RNDisableBatteryOptimizationsAndroid.enableBackgroundServicesDialogue();
                RNDisableBatteryOptimizationsAndroid.openBatteryModal();
            } else {
                this.oUtil.exibirMensagem('A otimização da bateria já está desabilitada para este aplicativo.', true);
            }
        });

        /**** */


        // const bool = await checkNotificationPermission();
        // console.log(bool);
        // changeNotificationSetting();

        /*** */

        // Permission.check('notification').then(response => {
        //     // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        //     console.log(response);
        // });

        /**** */
        //if(AutoStart..isCustomAndroid()) {
            //AutoStart.startAutostartSettings();
        //}

        //**** */

        // check(PERMISSIONS.ANDROID.RECEIVE_WAP_PUSH)
        // .then((result) => {
        //     switch (result) {
        //     case RESULTS.UNAVAILABLE:
        //         console.log('This feature is not available (on this device / in this context)');
        //         break;
        //     case RESULTS.DENIED:
        //         console.log('The permission has not been requested / is denied but requestable');
        //         break;
        //     case RESULTS.LIMITED:
        //         console.log('The permission is limited: some actions are possible');
        //         break;
        //     case RESULTS.GRANTED:
        //         console.log('The permission is granted');
        //         break;
        //     case RESULTS.BLOCKED:
        //         console.log('The permission is denied and not requestable anymore');
        //         break;
        //     }
        // })
        // .catch((error) => {
        //     console.error(error);
        // });

        //*** */
        
        // openSettings().catch(() => console.warn('cannot open settings'));

        //*** */

        // checkNotifications().then(({status, settings}) => {
        //     console.log(status);
        //     console.log(settings);
        // });
    }

    render() {
        
        return (
            <View style={styles.areaTotal}>
                <View style={styles.areaOpcao}>
                    <Text style={styles.textoInstrucao}>As configurações para otimizar o uso da bateria do seu dispositivo podem estar bloqueando as notificações do Despertador de Consciência.</Text>
                    <Text style={styles.textoInstrucao}>Para garantir que você receberá as mensagens corretamente, as otimizações de bateria devem ser desabilitadas.</Text>
                    <Text style={styles.textoInstrucao}>Para isso, utilize as opções abaixo.</Text>
                </View>
                    <TouchableOpacity
                        style={styles.botao}
                            accessibilityRole="button"
                            onPress={this.verificarOtimizacaoBateria}
                        >
                        <Text style={styles.textoBotao}>Normalizar uso de bateria</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                            style={this.estiloBotaoNotificacao}
                            accessibilityRole="button"
                            onPress={this.funcaoBotaoNotificacao}
                        >
                        <Text style={this.estiloTextoNotificacao}>Liberar notificações</Text>
                    </TouchableOpacity>
            </View>
        );
    }
}

TelaConfiguracaoNotificacao.contextType = ContextoApp;

const styles = StyleSheet.create({
    areaTotal: {
        flex: 1,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'flex-start',
        backgroundColor: '#faf9eb'
    },
    areaOpcao: {
        flexDirection:'column',
        justifyContent:'flex-start',
        backgroundColor: '#faf9eb',
        margin:20,
    },
    textoInstrucao: {
        margin:3,
        textAlign:'justify',
        fontSize:16
    },
    textoBotao: {
        textAlign:'center',
        fontSize:18,
    },
    botao: {
        flexDirection:'column',
        justifyContent:'center',
        borderRadius:5,
        backgroundColor: '#009999',
        width:'80%',
        height: '10%',
        margin:20,
        textAlign:'center',
        fontSize:18,
    },
});