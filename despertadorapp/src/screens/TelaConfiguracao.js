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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { DADOS_TELA_CONFIGURACAO_MODAL, DIAS_SEMANA } from '../contexts/DadosAppGeral';
import { Card, Divider } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputSpinner from "react-native-input-spinner";
import { TouchableOpacity } from 'react-native-gesture-handler';
import CheckBox from '@react-native-community/checkbox';

export default class TelaConfiguracao extends Component {

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
            this.oUtil = new Util();
            this.oMensagem = new Mensagem();
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        this.oDadosTela.objeto_tela = this;
        this.oDadosTela.ver_detalhes = false;
        this.irParaConfiguracaoIntervalo = this.irParaConfiguracaoIntervalo.bind(this);
        this.listarDiasSemana = this.listarDiasSemana.bind(this);
        this.listarHorasDia = this.listarHorasDia.bind(this);
        this.excluirIntervalosSelecionados = this.excluirIntervalosSelecionados.bind(this);
        this.ativarIntervalosSelecionados = this.ativarIntervalosSelecionados.bind(this);
        this.desativarIntervalosSelecionados = this.desativarIntervalosSelecionados.bind(this);
        this.voltar = this.voltar.bind(this);
        this.verDetalhes = this.verDetalhes.bind(this);
        this.verDataHoraAgendada = this.verDataHoraAgendada.bind(this);
        this.redefinirParaAgendaPadrao = this.redefinirParaAgendaPadrao.bind(this);
        this.montarRodape = this.montarRodape.bind(this);
        this.montarIcone = this.montarIcone.bind(this);
        this.abrirEdicao = this.abrirEdicao.bind(this);
        this.fecharEdicao = this.fecharEdicao.bind(this);
        this.alterarSelecaoEdicaoTodos = this.alterarSelecaoEdicaoTodos.bind(this);
        this.montarCheckboxIntervalo = this.montarCheckboxIntervalo.bind(this);
        this.obterDataDiaMesNoDiaSemana = this.obterDataDiaMesNoDiaSemana.bind(this);
        this.identificarDiaMesNoDiaSemana = this.identificarDiaMesNoDiaSemana.bind(this);
        this.criarCartaoIntervalo = this.criarCartaoIntervalo.bind(this);
    }
    
    irParaConfiguracaoIntervalo() {
        this.oDadosApp.tela_configuracao_modal = clonarObjeto(DADOS_TELA_CONFIGURACAO_MODAL);
        this.oNavegacao.navigate('Configuracao Intervalo');
    }

    redefinirParaAgendaPadrao() {
        this.oConfiguracao.configurarAgendaPadrao(
            () => {this.oGerenciadorContextoApp.atualizarEstadoTela(this)}
        );
    }

    ativarIntervalosSelecionados() {
        this.oConfiguracao.ativarIntervalosSelecionados(true, true);
        this.oDadosControleApp.todos_intervalos_selecionados = false;
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    desativarIntervalosSelecionados() {
        this.oConfiguracao.ativarIntervalosSelecionados(true, false);
        this.oDadosControleApp.todos_intervalos_selecionados = false;
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    excluirIntervalosSelecionados() {
        let quantidade = this.oConfiguracao.excluirIntervalosSelecionados(false);

        if(quantidade > 0) {
            Alert.alert(
                'Despertador de Consciência', 
                `Quer excluir os ${quantidade} intervalos selecionados?`, 
                [
                    { 
                        text: "Sim", 
                        style: 'default', 
                        onPress: () => {
                            this.oConfiguracao.excluirIntervalosSelecionados(true);
                            this.oDadosControleApp.todos_intervalos_selecionados = false;
                            if(!this.oConfiguracao.temIntervaloDefinido()) {
                                this.oDadosControleApp.em_edicao_agenda = false;
                            }
                            this.oConfiguracao.salvarAgendaNotificacoesNoDispositivo(
                                () => this.oGerenciadorContextoApp.atualizarEstadoTela(this)
                            );
                        } 
                    },
                    {
                        text: 'Não',
                        style: 'cancel'      
                    }
                ]);
        }
    }

    voltar() {
        this.oConfiguracao.salvarConfiguracoes(true);
        this.oNavegacao.goBack();
    }

    atribuirMensagensPorDia(diaSemana, qtdMensagensDia) {
        this.oConfiguracao.atribuirMensagensPorDia(diaSemana, qtdMensagensDia, () => {this.oGerenciadorContextoApp.atualizarEstadoTela(this);});
    }

    verDetalhes() {
        
        this.oDadosTela.ver_detalhes = !this.oDadosTela.ver_detalhes;
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    listarDiasSemana() {
        
        let oListaExibicao = [];
        let oListaIntervalos; 
        let tituloDia;
        let oAgendaIntervalosDias;
        
        if(this.oDadosTela.agenda_notificacoes && this.oDadosTela.agenda_notificacoes.agenda_intervalos_dias) {

            oAgendaIntervalosDias = this.oDadosTela.agenda_notificacoes.agenda_intervalos_dias;
        }

        if(oAgendaIntervalosDias && oAgendaIntervalosDias.length > 0) { 
            let oDiaSemana;
            let a = 0;
            let dataDiaMes = this.identificarDiaMesNoDiaSemana(oDiaSemana);
            let oListaExibicaoDiasPosteriores = [];
            let diaSemanaHoje = new Date().getDay();

            for(let i = 0; i < oAgendaIntervalosDias.length; i++) {
                a++;
                
                if((i + 1) == oAgendaIntervalosDias.length) {
                    a = 0;
                }
                oDiaSemana = this.oConfiguracao.obterDia(a);

                if(oDiaSemana) {
                    oListaIntervalos = this.listarHorasDia(oDiaSemana);
                    tituloDia = `${DIAS_SEMANA[oDiaSemana.dia_semana]}`;
                    dataDiaMes = this.identificarDiaMesNoDiaSemana(oDiaSemana);

                    if (oDiaSemana.dia_semana < diaSemanaHoje) {
                        dataDiaMes = `Próximo dia: ${dataDiaMes}`;
                        // Adiciona a lista de dias da semana menores, que serão posteriores ao dia de hoje (da semana seguinte).
                        oListaExibicaoDiasPosteriores.push(
                            this.criarCartaoIntervalo(oListaIntervalos, oDiaSemana, tituloDia, dataDiaMes)
                        )
                    } else if (oDiaSemana.ind_data_dia_hoje){
                    
                        dataDiaMes = `Hoje: ${dataDiaMes}`;
                        let oListaComPrimeiroDiaHoje = [];
                        // Adiciona o dia de hoje como o primeiro da lista.
                        oListaComPrimeiroDiaHoje.push(
                            this.criarCartaoIntervalo(oListaIntervalos, oDiaSemana, tituloDia, dataDiaMes, true)
                        );
                        oListaComPrimeiroDiaHoje.push(oListaExibicao);
                        oListaExibicao = oListaComPrimeiroDiaHoje;
                    } else {
                        dataDiaMes = `Próximo dia: ${dataDiaMes}`;
                        oListaExibicao.push(
                            this.criarCartaoIntervalo(oListaIntervalos, oDiaSemana, tituloDia, dataDiaMes)
                        );
                    }
                }                
            }
            oListaExibicao.push(oListaExibicaoDiasPosteriores);
        }
        if(!oListaExibicao || oListaExibicao.length == 0) {
            this.oDadosTela.ver_detalhes = false;
        
            return (
                <View style={{alignItems:'center', flexDirection:'column', justifyContent:'center'}}>
                    <Text style={{margin:20, fontSize:18}}>Nenhum intervalo definido.</Text>
                    {this.montarIcone('calendar-refresh', 'Padrão', this.redefinirParaAgendaPadrao, null, true)}
                </View>
            )
        }

        return (
            <ScrollView>
                {oListaExibicao}
            </ScrollView>
        )
    }

    criarCartaoIntervalo(oListaIntervalos, oDiaSemana, tituloDia, dataDiaMes, diaAtualHoje) {
        let corFundo = '#f0f5f5';
        let corFonte = 'black';
        let tamanhoFonte = 14;
        let espessuraFonte = 'normal';
        
        if(diaAtualHoje) {
            corFundo = 'white';
            corFonte = 'green';
            tamanhoFonte = 18;
            espessuraFonte = 'bold';
        }

        return (
        <Card key={oDiaSemana.dia_semana}
            title={
                <View style={{flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                    <Text style={{fontSize:20, fontWeight:'bold', margin: 5}}>{tituloDia}</Text>
                    <Text style={{fontSize: tamanhoFonte, fontWeight: espessuraFonte, color: corFonte}}>{dataDiaMes}</Text>
                </View>} 
            containerStyle={{backgroundColor: corFundo, borderWidth: 0, borderRadius:5, flexDirection:'column', width:300}} 
        >
            <Divider style={{margin:10}}></Divider>

            {oListaIntervalos}
            
            <Divider style={{margin:10}}></Divider>
            <View  style={{flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'center' }}>
                <Text style={{fontSize:16}}>Mensagens por dia</Text>
                <InputSpinner 
                    type='int' 
                    style={{width:90, height:30, alignItems:'center', marginLeft:10}} 
                    inputStyle={{fontSize:16}} 
                    buttonStyle={{height:30, width:30, padding:0, backgroundColor:'#009999'}} 
                    rounded={false} 
                    showBorder={true} 
                    step={1} min={1} 
                    max={5} 
                    value={oDiaSemana.qtd_mensagens_dia} 
                    onChange={(value) => {
                        this.atribuirMensagensPorDia(oDiaSemana.dia_semana, value); 
                        this.oGerenciadorContextoApp.atualizarEstadoTela(this);}
                    }
                >
                </InputSpinner>
            </View>
        </Card>)
    }
    listarHorasDia(oDiaSemana) {
        
        let oIntervalo;
        let oListaExibicao = [];
        let chaveItem;
        let h1;
        let m1;
        let h2;
        let m2;
        let qtdMsgs;

        if(oDiaSemana) {

            let oListaIntervalos = oDiaSemana.intervalos;

            if(oListaIntervalos) {
                let iconeAlarmeIntervalo = 'alarm-note';

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
                        
                        if(oIntervalo.ativado) {
                            iconeAlarmeIntervalo = 'alarm-note';
                        } else {
                            iconeAlarmeIntervalo = 'alarm-note-off';
                        }

                        oListaExibicao.push(
                        <View key={chaveItem} style={{flexDirection:'column', alignItems:'center', marginBottom:5, alignSelf:'stretch', justifyContent:'space-between' }}>
                            <View style={{flexDirection:'row', alignItems:'center', marginBottom:5, alignSelf:'stretch', justifyContent:'space-between' }}>
                                <View >
                                    <Text>
                                        {qtdMsgs}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => {
                                        let diaSemana = oDiaSemana;
                                        let intervalo = diaSemana.intervalos[i];

                                        this.oConfiguracao.ativarIntervaloDiaSemana(diaSemana.dia_semana, i, !intervalo.ativado);
                                        this.oConfiguracao.salvarAgendaNotificacoesNoDispositivo(
                                            () => this.oGerenciadorContextoApp.atualizarEstadoTela(this)
                                        );
                                    }}
                                >
                                    <Icon name={iconeAlarmeIntervalo} size={25} color='#009999' />
                                </TouchableOpacity>                     
                                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', alignSelf:'center'}}>
                                    
                                    <Text style={{fontSize:18}}>
                                        {h1}:{m1}
                                    </Text>
                                    <Text style={{fontSize:16, margin: 10}}>
                                        às
                                    </Text>
                                    <Text style={{fontSize:18}}>
                                        {h2}:{m2}
                                    </Text>
                                </View>
                                {this.montarCheckboxIntervalo(oDiaSemana, oIntervalo, i)}                                    
                            </View>
                            {this.listarHorasExibicao(oIntervalo)}
                        </View>
                        )
                    }
                }
            }
        }

        return (
            <View>
                {oListaExibicao}
            </View>
        );
    }

    montarCheckboxIntervalo(oDiaSemana, oIntervalo, indiceIntervalo){
        if(this.oDadosControleApp.em_edicao_agenda) {
            return(
                <View style={{width:20, margin:5 }}>
                    <CheckBox  
                        value={oIntervalo.selecionado}
                        onValueChange={(novoValor) => {
                            
                            let diaSemana = oDiaSemana;
                            diaSemana.intervalos[indiceIntervalo].selecionado = novoValor;
                            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
                        }} 
                    />
                </View>
            )
        } else {
            return(
                <View style={{width:10, margin:5 }}>
                </View>
            )
        }
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
        
        if(this.oDadosTela.ver_detalhes && this.oDadosTela.agenda_notificacoes && this.oDadosTela.agenda_notificacoes.ultima_data_hora_agendada) {
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

    abrirEdicao() {
        if(this.oConfiguracao.temIntervaloDefinido()) {
            this.oDadosControleApp.em_edicao_agenda = true;
            this.oGerenciadorContextoApp.atualizarEstadoTela(this);
        }
    }

    fecharEdicao(){
        this.oDadosControleApp.em_edicao_agenda = false;
        this.oConfiguracao.inverterSelecaoTodosIntervalos(true);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    alterarSelecaoEdicaoTodos() {
        this.oConfiguracao.inverterSelecaoTodosIntervalos(this.oDadosControleApp.todos_intervalos_selecionados);
        this.oDadosControleApp.todos_intervalos_selecionados = !this.oDadosControleApp.todos_intervalos_selecionados;
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    montarRodape() {
        let iconeSelecaoMultipla = 'check-box-multiple-outline';
        let habilitado = true;
        
        if(this.oDadosControleApp.todos_intervalos_selecionados) {
            iconeSelecaoMultipla = 'checkbox-multiple-blank-outline';
        }
        if(!this.oConfiguracao.temIntervaloSelecionado()) {
            habilitado = false;
        }
        
        if(this.oDadosControleApp.em_edicao_agenda) {
            return(
                <View style={{flex: 0.1, margin: 3, flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'space-evenly'}}>
                    <View style={{flexDirection:'row', marginLeft:10, alignItems:'center', justifyContent:'space-between'}}>
                        {this.montarIcone('trash-can-outline', 'Excluir', this.excluirIntervalosSelecionados, null, habilitado)}
                        {this.montarIcone('alarm-note-off', 'Desativar', this.desativarIntervalosSelecionados, null, habilitado)}
                        {this.montarIcone('alarm-note', 'Ativar', this.ativarIntervalosSelecionados, null, habilitado)}
                    </View>
                    <View style={{flexDirection:'row', marginLeft:10, alignItems:'center', justifyContent:'space-between'}}>
                        {this.montarIcone(iconeSelecaoMultipla, '', this.alterarSelecaoEdicaoTodos, () => {}, true)}
                        {this.montarIcone('close', '', this.fecharEdicao, () => {}, true)}
                    </View>
                </View>
            )
        } else {
            habilitado = true;
            if(!this.oConfiguracao.temIntervaloDefinido()) {
                habilitado = false;
            }
            return(
                <View style={{flex: 0.1, margin: 3, flexDirection:'row', alignItems:'center', alignSelf:'stretch', justifyContent:'space-evenly'}}>
                    {this.montarIcone('calendar-edit', 'Editar', this.abrirEdicao,  null, habilitado)}
                    {this.montarIcone('account-clock', 'Novo', this.irParaConfiguracaoIntervalo,  null, true)}
                </View>
            )
        }
    }

    montarIcone(nomeIcone, descricao, oFuncaoOnPress, oFuncaoOnLongPress, habilitado) {
        let corIcone = '#009999';

        if(!habilitado) {
            corIcone = '#e0ebeb';
        }
        if(descricao) {
            return (
                <TouchableOpacity onPress={oFuncaoOnPress} >
                    <View style={{flexDirection:'column', width:60, marginRight:10, marginLeft:10, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={25} color={corIcone} />
                        <Text style={{color:corIcone}}>{descricao}</Text>
                    </View>
                </TouchableOpacity>
            )
        } else {
            return(
                <TouchableOpacity onPress={oFuncaoOnPress} onLongPress={oFuncaoOnLongPress}>
                    <View style={{flexDirection:'column', width:50, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={25} color={corIcone} />
                    </View>
                </TouchableOpacity>
            )
        }
    }
    
    identificarDiaMesNoDiaSemana(oDiaSemana) {
        let oDataDiaMes = this.obterDataDiaMesNoDiaSemana(oDiaSemana);
        let dataHora = '';

        if(oDataDiaMes) {
            dataHora = `${oDataDiaMes.getDate()}/${oDataDiaMes.getMonth() + 1}/${oDataDiaMes.getFullYear()}`
        }

        return dataHora;
    }

    obterDataDiaMesNoDiaSemana(oDiaSemana) {
        let oDataDiaMes;

        if(oDiaSemana) {
        
            let diaSemana = oDiaSemana.dia_semana;
            let numDiasAcrescentar = 0;
            let oHoje = new Date();
            let diaSemanaHoje = oHoje.getDay();
            let diferencaDias = diaSemana - diaSemanaHoje;
            
            oDiaSemana.ind_data_dia_hoje = false;
            // Calcula o numero de dias para o proximo dia da semana.
            if (diferencaDias == 0) {
                
                oDiaSemana.ind_data_dia_hoje = true;
            } else {
                if (diferencaDias > 0) {
                    numDiasAcrescentar = diferencaDias;
                } else {
                    numDiasAcrescentar = (7 + diferencaDias) + diaSemanaHoje;
                }
                oHoje.setDate(oHoje.getDate() + numDiasAcrescentar);
            }
            oDataDiaMes = oHoje;
            oDiaSemana.data_proximo_dia_mes = oDataDiaMes;
        }
        return oDataDiaMes;
    }

    render() {

        return (
            <View style={styles.areaTotal}>
                <View style={{flex: 0.1, borderBottomWidth:1, marginBottom: 10,  borderColor:'#e0ebeb', flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'space-between'}} >
                    <View style={{alignSelf:'center', width:50, alignItems:'center', marginLeft:10, justifyContent:'flex-end'}}>
                        <TouchableOpacity onPress={this.voltar} style={{alignItems:'stretch'}}>
                            <Icon name="arrow-left" size={35} color="#009999" />
                        </TouchableOpacity>
                    </View>
                    <View style={{alignSelf:'center', alignItems:'center', justifyContent:'center'}}>
                        <Text style={{fontSize: 24}}>Intervalos</Text>
                    </View>
                    <View style={{alignSelf:'center', width:50, flexDirection:'row', marginRight:20, alignItems:'center', justifyContent:'flex-start'}}>                       
                        {this.montarIcone('information-variant', '', () => { this.oNavegacao.navigate('Instrucao')}, this.verDetalhes, true)}
                    </View>
                </View>
                <SafeAreaView style={{flex: 0.8, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                    {this.verDataHoraAgendada()}
                    
                    {this.listarDiasSemana()}
                </SafeAreaView>
                {this.montarRodape()}
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