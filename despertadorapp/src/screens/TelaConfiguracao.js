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
import { Card } from 'react-native-elements';

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
        let oNovoIntervalo = clonarObjeto(DADOS_INTERVALO);
        
        oNovoIntervalo.hora_inicial.hora = this.oDadosTela.h1;
        oNovoIntervalo.hora_inicial.minuto = this.oDadosTela.m1;
        oNovoIntervalo.hora_final.hora = this.oDadosTela.h2;
        oNovoIntervalo.hora_final.minuto = this.oDadosTela.m2;
        //oNovoIntervalo.qtd_mensagens_intervalo = 1;

        // Dia da semana = 7, indica que nao tem dia definido e todos os dias terão os mesmos intervalos.
        let diaSemana = 4;
        
        this.oConfiguracao.adicionarIntervaloDiaSemana(diaSemana, oNovoIntervalo, 3);

        diaSemana = 5;
        
        this.oConfiguracao.adicionarIntervaloDiaSemana(diaSemana, oNovoIntervalo, 2);
                
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    excluirIntervalo(diaSemana, indice) {

        this.oConfiguracao.excluirIntervaloDiaSemana(diaSemana, indice);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
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
                                        <Text style={{marginRight:5}}>
                                            {DIAS_SEMANA[oDiaSemana.dia_semana]}
                                        </Text>
                                        <Text style={{marginRight:5}}>
                                            {oDiaSemana.qtd_mensagens_dia}
                                        </Text>
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
                        <View >
                            <Text>Proxima data/ hora agendada: {proximaDataHora}</Text>
                        </View>
                        <Card style={{flex:.2}} title='Agenda de intervalos'>
                            
                                {this.listarHoras()}
                            
                        </Card>
                    </View>
                    <View style={{flex: 0.15, marginTop: 20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                    
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
        flex: .75,
        flexDirection:'column', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    areaEstatisticas: {

    },
    areaBotao: {

    },
    areaHoras: {
        flex: .38,
        
        padding: 5,
        backgroundColor: 'black'
    }
});