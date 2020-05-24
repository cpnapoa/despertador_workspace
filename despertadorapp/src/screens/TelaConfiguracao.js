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
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { DADOS_INTERVALO, DIAS_SEMANA } from '../contexts/DadosAppGeral';
import { Card, Divider, Input } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import NumericInput from 'react-native-numeric-input';

export default class TelaConfiguracao extends Component {

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
        this.oDadosTela.objeto_tela = this;
        this.exibirEstatisticas = this.exibirEstatisticas.bind(this);
        this.adicionarIntervalo = this.adicionarIntervalo.bind(this);
        this.voltar = this.voltar.bind(this);
        this.obterConfiguracoesNoDispositivo = this.obterConfiguracoesNoDispositivo.bind(this);

        this.oMensagem = new Mensagem();
        this.oUtil = new Util();

        this.obterConfiguracoesNoDispositivo();
        this.exibirEstatisticas();
    }

    async obterConfiguracoesNoDispositivo() {
        let oListaIntervalos = await this.oConfiguracao.obterAgendaNotificacoesDoDispositivo();
        
        if(oListaIntervalos) {
            this.oDadosTela.agenda_notificacoes = oListaIntervalos;
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

    adicionarIntervalo() {
        this.oNavegacao.navigate('Configuracao Intervalo');
        // let oNovoIntervalo = clonarObjeto(DADOS_INTERVALO);
        
        // oNovoIntervalo.hora_inicial.hora = this.oDadosTela.h1;
        // oNovoIntervalo.hora_inicial.minuto = this.oDadosTela.m1;
        // oNovoIntervalo.hora_final.hora = this.oDadosTela.h2;
        // oNovoIntervalo.hora_final.minuto = this.oDadosTela.m2;
        // //oNovoIntervalo.qtd_mensagens_intervalo = 1;

        // // Dia da semana = 7, indica que nao tem dia definido e todos os dias terão os mesmos intervalos.
        // let diaSemana = 6;
        
        // this.oConfiguracao.adicionarIntervaloDiaSemana(diaSemana, oNovoIntervalo, 3);

        // diaSemana = 5;
        
        // this.oConfiguracao.adicionarIntervaloDiaSemana(diaSemana, oNovoIntervalo, 2);
                
        // this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    excluirIntervalo(diaSemana, indice) {

        this.oConfiguracao.excluirIntervaloDiaSemana(diaSemana, indice);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    atribuirMensagensPorDia(diaSemana, qtdMensagensDia) {
        this.oConfiguracao.atribuirMensagensPorDia(diaSemana, qtdMensagensDia)
    }

    listarHoras() {
        let oAgendaIntervalosDias = this.oDadosTela.agenda_notificacoes.agenda_intervalos_dias;
        let oListaIntervalos;        
        let oIntervalo;
        let oHoras;
        let oListaExibicao = [];
        let dataHoraAtualExibir;
        let oDataHoraAtual;
        let chaveItem;

        if(oAgendaIntervalosDias && oAgendaIntervalosDias.length > 0)
        {
            oAgendaIntervalosDias.forEach(oDiaSemana => {
                
                if(oDiaSemana) {
                    oListaIntervalos = oDiaSemana.intervalos;
                    
                    for(let i = 0; i < oListaIntervalos.length; i++) {
                        oIntervalo = oListaIntervalos[i];
                        if(oIntervalo) {
                            oHoras = oIntervalo.horas_exibicao;
                            
                            if(!oHoras || oHoras.length === 0) {
                                oHoras = [];
                                oHoras[0] = null;
                            }
                                
                            for(let t = 0; t < oHoras.length; t++) {
                                chaveItem = `${oDiaSemana.dia_semana}${i}${t}`;
                                dataHoraAtualExibir = '';
                                
                                if(oHoras[t]) {
                                    oDataHoraAtual = new Date(oHoras[t]);
                                    dataHoraAtualExibir = oDataHoraAtual.toLocaleTimeString();
                                }
                                oListaExibicao.push(

                                    <View key={chaveItem} style={{flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'space-between' }}>
                                        
                                        <Text style={{marginRight:10}}>
                                            {oIntervalo.qtd_mensagens_intervalo}
                                        </Text>
                                        <Text >{oIntervalo.hora_inicial.hora}:{oIntervalo.hora_inicial.minuto}:00 às  
                                        {oIntervalo.hora_final.hora}:{oIntervalo.hora_final.minuto}:59 = {dataHoraAtualExibir}</Text>
                                        <Icon name='trash' size={15} style={{ marginLeft:10 }} onPress={() => this.excluirIntervalo(oDiaSemana.dia_semana, i)}></Icon>
                                    </View>                                    
                                )
                            }
                        }
                    }
                }                
            });
        }
        return oListaExibicao;
    }

    listarHorasDia(oDiaSemana) {
        let oAgendaIntervalosDias = this.oDadosTela.agenda_notificacoes.agenda_intervalos_dias;
        let oListaIntervalos;        
        let oIntervalo;
        let oHoras;
        let oListaExibicao = [];
        let dataHoraAtualExibir;
        let oDataHoraAtual;
        let chaveItem;

        if(oDiaSemana) {
            oListaIntervalos = oDiaSemana.intervalos;
            
            for(let i = 0; i < oListaIntervalos.length; i++) {
                oIntervalo = oListaIntervalos[i];
                if(oIntervalo) {
                    oHoras = oIntervalo.horas_exibicao;
                    
                    if(!oHoras || oHoras.length === 0) {
                        oHoras = [];
                        oHoras[0] = null;
                    }
                        
                    for(let t = 0; t < oHoras.length; t++) {
                        chaveItem = `${oDiaSemana.dia_semana}${i}${t}`;
                        dataHoraAtualExibir = '';
                        
                        if(oHoras[t]) {
                            oDataHoraAtual = new Date(oHoras[t]);
                            dataHoraAtualExibir = oDataHoraAtual.toLocaleTimeString();
                        }
                        oListaExibicao.push(

                            <View key={chaveItem} style={{flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'space-between' }}>
                                
                                <Text style={{marginRight:10}}>
                                    {oIntervalo.qtd_mensagens_intervalo}
                                </Text>
                                <Text >{oIntervalo.hora_inicial.hora}:{oIntervalo.hora_inicial.minuto}:00 às  
                                {oIntervalo.hora_final.hora}:{oIntervalo.hora_final.minuto}:59 = {dataHoraAtualExibir}</Text>
                                <Icon name='trash' size={15} style={{ marginLeft:10 }} onPress={() => this.excluirIntervalo(oDiaSemana.dia_semana, i)}></Icon>
                            </View>                                    
                        )
                    }
                }
            }
        }
        return oListaExibicao;
    }

    listarDiasSemana() {
        let oAgendaIntervalosDias = this.oDadosTela.agenda_notificacoes.agenda_intervalos_dias;
        let oListaExibicao = [];
        let tituloDia;

        if(oAgendaIntervalosDias && oAgendaIntervalosDias.length > 0)
        {
            oAgendaIntervalosDias.forEach(oDiaSemana => {
                
                if(oDiaSemana) {
                    tituloDia = `${DIAS_SEMANA[oDiaSemana.dia_semana]}`;

                    oListaExibicao.push(
                        <Card key={oDiaSemana.dia_semana} containerStyle={{width:300}} dividerStyle={{ width:0 }} title={tituloDia} >
                            <View  style={{flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'flex-start' }}>
                                <Text>Mensagens por dia: </Text>
                                <NumericInput type='up-down' minValue={1} maxValue={5} value={oDiaSemana.qtd_mensagens_dia} onChange={value => {this.atribuirMensagensPorDia(oDiaSemana.dia_semana, value); this.oGerenciadorContextoApp.atualizarEstadoTela(this);}} ></NumericInput>                                            
                            </View>
                            <Divider></Divider>
                            {this.listarHorasDia(oDiaSemana)}    
                        </Card>
                    )                            
                }                
            });
        }
        if(!oListaExibicao || oListaExibicao.length == 0) {
            return <Text>Nenhum intervalo definido.</Text>
        }

        return oListaExibicao;
    }

    voltar() {
        this.oConfiguracao.salvarConfiguracoes(true);
        this.oNavegacao.goBack();
    }

    render() {
        let oProximaDataHora;
        let proximaDataHora = 'indefinida.';
        let oDadosUltimaDataHoraAgendada = this.oDadosTela.agenda_notificacoes.ultima_data_hora_agendada;

        if(oDadosUltimaDataHoraAgendada && oDadosUltimaDataHoraAgendada.data_hora_agenda) {
            oProximaDataHora = new Date(oDadosUltimaDataHoraAgendada.data_hora_agenda);
            proximaDataHora = `${oProximaDataHora.toLocaleString()}`;
        }

        return (
            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back_edge.png')} style={styles.imgBG} resizeMode='stretch'>
                    <View style={{flex: 0.10, flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'flex-start'}} >
                        <Icon name="caret-left" size={40} color="#022C18" style={{marginLeft: 55}}  onPress={this.voltar} />
                    </View>
                    <SafeAreaView style={{flex: 0.75}}>
                        <ScrollView   >
                            {this.listarDiasSemana()}
                        </ScrollView>
                    </SafeAreaView>
                    <View style={{flex: 0.15, marginTop: 20, flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'flex-end'}}>
                        <Icon name="plus-circle" size={40} color="#022C18" style={{marginRight: 55}}  onPress={this.adicionarIntervalo} />
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
    areaIntervaloDefinicao: {
        flex: .35,
        flexDirection:'column', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
});