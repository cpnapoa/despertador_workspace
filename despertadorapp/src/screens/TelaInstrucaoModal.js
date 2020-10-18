import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    Button,
    Text,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Util from '../common/Util';

export default class TelaInstrucaoModal extends Component {
    
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
            this.oDadosTela = this.oDadosApp.tela_configuracao_modal;
            this.oUtil = new Util();
            this.oMensagem = new Mensagem(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        
    }

    voltar() {
        
        this.oNavegacao.goBack();
    }

    render() {

        return (
            <View style={styles.areaTotal}>
                <View style={{flex: 0.1, borderBottomWidth:1, marginBottom: 10,  borderColor:'#e0ebeb', flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'space-between'}} >
                    <View style={{alignSelf:'center', width:50, alignItems:'center', justifyContent:'flex-end'}}>
                        <TouchableOpacity onPress={this.voltar} style={{alignItems:'stretch'}}>
                            <Icon name="arrow-left" size={40} color="#009999" />
                        </TouchableOpacity>
                    </View>
                    <View style={{alignSelf:'center', alignItems:'center', justifyContent:'center'}}>
                        <Text style={{fontSize: 24}}>Ajuda</Text>
                    </View>
                    <View style={{alignSelf:'center', width:50, alignItems:'center', justifyContent:'flex-end'}}>                        
                    </View>
                </View>
                <View style={styles.areaIntervaloDefinicao}>
                    <Text>Instruções aqui...</Text>
                </View>
                <View style={{ flex: .17, margin: 3, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    
                </View>
            </View>
        );
    }
}

TelaInstrucaoModal.contextType = ContextoApp;

const styles = StyleSheet.create({
    areaTotal: {
        flex: 1,
        flexDirection:'column',
        alignItems:'stretch',
        justifyContent:'space-between',
        backgroundColor: '#faf9eb'
    },
    areaIntervaloDefinicao: {
        flex: .70,
        flexDirection:'column', 
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignContent: 'stretch',
    },
});