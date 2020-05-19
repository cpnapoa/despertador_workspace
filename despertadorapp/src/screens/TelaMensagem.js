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
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oMensagem = new Mensagem();
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp);
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
            
            AppState.addEventListener('change', this.oConfiguracao.salvarConfiguracoes);
        }

        this.exibirProximaMensagem = this.exibirProximaMensagem.bind(this);

        if(this.oMensagem) {

            this.oMensagem.sincronizarMensagensComServidor();
        }

        if(this.oConfiguracao) {

            this.oConfiguracao.configurarNotificacao(this, this.oNavegacao, this.oDadosControleApp);
        }
    }

    componenDidMount(a) {
        console.log('a = ' + a);
    }

    async exibirProximaMensagem() {
        this.oDadosApp.mensagem.texto = await this.oMensagem.obterProximaMensagem();
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }
    
    render() {
        
        return (
            
            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back.png')} style={styles.imgBG} resizeMode='stretch'>
                    <View style={{flex: 0.15, flexDirection:'row', alignSelf:'stretch', justifyContent:'flex-end'}} >
                        <TouchableOpacity onPress={() => this.oNavegacao.navigate('Configuracao')}>
                            <Image source={require('../images/botao_cera.png')} resizeMode='stretch' style={{width:85, height:95, marginRight:40, justifyContent:'center'}} >
                                <Icon name="cog" size={25} color="#4d0000" style={{margin: 23}}/>
                            </Image>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 0.70, margin: 50, flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                        <Text style={styles.formataFrase}>
                            {this.oDadosApp.mensagem.texto}
                        </Text>
                    </View>
                    <View style={{flex: 0.15, marginTop: 20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                      
                    </View>
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
        fontSize: 50,
        textAlign: 'center',
        fontFamily: 'ErisblueScript'
    }
});