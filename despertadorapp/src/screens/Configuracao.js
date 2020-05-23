/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import Util, { clonarObjeto } from '../common/Util';
import {DADOS_DIA_SEMANA, DADOS_DATA_HORA_AGENDAMENTO} from '../contexts/DadosAppGeral';
import {
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import PushNotification from 'react-native-push-notification';

export default class Configuracao {

    constructor(gerenciadorContexto) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTelaConfiguracao = this.oDadosApp.tela_configuracao;
        }
        this.oUtil = new Util();

        this.chamarServico = this.chamarServico.bind(this);
        this.tratarRespostaHTTP = this.tratarRespostaHTTP.bind(this);
        this.salvarAgendaNotificacoesNoDispositivo = this.salvarAgendaNotificacoesNoDispositivo.bind(this);
        this.obterAgendaNotificacoesDoDispositivo = this.obterAgendaNotificacoesDoDispositivo.bind(this);
        this.adicionarIntervaloDiaSemana = this.adicionarIntervaloDiaSemana.bind(this);
        this.gerarHoraAleatoria = this.gerarHoraAleatoria.bind(this);
        this.gerarHorasExibicaoIntervaloDia = this.gerarHorasExibicaoIntervaloDia.bind(this);
        this.configurarNotificacao = this.configurarNotificacao.bind(this);
        this.agendarNotificacao = this.agendarNotificacao.bind(this);
        this.obterDia = this.obterDia.bind(this);
        this.obterProximoDiaSemana = this.obterProximoDiaSemana.bind(this);
        this.obterProximaDataHoraExibicao = this.obterProximaDataHoraExibicao.bind(this);
        this.gerarHorasExibicaoProximoIntervalo = this.gerarHorasExibicaoProximoIntervalo.bind(this);
        this.definirDistribuicaoMensagensIntervalosDia = this.definirDistribuicaoMensagensIntervalosDia.bind(this);
        this.obterDia = this.obterDia.bind(this);
        this.validarIntervalo = this.validarIntervalo.bind(this);
        this.obterProximoIntervaloAgenda = this.obterProximoIntervaloAgenda.bind(this);
        this.obterProximaDataHoraIntervalo = this.obterProximaDataHoraIntervalo.bind(this);
        this.compararHora = this.compararHora.bind(this);
        this.removerUltimaDataHoraAgendada = this.removerUltimaDataHoraAgendada.bind(this);
        this.excluirIntervaloDiaSemana = this.excluirIntervaloDiaSemana.bind(this);
        this.salvarConfiguracoes = this.salvarConfiguracoes.bind(this);
    }
    
    // Implementar a seguir as funcoes para configurar o aplicativo.

    chamarServico(url, parametrosHTTP, funcaoTratamentoRetono) {
        fetch(url, parametrosHTTP)
        .then(this.tratarRespostaHTTP)
        .then((oJsonDadosRetorno) => {
            funcaoTratamentoRetono(oJsonDadosRetorno);
        })
        .catch(function (erro) {
            Alert.alert('Despertador de Consciência', erro.message);
            throw erro;
        });
    }
    
    tratarRespostaHTTP(oRespostaHTTP) {
        if (oRespostaHTTP.ok) {
            return oRespostaHTTP.json();
        } else {
            Alert.alert('Despertador de Consciência', "Erro: " + oRespostaHTTP.status);
        }
    }

    salvarConfiguracoes(bSalvar) {

        if(!this.oGerenciadorContextoApp.appAtivo || bSalvar === true) {
            this.salvarAgendaNotificacoesNoDispositivo();
            this.agendarNotificacao();
        }
    }

    async salvarAgendaNotificacoesNoDispositivo () {
        try {                   

            let promiseIntervalos = AsyncStorage.setItem('agenda_notificacoes', JSON.stringify(this.oDadosTelaConfiguracao.agenda_notificacoes));

            await promiseIntervalos;
        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao salvar intervalos no dispositivo: ' + error);
        }
    }

    async obterAgendaNotificacoesDoDispositivo () {
        try {                   
            
            let promiseIntervalos = await AsyncStorage.getItem('agenda_notificacoes');
            
            if(promiseIntervalos) {
                
                return JSON.parse(promiseIntervalos);
            }
            
            return null;

        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao ler intervalos do dispositivo: ' + error);
        }
    }

    excluirIntervaloDiaSemana(diaSemana, indiceIntervalo) {

        let oDiaSemana = this.obterDia(diaSemana);

        if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > indiceIntervalo) {
            
            oDiaSemana.intervalos.splice(indiceIntervalo, 1);

            if(oDiaSemana.intervalos.length === 0) {

                // Remove o dia da semana tambem.
                this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias[diaSemana] = null;
            }
            
            this.removerUltimaDataHoraAgendada();

            this.definirDistribuicaoMensagensIntervalosDia(diaSemana);
            
            this.agendarNotificacao();
        }
    }

    definirDistribuicaoMensagensIntervalosDia(diaSemana) {
        let oDiaSemana = this.obterDia(diaSemana);
        
        if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > 0) {
            let oIntervalosAdicionados = [];
            let qtdIntervalos = oDiaSemana.intervalos.length;
            let indiceAdicionar;
            let adicionar;

            // Zera todos os intervalos.
            for(let i = 0; i < oDiaSemana.intervalos.length; i++) {
                oDiaSemana.intervalos[i].qtd_mensagens_intervalo = 0;
                oDiaSemana.intervalos[i].horas_exibicao = [];
            }

            for(let i = 0; i < oDiaSemana.qtd_mensagens_dia; i++) {
                indiceAdicionar = 0;
                
                if(oIntervalosAdicionados.length > 0) {
                    
                    // Determina aleatoriamente quais intervalos receberao horas de exibicao.
                    for(let t = 0; t < (qtdIntervalos * 2); t++) {

                        indiceAdicionar = this.oUtil.getRand(qtdIntervalos);                        
                        adicionar = false;
                        
                        for(a = 0; a < oIntervalosAdicionados.length; a++) {
                            
                            // Procura o indice dentre os ja utilizados.
                            if(oIntervalosAdicionados[a] !== indiceAdicionar) {
                                adicionar = true;
                                break;
                            }   
                        }                        

                        if(adicionar) {
                            break;
                        }
                    }
                }                
            
                // Incrementa o numero de mensagens a exibir do intervalo.
                oDiaSemana.intervalos[indiceAdicionar].qtd_mensagens_intervalo++;
                        
                oIntervalosAdicionados.push(indiceAdicionar);
                
                if((oIntervalosAdicionados.length) === qtdIntervalos) {
                    oIntervalosAdicionados = [];
                }
            }            
        }
    }

    ordenarIntervalosDiaSemana(diaSemana) {
        let oDiaSemana = this.obterDia(diaSemana);
     
        if(oDiaSemana) {

            if(oDiaSemana.intervalos.length > 0) {

                oDiaSemana.intervalos.sort((oIntervalo1, oIntervalo2) => {

                    if(oIntervalo1 && oIntervalo2) {
                        let dh1 = new Date();
                        let dh2 = new Date();
                
                        dh1.setHours(parseInt(oIntervalo1.hora_inicial.hora), parseInt(oIntervalo1.hora_inicial.minuto), 0, 0);
                        dh2.setHours(parseInt(oIntervalo2.hora_inicial.hora), parseInt(oIntervalo2.hora_inicial.minuto), 59, 999);
                
                        return this.compararHora(dh1, dh2);
                    }
                })

                for(let i = 0; i < oDiaSemana.intervalos.length; i++) {
                    oDiaSemana.intervalos[i].indice_lista = i;
                }
            }
        }
    }

    adicionarIntervaloDiaSemana(diaSemana, oIntervaloDiaAdicionar, qtdIntervalosDia) {
        let oDiaSemana = this.obterDia(diaSemana);
        
        let oIntervaloAdicionar = clonarObjeto(oIntervaloDiaAdicionar);        
        oIntervaloAdicionar.dia_semana = diaSemana;

        if(oDiaSemana) {

            if(this.validarIntervalo(diaSemana, oIntervaloDiaAdicionar)) {
                oIntervaloDiaAdicionar.dia_semana = diaSemana;
                oDiaSemana.intervalos.push(oIntervaloAdicionar);
            }
        } else {

            // Cria o dia da semana e adiciona o primeiro intervalo ao dia.
            oDiaSemana = clonarObjeto(DADOS_DIA_SEMANA);
            oDiaSemana.dia_semana = diaSemana;
            oDiaSemana.qtd_mensagens_dia = qtdIntervalosDia;
            oDiaSemana.intervalos.push(oIntervaloAdicionar);

            this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias[diaSemana] = oDiaSemana;
        }
        
        this.ordenarIntervalosDiaSemana(diaSemana);
        this.definirDistribuicaoMensagensIntervalosDia(diaSemana);
    }

    validarIntervalo(diaSemana, oIntervaloValidar) {
        let dh1 = new Date();
        let dh2 = new Date();

        dh1.setHours(parseInt(oIntervaloValidar.hora_inicial.hora), parseInt(oIntervaloValidar.hora_inicial.minuto), 0, 0);
        dh2.setHours(parseInt(oIntervaloValidar.hora_final.hora), parseInt(oIntervaloValidar.hora_final.minuto), 59, 999);

        let hora_inicial_validar = dh1;
        let hora_final_validar = dh2;

        if(hora_inicial_validar >= hora_final_validar) {
            Alert.alert('A hora inicial deve ser menor que a hora final do intervalo.');
            return false;
        }
        
        // Valida se há intervalos concomitantes.
        let oDiaSemana = this.obterDia(diaSemana);
        let intervaloOk = true;

        if(oDiaSemana) {
            let oIntervalosDia = oDiaSemana.intervalos;

            if(oIntervalosDia) {
                let hora_inicial_item;
                let hora_final_item;
                let oIntervaloDiaItem;
                
                for(let i = 0; i < oIntervalosDia.length; i++) {
                    oIntervaloDiaItem = oIntervalosDia[i];

                    dh1 = new Date();
                    dh2 = new Date();
                                        
                    dh1.setHours(parseInt(oIntervaloDiaItem.hora_inicial.hora), parseInt(oIntervaloDiaItem.hora_inicial.minuto), 0, 0);
                    dh2.setHours(parseInt(oIntervaloDiaItem.hora_final.hora), parseInt(oIntervaloDiaItem.hora_final.minuto), 59, 999);
                    
                    hora_inicial_item = dh1;
                    hora_final_item = dh2;

                    if(!(hora_inicial_validar > hora_final_item && hora_final_validar > hora_final_item) &&
                       !(hora_inicial_validar < hora_inicial_item && hora_final_validar < hora_inicial_item)) {
                        
                        Alert.alert('Despertador de Consciência', `A intervalo informado coincide com outro. \nInforme a hora inicial maior que ${hora_final_item.toLocaleTimeString()} ou a hora final menor que ${hora_inicial_item.toLocaleTimeString()}.`);
                        intervaloOk = false;
                        break;
                    }
                }
            }
        }

        return intervaloOk;
    }

    gerarHorasExibicaoIntervaloDia(oIntervaloDia, numDiasAcrescentar) {
        bGerou = false;

        if(oIntervaloDia && oIntervaloDia.hora_inicial && oIntervaloDia.hora_final) {
            oIntervaloDia.horas_exibicao = [];
            let oHoraCalculada;
            let oHoraAtual = new Date();

            for(let i = 0; i < oIntervaloDia.qtd_mensagens_intervalo; i++){
                //TODO: Deve ser implementado calculo de intervalo minimo entre as mensagens (talvez utilizando uma porcentagem do tamanho do intervalo em minutos).
                oHoraCalculada = this.gerarHoraAleatoria(oIntervaloDia.hora_inicial, oIntervaloDia.hora_final);
                oHoraCalculada.setDate(oHoraCalculada.getDate() + numDiasAcrescentar);
                
                if(oHoraCalculada > oHoraAtual) {
                    bGerou = true;
                    oIntervaloDia.horas_exibicao.push(oHoraCalculada.toJSON());
                }
            }

            if(bGerou) {
                oIntervaloDia.novo = false;

                // Ordena as horas geradas.
                oIntervaloDia.horas_exibicao.sort((dataHora1, dataHora2) => {
                    if(dataHora1 && dataHora2) {
                        let dh1 = new Date(dataHora1);
                        let dh2 = new Date(dataHora2);
                
                        return this.compararHora(dh1, dh2);
                    }
                })

            }
        }
        return bGerou;
    }

    compararHora(dh1, dh2) {
        if(dh1 === dh2){
            return 0;
        } else if(dh1 > dh2) {
            return 1;
        } else {
            return -1;
        }
    }

    obterProximaDataHoraExibicao() {
        
        // Consulta o proximo intervalo da agenda.
        let oProximoIntervalo = this.obterProximoIntervaloAgenda();
        
        let oDadosProximaDataHoraAgendar = this.obterProximaDataHoraIntervalo(oProximoIntervalo);

        if(!oDadosProximaDataHoraAgendar || !oDadosProximaDataHoraAgendar.data_hora_agenda) {
            oProximoIntervalo = this.obterProximoIntervaloAgenda();

            this.gerarHorasExibicaoProximoIntervalo(oProximoIntervalo);
            
            oDadosProximaDataHoraAgendar = this.obterProximaDataHoraIntervalo(oProximoIntervalo);
        }

        let oDadosUltimaDataHoraAgendada = this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada;

        if(oDadosProximaDataHoraAgendar && oDadosUltimaDataHoraAgendada &&
           oDadosProximaDataHoraAgendar.data_hora_agenda === oDadosUltimaDataHoraAgendada.data_hora_agenda) {
           
            oDadosProximaDataHoraAgendar.data_hora_agenda = 'DATA_HORA_IGUAL';
        } else {

            this.salvarAgendaNotificacoesNoDispositivo();
        }

        return oDadosProximaDataHoraAgendar;
    }

    gerarHorasExibicaoProximoIntervalo(oProximoIntervalo) {
        
        if(oProximoIntervalo && oProximoIntervalo.novo) {
        
            let diaSemanaProximoIntervalo = oProximoIntervalo.dia_semana;
            let numDiasAcrescentar = 0;
            let oHoje = new Date();
            let diaSemanaHoje = oHoje.getDay();

            // Calcula as horas do intervalo.
            if(diaSemanaProximoIntervalo === 7) {
                
                numDiasAcrescentar++;
            } else {

                // Calcula o numero de dias para o proximo dia da semana.
                if (diaSemanaProximoIntervalo < diaSemanaHoje) {
                    numDiasAcrescentar = (7 - diaSemanaHoje) + diaSemanaProximoIntervalo;
                } else {
                    numDiasAcrescentar = diaSemanaProximoIntervalo - diaSemanaHoje;
                }
            }

            let oDiaSemana = this.obterDia(oProximoIntervalo.dia_semana);
            let proximoIndice = 0;
            let bContinuar = false;

            do {
                // Tenta gerar as horas para o proximo intervalo.
                bContinuar = !this.gerarHorasExibicaoIntervaloDia(oProximoIntervalo, numDiasAcrescentar);

                if (bContinuar && numDiasAcrescentar === 0) {
                    
                    proximoIndice = oProximoIntervalo.indice_lista + 1;
                    
                    // Se for o dia de hoje, tenta obter o proximo intervalo do dia, a partir do atual.
                    if(oDiaSemana.intervalos.length > proximoIndice) {

                        oProximoIntervalo = oDiaSemana.intervalos[proximoIndice];

                    } else {
                        bContinuar = false;
                        oProximoIntervalo = this.obterProximoIntervaloAgenda();

                        if(oProximoIntervalo) {
                            bContinuar = true;
                            diaSemanaProximoIntervalo = oProximoIntervalo.dia_semana;

                            // Calcula o numero de dias para o proximo dia da semana.
                            if (diaSemanaProximoIntervalo < diaSemanaHoje) {
                                numDiasAcrescentar = (7 - diaSemanaHoje) + diaSemanaProximoIntervalo;
                            } else {
                                numDiasAcrescentar = diaSemanaProximoIntervalo - diaSemanaHoje;
                            }

                            if(numDiasAcrescentar === 0) {
                                numDiasAcrescentar = 7;
                            }
                        }
                    }
                } else {

                    bContinuar = false;
                }
            } while (bContinuar);
        }
    }

    obterProximoIntervaloAgenda() {
        let oIntervalosHoje = this.obterDia();
        let oIntervalosDia = [];
        let oIntervaloItem;
        
        if(oIntervalosHoje) {
            let oDataHoraAtual = new Date();
            let oDataHoraInicial = new Date();
            let oDataHoraFinal = new Date();
            
            oIntervalosDia = oIntervalosHoje.intervalos;
            
            for (let i = 0; i < oIntervalosDia.length; i++) {
                oIntervaloItem = oIntervalosDia[i];

                if(oIntervaloItem.qtd_mensagens_intervalo > 0) {

                    oDataHoraInicial.setHours(parseInt(oIntervaloItem.hora_inicial.hora), parseInt(oIntervaloItem.hora_inicial.minuto), 0, 0);
                    oDataHoraFinal.setHours(parseInt(oIntervaloItem.hora_final.hora), parseInt(oIntervaloItem.hora_final.minuto), 59, 59);

                    // Verifica se a data hora atual estah no intervalo.
                    if (oDataHoraAtual >= oDataHoraInicial && oDataHoraAtual <= oDataHoraFinal) {
                        
                        if(oIntervaloItem.horas_exibicao && oIntervaloItem.horas_exibicao.length > 0 || 
                        oIntervaloItem.novo) {
                        
                            return oIntervaloItem;
                        }
                    } else if (oDataHoraAtual < oDataHoraInicial) {

                        oIntervaloItem.novo = true;
                        
                        return oIntervaloItem;
                    }
                }
            }
        }

        let oIntervalosProximoDia = this.obterProximoDiaSemana();

        if(oIntervalosProximoDia && oIntervalosProximoDia.intervalos && oIntervalosProximoDia.intervalos.length > 0) {
            
            oIntervalosDia = oIntervalosProximoDia.intervalos;
        
            for (let i = 0; i < oIntervalosDia.length; i++) {
                oIntervaloItem = oIntervalosDia[i];

                if(oIntervaloItem.qtd_mensagens_intervalo > 0) {
                    
                    oIntervaloItem.novo = true;
                    return oIntervaloItem;
                }
            }
        }
    }

    obterProximaDataHoraIntervalo(oIntervalo) {
        
        if(oIntervalo && oIntervalo.horas_exibicao) {
            
            let oDataHoraAtual = new Date();
            let oDataHoraExibicao;
            let oDadosProximaDataHoraAgendar;

            for(let i = 0; i < oIntervalo.horas_exibicao.length; i++) {
                
                oDataHoraExibicao = new Date(oIntervalo.horas_exibicao[i]);

                if(oDataHoraExibicao > oDataHoraAtual) {

                    oDadosProximaDataHoraAgendar = clonarObjeto(DADOS_DATA_HORA_AGENDAMENTO);

                    oDadosProximaDataHoraAgendar.dia_semana = oIntervalo.dia_semana;
                    oDadosProximaDataHoraAgendar.indice_intervalo = oIntervalo.indice_lista;
                    oDadosProximaDataHoraAgendar.indice_hora = i;
                    oDadosProximaDataHoraAgendar.data_hora_agenda = oIntervalo.horas_exibicao[i];

                    return oDadosProximaDataHoraAgendar;
                } else {
                    
                    // Remove a data hora, pois ja passou.
                    this.removerUltimaDataHoraAgendada();
                }
            }
        }

        return null;
    }

    removerUltimaDataHoraAgendada() {
        let oDadosUltimaDataHoraAgendada = this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada;
                
        if(oDadosUltimaDataHoraAgendada && oDadosUltimaDataHoraAgendada.indice_hora >= 0) {
                
                let oDiaSemana = this.obterDia(oDadosUltimaDataHoraAgendada.dia_semana);
                if(oDiaSemana) {

                    let oIntervaloAgendado = oDiaSemana.intervalos[oDadosUltimaDataHoraAgendada.indice_intervalo];
                    
                    if(oIntervaloAgendado && oIntervaloAgendado.horas_exibicao.length > 0) {

                        // Remove a ultima hora agendada, pois foi notificada.
                        oIntervaloAgendado.horas_exibicao.splice(oDadosUltimaDataHoraAgendada.indice_hora, 1);
                    }
                }
                // Limpa o objeto de controle da ultima data hora agendada.
                this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada = clonarObjeto(DADOS_DATA_HORA_AGENDAMENTO);

                // Exclui o agendamento da ultima data hora.
                PushNotification.cancelAllLocalNotifications();
        }
    }

    obterDia (diaSemana) {

        let oAgendaIntervalosDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
        let oDiaSemanaItem;

        if(oAgendaIntervalosDias) {
            oDiaSemanaItem = oAgendaIntervalosDias[7];
            
            if(!oDiaSemanaItem) {
                
                if((diaSemana === undefined || diaSemana === null) || (diaSemana < 0 && diaSemana > 6)) {
                    let oHoje = new Date();
                    diaSemana = oHoje.getDay();
                }
                
                oDiaSemanaItem = oAgendaIntervalosDias[diaSemana];
            }
        }   

        return oDiaSemanaItem;
    }

    obterProximoDiaSemana () {

        let oAgendaIntervalosDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
        let oProximoDia;
        let oHoje = new Date();
        
        oProximoDia = oAgendaIntervalosDias[7];
        
        if(oProximoDia) {
            return oProximoDia;
        }
        
        let diaHoje = oHoje.getDay();
        
        // Procura pelo proximo intervalo no maximo 7 vezes.
        for(let cont = 0; cont < 7; cont++) {
            
            diaHoje++;
            oProximoDia = oAgendaIntervalosDias[diaHoje];
            
            if(oProximoDia) {
                break;
            }

            if(diaHoje > 6) {            
                diaHoje = -1;
            }
        }
        
        return oProximoDia;
    }

    gerarHoraAleatoria(hora_inicial, hora_final) {
        let dh1 = new Date();
        let dh2 = new Date();

        dh1.setHours(parseInt(hora_inicial.hora), parseInt(hora_inicial.minuto), 0, 0);
        dh2.setHours(parseInt(hora_final.hora), parseInt(hora_final.minuto), 59, 999);

        let horaNotificacao = this.oUtil.obterDataHoraAleatoria(dh1, dh2);

        // As 3 linhas abaixo podem ser removidas, apos os testes.
        this.oDadosTelaConfiguracao.dh1 = dh1.toLocaleTimeString();
        this.oDadosTelaConfiguracao.dh2 = dh2.toLocaleTimeString();
        this.oDadosTelaConfiguracao.hora_notificacao = horaNotificacao.toLocaleTimeString();

        return horaNotificacao;
    }

    registrarUltimaDataHoraAgendada(oDadosProximaDataHoraAgendar) {
        this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada = oDadosProximaDataHoraAgendar;

        this.salvarAgendaNotificacoesNoDispositivo();
    }

    configurarNotificacao(oTelaMensagem, oNavegacao, oDadosControleApp) {
        var funcaoAgendarNotificacao = this.agendarNotificacao;

        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function (token) {
                // console.log("TOKEN:", token);
            },
    
            // (required) Called when a remote or local notification is opened or received
            onNotification: async function (notificacao) {
                // console.log("NOTIFICATION:", notificacao);
                
                oDadosControleApp.exibir_mensagem = true;
                oNavegacao.navigate('Mensagem');
                oTelaMensagem.exibirProximaMensagem();
                funcaoAgendarNotificacao();
    
                // process the notification
    
                // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
                //notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
    
            // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
            // senderID: "456789",
    
            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: false
            },
    
            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: false,
    
            /**
             * (optional) default: true
             * - Specified if permissions (ios) and token (android and ios) will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             */
            requestPermissions: false,
        });
        // PushNotification.requestPermissions();
    }

    agendarNotificacao() {
        
        let oDadosProximaDataHoraAgendar = this.obterProximaDataHoraExibicao();
        
        if(oDadosProximaDataHoraAgendar && oDadosProximaDataHoraAgendar.data_hora_agenda) {
            
            try {

                if(oDadosProximaDataHoraAgendar.data_hora_agenda !== 'DATA_HORA_IGUAL') {
                    let oDataHoraAgendar = new Date(oDadosProximaDataHoraAgendar.data_hora_agenda);

                    PushNotification.localNotificationSchedule({
                        //... You can use all the options from localNotifications
                        message: 'Desperte sua consciência...',
                        playSound: false,
                        date: oDataHoraAgendar,

                //         autoCancel: false, // (optional) default: true
                //         largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
                //         smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
                //    //     bigText: "My big text that will be shown when notification is expanded", // (optional) default: "message" prop
                //      //   subText: "This is a subText", // (optional) default: none
                //       //  color: "red", // (optional) default: system default
                //         vibrate: true, // (optional) default: true
                //         vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
                //         //tag: "some_tag", // (optional) add tag to message
                //         //group: "group", // (optional) add group to message
                //         ongoing: false, // (optional) set whether this is an "ongoing" notification
                //         priority: "high", // (optional) set notification priority, default: high
                //         visibility: "private", // (optional) set notification visibility, default: private
                //         importance: "high", // (optional) set notification importance, default: high
                //         allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
                //         ignoreInForeground: true, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
                    
                //         /* iOS only properties */
                //         alertAction: "view", // (optional) default: view
                //         category: "", // (optional) default: empty string
                //         userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)
                    
                //         /* iOS and Android properties */
                //      //   title: "My Notification Title", // (optional)
                //      //   message: "My Notification Message", // (required)
                //         playSound: false, // (optional) default: true
                //         soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
                //         //number: 10, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
                    });
                    
                    this.registrarUltimaDataHoraAgendada(oDadosProximaDataHoraAgendar);
                }
            } catch (exc) {
                Alert.alert(`Erro ao agendar hora no dispositivo: ${exc}`);
            }
        } else {
            Alert.alert('Configure os intervalos de tempo para o despertar da sua consciência.');
        }
    }
}