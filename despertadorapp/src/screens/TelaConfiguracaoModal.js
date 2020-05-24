import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    Button,
    Text,
} from 'react-native';
import Util, { clonarObjeto } from '../common/Util';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { DADOS_INTERVALO, DIAS_SEMANA } from '../contexts/DadosAppGeral';
import TextInputMask from 'react-native-text-input-mask';
import { Divider, Card } from 'react-native-elements';
import CheckBox from '@react-native-community/checkbox';

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
            this.oDadosTela = this.oDadosApp.tela_configuracao_modal;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.atribuirDataHora = this.atribuirDataHora.bind(this);
        this.adicionarIntervalo = this.adicionarIntervalo.bind(this);
        this.montarDiasSemana = this.montarDiasSemana.bind(this);
        this.voltar = this.voltar.bind(this);
        this.obterConfiguracoesNoDispositivo = this.obterConfiguracoesNoDispositivo.bind(this);

        this.oMensagem = new Mensagem();
        this.oUtil = new Util();
        
        this.oDadosTela.h1 = 0;
        this.oDadosTela.m1 = 0;
        this.oDadosTela.h2 = 0;
        this.oDadosTela.m2 = 0;        
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

        if(this.oDadosTela.dom) {
            this.oConfiguracao.adicionarIntervaloDiaSemana(0, oNovoIntervalo, 1);
        }
        
        if(this.oDadosTela.seg) {
            this.oConfiguracao.adicionarIntervaloDiaSemana(1, oNovoIntervalo, 1);
        }

        if(this.oDadosTela.ter) {
            this.oConfiguracao.adicionarIntervaloDiaSemana(2, oNovoIntervalo, 1);
        }

        if(this.oDadosTela.qua) {
            this.oConfiguracao.adicionarIntervaloDiaSemana(3, oNovoIntervalo, 1);
        }
        if(this.oDadosTela.qui) {
            this.oConfiguracao.adicionarIntervaloDiaSemana(4, oNovoIntervalo, 1);
        }

        if(this.oDadosTela.sex) {
            this.oConfiguracao.adicionarIntervaloDiaSemana(5, oNovoIntervalo, 1);
        }

        if(this.oDadosTela.sab) {
            this.oConfiguracao.adicionarIntervaloDiaSemana(6, oNovoIntervalo, 1);
        }

        this.voltar();
    }

    excluirIntervalo(diaSemana, indice) {

        this.oConfiguracao.excluirIntervaloDiaSemana(diaSemana, indice);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    voltar() {
        this.oConfiguracao.salvarConfiguracoes(true);
        this.oNavegacao.goBack();
        this.oGerenciadorContextoApp.atualizarEstadoTela(this.oDadosApp.tela_configuracao.objeto_tela);
    }

    atribuirDataHora(num, valor) {
        let valores;

        if(valor.length == 5) {
            valores = valor.split(':');
     
            if(num == 1) {
                this.oDadosTela.h1 = valores[0];
                this.oDadosTela.m1 = valores[1];
            } else if(num == 2) {
                this.oDadosTela.h2 = valores[0];
                this.oDadosTela.m2 = valores[1];
            }

            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        }
    }

    montarDiasSemana() {
            
        return(
        <Card title='Dias da semana'>
            <View style={{ flexDirection:'column', alignItems:'flex-start'}}>
                <View style={{ flexDirection:'row', alignItems:'center'}}>
                    <CheckBox value={this.oDadosTela.seg} 
                              onValueChange={value => {this.oDadosTela.seg = value; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}} /><Text>Seg</Text>
                    <CheckBox value={this.oDadosTela.ter} 
                              onValueChange={value => {this.oDadosTela.ter = value; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}} /><Text>Ter</Text>
                    <CheckBox value={this.oDadosTela.qua} 
                              onValueChange={value => {this.oDadosTela.qua = value; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}/><Text>Qua</Text>
                    <CheckBox value={this.oDadosTela.qui} 
                              onValueChange={value => {this.oDadosTela.qui = value; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}/><Text>Qui</Text>
                    <CheckBox value={this.oDadosTela.sex} 
                              onValueChange={value => {this.oDadosTela.sex = value; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}/><Text>Sex</Text>
                </View>
                <View style={{ flexDirection:'row', alignItems:'center'}}>
                    <CheckBox value={this.oDadosTela.sab} 
                              onValueChange={value => {this.oDadosTela.sab = value; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}/><Text>Sab</Text>
                    <CheckBox value={this.oDadosTela.dom} 
                              onValueChange={value => {this.oDadosTela.dom = value; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}/><Text>Dom</Text>
                </View>
            </View>
        </Card>)
    }

    render() {
        
        return (
            <View style={styles.areaTotal}>
                <View style={styles.areaIntervaloDefinicao}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        {this.montarDiasSemana()}
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Text>Hora inicial</Text>
                        <TextInputMask mask={"[00]:[00]"} placeholder="HH:mm" 
                        onChangeText={(valor) => { this.atribuirDataHora(1, valor); }}></TextInputMask>

                        <Text>Hora final: </Text>
                        <TextInputMask mask={"[00]:[00]"} placeholder="HH:mm" 
                        onChangeText={(valor) => { this.atribuirDataHora(2, valor); }}></TextInputMask>
                    </View>
                </View>
                <View style={{ flex: .4, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Button title='Adicionar' onPress={this.adicionarIntervalo} ></Button>
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
        justifyContent:'space-between',
        backgroundColor: '#F9F8E7'
    },
    areaIntervaloDefinicao: {
        flex: .4,
        flexDirection:'column', 
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignContent: 'stretch',
        backgroundColor: 'red'
    },
});