import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
} from 'react-native';
import Util, { clonarObjeto } from '../common/Util';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { DIAS_SEMANA } from '../contexts/DadosAppGeral';
import { Card, Divider, Input } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputSpinner from "react-native-input-spinner";
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class TelaConfiguracao extends Component {

    constructor(props, value) {
        super(props);

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
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        this.oDadosTela.objeto_tela = this;
        this.oDadosTela.ver_detalhes = false;
        this.adicionarIntervalo = this.adicionarIntervalo.bind(this);
        this.listarDiasSemana = this.listarDiasSemana.bind(this);
        this.listarHorasDia = this.listarHorasDia.bind(this);
        this.voltar = this.voltar.bind(this);
        this.verDetalhes = this.verDetalhes.bind(this);
        this.verDataHoraAgendada = this.verDataHoraAgendada.bind(this);

        this.oMensagem = new Mensagem();
        this.oUtil = new Util();
    }
    
    adicionarIntervalo() {
        this.oNavegacao.navigate('Configuracao Intervalo');
    }

    excluirIntervalo(diaSemana, indice) {

        this.oConfiguracao.excluirIntervaloDiaSemana(diaSemana, indice);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    atribuirMensagensPorDia(diaSemana, qtdMensagensDia) {
        this.oConfiguracao.atribuirMensagensPorDia(diaSemana, qtdMensagensDia, () => {this.oGerenciadorContextoApp.atualizarEstadoTela(this);});
    }

    verDetalhes() {
        
        this.oDadosTela.ver_detalhes = !this.oDadosTela.ver_detalhes;
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    listarDiasSemana() {
        let oAgendaIntervalosDias = this.oDadosTela.agenda_notificacoes.agenda_intervalos_dias;
        let oListaExibicao = [];
        let oListaIntervalos; 
        let tituloDia;

        if(oAgendaIntervalosDias && oAgendaIntervalosDias.length > 0)
        {
            oAgendaIntervalosDias.forEach(oDiaSemana => {
                
                if(oDiaSemana) {
                    tituloDia = `${DIAS_SEMANA[oDiaSemana.dia_semana]}`;
                    oListaIntervalos = this.listarHorasDia(oDiaSemana);
                    
                    oListaExibicao.push(
                        <Card key={oDiaSemana.dia_semana} 
                            title={
                            <View style={{flexDirection:'row', alignSelf:'stretch', justifyContent:'space-between'}}>
                                <View style={{ alignSelf:'flex-start', width:80}}>
                                </View>
                                <View style={{flexDirection:'row', alignSelf:'center', justifyContent:'center'}}>
                                    <Text style={{fontSize:16}}>{tituloDia}</Text>
                                </View>
                                <View style={{flexDirection:'row', alignSelf:'flex-end', width:80, alignItems:'center', justifyContent:'flex-end'}}>
                                </View>
                            </View>} 
                            containerStyle={{backgroundColor: '#f0f5f5', borderWidth: 0, borderRadius:5, flexDirection:'column', width:300}} 
                        >
                            <Divider style={{margin:10}}></Divider>

                            {oListaIntervalos}
                            
                            <Divider style={{margin:10}}></Divider>
                            <View  style={{flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'center' }}>
                                <Text>Mensagens por dia</Text>
                                <InputSpinner 
                                    type='int' 
                                    style={{width:80, height:25, alignItems:'center', marginLeft:10}} 
                                    inputStyle={{fontSize:14}} 
                                    buttonStyle={{height:25, width:25, padding:0, backgroundColor:'#009999'}} 
                                    rounded={false} 
                                    showBorder={true} 
                                    step={1} min={1} 
                                    max={5} 
                                    value={oDiaSemana.qtd_mensagens_dia} 
                                    onChange={value => {this.atribuirMensagensPorDia(oDiaSemana.dia_semana, value); this.oGerenciadorContextoApp.atualizarEstadoTela(this);}} 
                                >
                                </InputSpinner>
                            </View>
                        </Card>
                    )                            
                }                
            });
        }
        if(!oListaExibicao || oListaExibicao.length == 0) {
            return (
                <View style={{alignItems:'center', flexDirection:'column', alignSelf:'stretch', marginTop:100}}>
                    <Text>Nenhum intervalo definido.</Text>
                    <Text>Adicione ao menos um intervalo.</Text>
                </View>
            )
        }

        return oListaExibicao;
    }

    listarHorasDia(oDiaSemana) {
        let oListaIntervalos;        
        let oIntervalo;
        let oListaExibicao = [];
        let chaveItem;
        let h1;
        let m1;
        let h2;
        let m2;
        let qtdMsgs;

        if(oDiaSemana) {

            oListaIntervalos = oDiaSemana.intervalos;

            if(oListaIntervalos) {

                for(let i = 0; i < oListaIntervalos.length; i++) {
                    oIntervalo = oListaIntervalos[i];
                    if(oIntervalo) {
                        chaveItem = `${oDiaSemana.dia_semana}${i}`;
                        h1 = `${oIntervalo.hora_inicial.hora}`.padStart(2, '0');
                        m1 = `${oIntervalo.hora_inicial.minuto}`.padStart(2, '0');
                        h2 = `${oIntervalo.hora_final.hora}`.padStart(2, '0');
                        m2 = `${oIntervalo.hora_final.minuto}`.padStart(2, '0');
                        
                        qtdMsgs = `       `;                        
                        if(this.oDadosTela.ver_detalhes) {
                            qtdMsgs = ` ${oIntervalo.qtd_mensagens_intervalo}     `;
                        }

                        oListaExibicao.push(
                        <View key={chaveItem} style={{flexDirection:'column', alignItems:'center', marginBottom:5, alignSelf:'stretch', justifyContent:'space-between' }}>
                            <View style={{flexDirection:'row', alignItems:'center', marginBottom:5, alignSelf:'stretch', justifyContent:'space-between' }}>
                                <View style={{ alignSelf:'flex-start'}}>
                                    <Text>
                                        {qtdMsgs}
                                    </Text>
                                </View>
                                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', alignSelf:'center'}}>
                                    
                                    <Text>
                                        {h1}:{m1}
                                    </Text>
                                    <Text style={{margin: 5}}>
                                        às
                                    </Text>
                                    <Text>
                                        {h2}:{m2}
                                    </Text>
                                </View>
                                <View style={{ alignSelf:'flex-end', marginLeft:10 }}>
                                    <Icon name='trash' size={22} style={{ color:'#009999' } } 
                                    onPress={() => this.excluirIntervalo(oDiaSemana.dia_semana, i)}></Icon>
                                </View>                                    
                            </View>
                            {this.listarHorasExibicao(oIntervalo)}
                        </View>
                        )
                    }
                }
            }
        }
        return oListaExibicao;
    }

    listarHorasExibicao(oIntervalo) {
        let oHoras;
        let oListaExibicao = [];
        let dataHoraAtualExibir;
        let oDataHoraAtual;
        let chaveItem;

        if(this.oDadosTela.ver_detalhes && oIntervalo) {
            oHoras = oIntervalo.horas_exibicao;
            
            if(oHoras) {
                
                for(let t = 0; t < oHoras.length; t++) {
                    chaveItem = `${t}`;
                    dataHoraAtualExibir = '';
                    
                    if(oHoras[t]) {
                        oDataHoraAtual = new Date(oHoras[t]);
                        dataHoraAtualExibir = `     => ${oDataHoraAtual.getDate().toString().padStart(2,'0')}/${(oDataHoraAtual.getMonth() + 1).toString().padStart(2,'0')}/${oDataHoraAtual.getFullYear()} ${oDataHoraAtual.getHours().toString().padStart(2,'0')}:${oDataHoraAtual.getMinutes().toString().padStart(2,'0')}:${oDataHoraAtual.getSeconds().toString().padStart(2,'0')}`;
                    }

                    oListaExibicao.push(
                        <View key={chaveItem} style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end' }}>
                            <Text>
                                {dataHoraAtualExibir}
                            </Text>
                        </View>
                    )
                }
            }
        }
        
        return oListaExibicao;
    }

    verDataHoraAgendada() {
        
        if(this.oDadosTela.ver_detalhes && this.oDadosTela.agenda_notificacoes.ultima_data_hora_agendada) {
            let dataHora = this.oDadosTela.agenda_notificacoes.ultima_data_hora_agendada.data_hora_agenda;
            let oDataHora;

            if(dataHora) {
                oDataHora = new Date(dataHora);
                dataHora = `Data/Hora agendada: ${oDataHora.getDate()}/${oDataHora.getMonth() + 1}/${oDataHora.getFullYear()} ${oDataHora.getHours().toString().padStart(2, '0')}:${oDataHora.getMinutes().toString().padStart(2, '0')}:${oDataHora.getSeconds().toString().padStart(2, '0')}`
            }
            let emSegundoPlano = 'Nao';
            
            if(this.oDadosTela.agenda_notificacoes.ultima_data_hora_agendada.em_segundo_plano) {
                emSegundoPlano = 'Sim';
            }
            let emSegundoPlanoTexto = `Em segundo plano: ${emSegundoPlano}`;
            return(
                <View style={{flexDirection:'column'}}>
                    <Text>{dataHora}</Text>
                    <Text>{emSegundoPlanoTexto}</Text>
                </View>
            );
        } else {
            return (null);
        }
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
                <View style={{flex: 0.1, borderBottomWidth:1, marginBottom: 10,  borderColor:'#e0ebeb', flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'space-between'}} >
                    <View style={{alignSelf:'center', width:50, alignItems:'center', justifyContent:'flex-end'}}>
                        <TouchableOpacity onPress={this.voltar} style={{alignItems:'stretch'}}>
                            <Icon name="caret-left" size={40} color="#009999" />
                        </TouchableOpacity>
                    </View>
                    <View style={{alignSelf:'center', alignItems:'center', justifyContent:'center'}}>
                        <Text style={{fontSize: 24}}>Intervalos agendados</Text>
                    </View>
                    <View style={{alignSelf:'center', width:50, alignItems:'center', justifyContent:'flex-end', marginRight:10}}>
                        <Icon name= "info-circle" size={40} color='#e0ebeb'
                        delayLongPress = '4000'
                        onLongPress={() => this.verDetalhes()}
                        onPress={() => this.oNavegacao.navigate('Instrucoes')}></Icon>
                    </View>
                </View>
                <SafeAreaView style={{flex: 0.77}}>
                    {this.verDataHoraAgendada()}
                    <ScrollView>
                        {this.listarDiasSemana()}
                    </ScrollView>
                </SafeAreaView>
                <View style={{flex: 0.1, margin: 3, flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'flex-end'}}>                
                    <Icon name="calendar" size={30} color="#009999" style={{marginRight: 55}}  onPress={this.adicionarIntervalo} />
                </View>
            </View>
        );
    }
}

TelaConfiguracao.contextType = ContextoApp;

const styles = StyleSheet.create({
    areaTotal: {
        flex: 1,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'space-between',
        backgroundColor: '#faf9eb'
    },
});