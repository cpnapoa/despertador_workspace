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
        this.exibirTimePicker = this.exibirTimePicker.bind(this);
        this.montarTimePicker = this.montarTimePicker.bind(this);
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
        
        if(!this.oDadosTela.dom &&
           !this.oDadosTela.seg &&
           !this.oDadosTela.ter &&
           !this.oDadosTela.qua &&
           !this.oDadosTela.qui &&
           !this.oDadosTela.sex) {
        
            Alert.alert('Despertador de Conscência', 'Selecione ao menos um dia da semana.');
            return;
        }

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

        this.oConfiguracao.salvarConfiguracoes(true);

        this.voltar();
    }

    excluirIntervalo(diaSemana, indice) {

        this.oConfiguracao.excluirIntervaloDiaSemana(diaSemana, indice);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    voltar() {
        
        this.oNavegacao.goBack();
        this.oGerenciadorContextoApp.atualizarEstadoTela(this.oDadosApp.tela_configuracao.objeto_tela);
    }

    atribuirDataHora(num, valor) {
        this.oDadosTela.num_hora_escolher = 0;

        if(valor) {
                 
            if(num == 1) {
                this.oDadosTela.h1 = valor.getHours();
                this.oDadosTela.m1 = valor.getMinutes();
            } else if(num == 2) {
                this.oDadosTela.h2 = valor.getHours();
                this.oDadosTela.m2 = valor.getMinutes();
            }

            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        }
    }

    montarDiasSemana() {
            
        return(
        <Card title='Dias da semana' containerStyle={{ width:300, backgroundColor: '#f0f5f5', borderWidth: 0, borderRadius:5}}>
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

    exibirTimePicker(numHora) {
        this.oDadosTela.num_hora_escolher = numHora;
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    montarTimePicker(numHora) {
        if(numHora) {
            return(
            <DateTimePicker
            testID="dateTimePicker"
            timeZoneOffsetInMinutes={0}
            value={new Date().getTime()}
            mode='time'
            is24Hour={true}
            display="clock"
            onChange={(event, valor) => { this.atribuirDataHora(numHora, valor);}}
            />
            )
        }
    }

    render() {
        let h1 = `${this.oDadosTela.h1}`.padStart(2, '0');
        let m1 = `${this.oDadosTela.m1}`.padStart(2, '0');

        let h2 = `${this.oDadosTela.h2}`.padStart(2, '0');
        let m2 = `${this.oDadosTela.m2}`.padStart(2, '0');

        return (
            <View style={styles.areaTotal}>
                <View style={{flex: 0.1, borderBottomWidth:1, marginBottom: 10,  borderColor:'#e0ebeb', flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'space-between'}} >
                    <Icon name="caret-left" size={40} color="#009999" style={{marginLeft: 40}}  onPress={this.voltar} />
                    <Text style={{marginRight: 50, fontSize: 24}}>Inclusão de Intervalo</Text>
                </View>
                <View style={styles.areaIntervaloDefinicao}>
                    <View style={{flexDirection:'row', alignItems:'center' }}>
                        {this.montarDiasSemana()}
                    </View>
                    <Card title='Novo Intervalo' containerStyle={{ alignItems:'center', width:300, marginTop:30, backgroundColor: '#f0f5f5', borderWidth: 0, borderRadius:5}} >
                        <TouchableOpacity onPress={() => this.exibirTimePicker(1)} 
                                            style={{flexDirection:'column', width:300, alignItems:'center', marginTop: 0, borderRadius:5, borderWidth:1, borderColor:'#e0ebeb'}}>
                            <Text style={{margin:10, marginTop: 5, fontSize:20}}>Hora inicial</Text>
                            <Text style={{margin:10, marginTop: 0, fontSize:24, borderStyle:'solid', borderRadius:5, borderWidth: 1, padding:5, paddingLeft:10, paddingRight:10}}>{h1}:{m1}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.exibirTimePicker(2)} 
                                            style={{flexDirection:'column', alignItems:'center', marginTop: 15, borderRadius:5, borderWidth:1, borderColor:'#e0ebeb'}}>
                            <Text style={{margin:10, fontSize:20}}>Hora final</Text>
                            <Text style={{margin:10, marginTop: 0, fontSize:24, borderStyle:'solid', borderRadius:5, borderWidth: 1, padding:5, paddingLeft:10, paddingRight:10}}>{h2}:{m2}</Text>
                            </TouchableOpacity>
                    </Card>
                    {this.montarTimePicker(this.oDadosTela.num_hora_escolher)}
                </View>
                <View style={{ flex: .1, margin: 3, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Button title='Adicionar' onPress={this.adicionarIntervalo} color={'#009999'}></Button>
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
        backgroundColor: '#faf9eb'
    },
    areaIntervaloDefinicao: {
        flex: .77,
        flexDirection:'column', 
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignContent: 'stretch',
    },
});