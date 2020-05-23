import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    Button,
    Text,
    TextInput,
} from 'react-native';
import Util, { clonarObjeto } from '../common/Util';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { DADOS_INTERVALO, DIAS_SEMANA } from '../contexts/DadosAppGeral';

export default class TelaConfiguracaoModal extends Component {

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
            this.oDadosTela = this.oDadosApp.tela_configuracao;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.adicionarIntervalo = this.adicionarIntervalo.bind(this);
        this.voltar = this.voltar.bind(this);
        this.obterConfiguracoesNoDispositivo = this.obterConfiguracoesNoDispositivo.bind(this);

        this.oMensagem = new Mensagem();
        this.oUtil = new Util();
    }

    async obterConfiguracoesNoDispositivo() {
        let oListaIntervalos = await this.oConfiguracao.obterAgendaNotificacoesDoDispositivo();
        
        if(oListaIntervalos) {
            this.oDadosTela.agenda_notificacoes = oListaIntervalos;
        }
    }

    adicionarIntervalo() {
        let oNovoIntervalo = clonarObjeto(DADOS_INTERVALO);
        
        oNovoIntervalo.hora_inicial.hora = this.oDadosTela.h1;
        oNovoIntervalo.hora_inicial.minuto = this.oDadosTela.m1;
        oNovoIntervalo.hora_final.hora = this.oDadosTela.h2;
        oNovoIntervalo.hora_final.minuto = this.oDadosTela.m2;
        //oNovoIntervalo.qtd_mensagens_intervalo = 1;

        // Dia da semana = 7, indica que nao tem dia definido e todos os dias terão os mesmos intervalos.
        let diaSemana = 6;
        
        this.oConfiguracao.adicionarIntervaloDiaSemana(diaSemana, oNovoIntervalo, 3);

        diaSemana = 5;
        
        this.oConfiguracao.adicionarIntervaloDiaSemana(diaSemana, oNovoIntervalo, 2);
                
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    excluirIntervalo(diaSemana, indice) {

        this.oConfiguracao.excluirIntervaloDiaSemana(diaSemana, indice);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    voltar() {
        this.oConfiguracao.salvarConfiguracoes(true);
        this.oNavegacao.goBack();
    }

    render() {
       
        return (
            <View style={styles.areaTotal}>
                    <View style={{flex: 0.10, flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'flex-start'}} >
                        <Icon name="caret-left" size={40} color="#022C18" style={{marginLeft: 55}}  onPress={this.voltar} />
                    </View>
                    <View style={styles.areaIntervaloDefinicao}>
                        <Text>Hora inicial</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <TextInput textAlign='right' placeholder="HH" size={10} value={this.oDadosTela.h1} onChangeText={(valor) => { this.oDadosTela.h1 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                            <Text>h </Text>
                            <TextInput textAlign='right' placeholder="mm" size={10} value={this.oDadosTela.m1} onChangeText={(valor) => { this.oDadosTela.m1 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                            <Text>min</Text>                            
                        </View>

                        <Text>Hora final: </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>                            
                            <TextInput textAlign='right' placeholder="HH" size={10} value={this.oDadosTela.h2} onChangeText={(valor) => { this.oDadosTela.h2 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                            <Text>h </Text>
                            <TextInput textAlign='right' placeholder="mm" size={10} value={this.oDadosTela.m2} onChangeText={(valor) => { this.oDadosTela.m2 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                            <Text>min</Text>                            
                        </View>

                        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <Button title='Adicionar' onPress={this.adicionarIntervalo} ></Button>
                        </View>
                        <View >
                            <Text>Mensagens exibidas: {this.oDadosTela.qtd_mensagens_exibidas}</Text>
                            <Text>Mensagens a exibir: {this.oDadosTela.qtd_mensagens_exibir}</Text>
                        </View>
                        
                    </View>
                    <View style={{flex: 0.15, marginTop: 20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                    
                    </View>
            </View>
        );
    }
}

TelaConfiguracaoModal.contextType = ContextoApp;

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
    areaIntervaloDefinicao: {
        flex: .35,
        flexDirection:'column', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
});