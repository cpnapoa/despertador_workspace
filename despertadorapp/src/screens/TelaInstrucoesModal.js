import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    Button,
    Text,
    Alert,
} from 'react-native';
import Util, { clonarObjeto } from '../common/Util';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { DADOS_INTERVALO, DIAS_SEMANA } from '../contexts/DadosAppGeral';
import { Divider, Card } from 'react-native-elements';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class TelaInstrucoesModal extends Component {
    
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
            this.oDadosTela = this.oDadosApp.tela_configuracao_modal;
            this.oDadosTelaConfiguracao = this.oDadosApp.tela_configuracao;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.voltar = this.voltar.bind(this);
        this.obterConfiguracoesNoDispositivo = this.obterConfiguracoesNoDispositivo.bind(this);

        this.oMensagem = new Mensagem();
        this.oUtil = new Util();

        // configurarNotificacao(this.oNavegacao, this.oDadosControleApp);
    }

    async obterConfiguracoesNoDispositivo() {
        let oListaIntervalos = await this.oConfiguracao.obterAgendaNotificacoesDoDispositivo();
        
        if(oListaIntervalos) {
            this.oDadosTelaConfiguracao.agenda_notificacoes = oListaIntervalos;
        }
    }

 
    voltar() {
        
        this.oNavegacao.goBack();
        this.oGerenciadorContextoApp.atualizarEstadoTela(this.oDadosApp.tela_configuracao.objeto_tela);
    }

  
  
    render() {


        return (
            <View style={styles.areaTotal}>
                <View style={{flex: 0.1, borderBottomWidth:1, marginBottom: 10,  borderColor:'#e0ebeb', flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'space-between'}} >
                    <View style={{alignSelf:'center', width:50, alignItems:'center', justifyContent:'flex-end'}}>
                        <TouchableOpacity onPress={this.voltar} style={{alignItems:'stretch'}}>
                            <Icon name="caret-left" size={40} color="#009999" />
                        </TouchableOpacity>
                    </View>
                    <View style={{alignSelf:'center', alignItems:'center', justifyContent:'center'}}>
                        <Text style={{fontSize: 24}}>Tela de instruções</Text>
                    </View>
                    <View style={{alignSelf:'center', width:50, alignItems:'center', justifyContent:'flex-end'}}>                        
                    </View>
                </View>
                <View style={styles.areaIntervaloDefinicao}>
                    
                </View>
            </View>
        );
    }
}

TelaInstrucoesModal.contextType = ContextoApp;

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