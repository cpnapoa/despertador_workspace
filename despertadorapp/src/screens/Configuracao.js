/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import Util, { clonarObjeto } from '../common/Util';
import {FORMAS_AGENDAMENTO, DIAS_SEMANA, DADOS_DIA_SEMANA, DADOS_DATA_HORA_AGENDAMENTO, DADOS_INTERVALO, DADOS_TELA_CONFIGURACAO_MODAL } from '../contexts/DadosAppGeral';
import {
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import PushNotification from 'react-native-push-notification';
import BackgroundFetch from 'react-native-background-fetch';
import NotifService from './NotifService';
import Mensagem from './Mensagem';

export default class Configuracao {

    constructor(gerenciadorContexto, oNavegacao) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTelaConfiguracao = this.oDadosApp.tela_configuracao;
            this.oDadosTelaConfiguracaoModal = this.oDadosApp.tela_configuracao_modal;
            this.oMensagem = new Mensagem(gerenciadorContexto);
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oNotifService = new NotifService(
                this.aoRegistrarNotificacao.bind(this),
                this.aoNotificar.bind(this)
            );
        }
        this.oNavegacao = oNavegacao;
        
        this.salvarAgendaNotificacoesNoDispositivo = this.salvarAgendaNotificacoesNoDispositivo.bind(this);
        this.obterAgendaNotificacoesDoDispositivo = this.obterAgendaNotificacoesDoDispositivo.bind(this);
        this.adicionarIntervaloDiaSemana = this.adicionarIntervaloDiaSemana.bind(this);
        this.gerarHoraAleatoria = this.gerarHoraAleatoria.bind(this);
        this.gerarHorasExibicaoIntervaloDia = this.gerarHorasExibicaoIntervaloDia.bind(this);
        this.adicionarIntervalo = this.adicionarIntervalo.bind(this);
        this.agendarNotificacao = this.agendarNotificacao.bind(this);
        this.verificarNotificacaoEmSegundoPlano = this.verificarNotificacaoEmSegundoPlano.bind(this);
        this.reagendarNotificacaoEmSegundoPlano = this.reagendarNotificacaoEmSegundoPlano.bind(this);
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
        this.excluirIntervalosSelecionados = this.excluirIntervalosSelecionados.bind(this);
        this.excluirIntervaloDiaSemana = this.excluirIntervaloDiaSemana.bind(this);
        this.salvarConfiguracoes = this.salvarConfiguracoes.bind(this);
        this.atribuirMensagensPorDia = this.atribuirMensagensPorDia.bind(this);
        this.temIntervaloDefinido = this.temIntervaloDefinido.bind(this);
        this.inverterSelecaoTodosIntervalos = this.inverterSelecaoTodosIntervalos.bind(this);
        this.ativarIntervalosSelecionados = this.ativarIntervalosSelecionados.bind(this);
        this.ativarIntervaloDiaSemana = this.ativarIntervaloDiaSemana.bind(this);
        this.temIntervaloSelecionado = this.temIntervaloSelecionado.bind(this);
    }
    
    salvarConfiguracoes(bAgendar) {
        console.log('[despertadorapp] salvarConfiguracoes() ++++++++++++ iniciou ++++++++++++');
        console.log(`[despertadorapp] salvarConfiguracoes() Parametros: bAgendar = ${bAgendar}, alterou_agenda = ${this.oDadosControleApp.alterou_agenda}`);

        if(this.oDadosControleApp.alterou_agenda) {
            this.oDadosControleApp.alterou_agenda = false;

            if(!this.oGerenciadorContextoApp.appAtivo || bAgendar === true) {
                let formaAgendamento = FORMAS_AGENDAMENTO.ao_alterar_agenda;
                
                if(!this.oGerenciadorContextoApp.appAtivo) {

                    formaAgendamento = FORMAS_AGENDAMENTO.ao_fechar_aplicativo;
                    if(!this.oDadosApp.dados_mensagens.mensagem_proxima) {
                        formaAgendamento = FORMAS_AGENDAMENTO.ao_fechar_aplicativo_sem_prox_msg;
                    }
                }
                
                this.salvarAgendaNotificacoesNoDispositivo(() => {
                    if(this.temIntervaloDefinido()) {
                        console.log('[despertadorapp] salvarConfiguracoes() salvando agenda e agendando... ');
                
                        if(!this.oDadosApp.dados_mensagens.mensagem_proxima) {
                            this.oMensagem.definirMensagemExibir(() => {this.agendarNotificacao(formaAgendamento)});
                        } else {
                            this.agendarNotificacao(formaAgendamento);
                        }
                    }
                });

            } else if (!bAgendar) {
                console.log('[despertadorapp] salvarConfiguracoes() salvando agenda sem agendar... ');
                this.salvarAgendaNotificacoesNoDispositivo();
            }
        }
        
        console.log('[despertadorapp] salvarConfiguracoes() ------------ terminou ------------');
    }

    salvarAgendaNotificacoesNoDispositivo(callback) {
        try {
            console.log('[despertadorapp] salvarAgendaNotificacoesNoDispositivo() salvando a agenda: ', JSON.stringify(this.oDadosTelaConfiguracao.agenda_notificacoes));

            AsyncStorage.setItem('agenda_notificacoes', JSON.stringify(this.oDadosTelaConfiguracao.agenda_notificacoes))
            .then(() => {
            
                if(callback) {
                    callback();
                };
            });

        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao salvar intervalos no dispositivo: ' + error);
        }
    }

    excluirAgendaNotificacoesNoDispositivo(callback) {
        try {
            AsyncStorage.removeItem('agenda_notificacoes')
            .then(() => {
            
                if(callback) {
                    callback();
                };
            });

        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao remover intervalos no dispositivo: ' + error);
        }
    }
    
    temIntervaloDefinido() {
        if(this.oDadosTelaConfiguracao.agenda_notificacoes && this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias) {
            
            let qtdDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias.length;
            
            if(qtdDias > 0) {
                let diasAgendados = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
                let oDiaAgendado;
                
                for(let i = 0; i < qtdDias; i++) {
                    oDiaAgendado = diasAgendados[i];
                    if(oDiaAgendado && oDiaAgendado.intervalos && oDiaAgendado.intervalos.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    obterAgendaNotificacoesDoDispositivo (callback) {
        console.log('[despertadorapp] obterAgendaNotificacoesDoDispositivo() ++++++++++++ iniciou ++++++++++++');

        try {
            AsyncStorage.getItem('agenda_notificacoes').then((valor) => {
                console.log('[despertadorapp] obterAgendaNotificacoesDoDispositivo(), agenda_notificacoes =', valor);
                
                if(valor) {

                    this.oDadosTelaConfiguracao.agenda_notificacoes = JSON.parse(valor);
                } 
                if(!valor) {

                    this.configurarAgendaPadrao(() => {
                        this.oDadosControleApp.primeira_vez = true;
                        
                        if(callback) {
                            callback();
                        }
                    });

                } else if(callback) {
                    callback();
                }
            });

        } catch (error) {

            Alert.alert('Despertador de Consciência', 'Erro ao ler intervalos do dispositivo: ' + error);
        }
        console.log('[despertadorapp] obterAgendaNotificacoesDoDispositivo() ------------ terminou ------------');
    }

    adicionarIntervalo() {
        let adicionou = false;
        let oNovoIntervalo = clonarObjeto(DADOS_INTERVALO);
        
        oNovoIntervalo.hora_inicial.hora = this.oDadosTelaConfiguracaoModal.h1;
        oNovoIntervalo.hora_inicial.minuto = this.oDadosTelaConfiguracaoModal.m1;
        oNovoIntervalo.hora_final.hora = this.oDadosTelaConfiguracaoModal.h2;
        oNovoIntervalo.hora_final.minuto = this.oDadosTelaConfiguracaoModal.m2;
        
        if(!this.oDadosTelaConfiguracaoModal.dom &&
           !this.oDadosTelaConfiguracaoModal.seg &&
           !this.oDadosTelaConfiguracaoModal.ter &&
           !this.oDadosTelaConfiguracaoModal.qua &&
           !this.oDadosTelaConfiguracaoModal.qui &&
           !this.oDadosTelaConfiguracaoModal.sex &&
           !this.oDadosTelaConfiguracaoModal.sab) {
        
            Alert.alert('Despertador de Conscência', 'Selecione ao menos um dia da semana.');
            return false;
        }

        if(this.oDadosTelaConfiguracaoModal.dom) {
            
            if(this.adicionarIntervaloDiaSemana(0, oNovoIntervalo, 1)) {
                if(!adicionou) {
                    adicionou = true;
                }
            } else {
                return false;
            }
        }
        
        if(this.oDadosTelaConfiguracaoModal.seg) {
            if (this.adicionarIntervaloDiaSemana(1, oNovoIntervalo, 1)) {
                if(!adicionou) {
                    adicionou = true;
                }
            } else {
                return false;
            }
        }

        if(this.oDadosTelaConfiguracaoModal.ter) {
            if(this.adicionarIntervaloDiaSemana(2, oNovoIntervalo, 1)) {
                if(!adicionou) {
                    adicionou = true;
                }
            } else {
                return false;
            }
        }

        if(this.oDadosTelaConfiguracaoModal.qua) {
            if (this.adicionarIntervaloDiaSemana(3, oNovoIntervalo, 1)) {
                if(!adicionou) {
                    adicionou = true;
                }
            } else {
                return false;
            }
        }
        if(this.oDadosTelaConfiguracaoModal.qui) {
            if (this.adicionarIntervaloDiaSemana(4, oNovoIntervalo, 1)) {
                if(!adicionou) {
                    adicionou = true;
                }
            } else {
                return false;
            }
        }

        if(this.oDadosTelaConfiguracaoModal.sex) {
            if (this.adicionarIntervaloDiaSemana(5, oNovoIntervalo, 1)) {
                if(!adicionou) {
                    adicionou = true;
                }
            } else {
                return false;
            }
        }

        if(this.oDadosTelaConfiguracaoModal.sab) {
            if (this.adicionarIntervaloDiaSemana(6, oNovoIntervalo, 1)) {
                if(!adicionou) {
                    adicionou = true;
                }
            } else {
                return false;
            }
        }
        return adicionou;
    }

    configurarAgendaPadrao(callback) {
        this.oDadosApp.tela_configuracao_modal = clonarObjeto(DADOS_TELA_CONFIGURACAO_MODAL);
        this.oDadosTelaConfiguracaoModal = this.oDadosApp.tela_configuracao_modal;

        this.oDadosTelaConfiguracaoModal.dom = true;
        this.oDadosTelaConfiguracaoModal.seg = true;
        this.oDadosTelaConfiguracaoModal.ter = true;
        this.oDadosTelaConfiguracaoModal.qua = true;
        this.oDadosTelaConfiguracaoModal.qui = true;
        this.oDadosTelaConfiguracaoModal.sex = true;
        this.oDadosTelaConfiguracaoModal.sab = true;

        this.oDadosTelaConfiguracaoModal.h1 = 7;
        this.oDadosTelaConfiguracaoModal.m1 = 30;
        this.oDadosTelaConfiguracaoModal.h2 = 9;
        this.oDadosTelaConfiguracaoModal.m2 = 0;
        
        this.adicionarIntervalo();

        let oDiaSemana = this.obterDia(0);
        oDiaSemana.qtd_mensagens_dia = 2;
        oDiaSemana = this.obterDia(1);
        oDiaSemana.qtd_mensagens_dia = 2;
        oDiaSemana = this.obterDia(2);
        oDiaSemana.qtd_mensagens_dia = 2;
        oDiaSemana = this.obterDia(3);
        oDiaSemana.qtd_mensagens_dia = 2;
        oDiaSemana = this.obterDia(4);
        oDiaSemana.qtd_mensagens_dia = 2;
        oDiaSemana = this.obterDia(5);
        oDiaSemana.qtd_mensagens_dia = 2;
        oDiaSemana = this.obterDia(6);

        this.oDadosTelaConfiguracaoModal.h1 = 18;
        this.oDadosTelaConfiguracaoModal.m1 = 0;
        this.oDadosTelaConfiguracaoModal.h2 = 21;
        this.oDadosTelaConfiguracaoModal.m2 = 0;
        
        this.adicionarIntervalo();
        
        this.salvarAgendaNotificacoesNoDispositivo(callback);
    }
    
    definirDistribuicaoMensagensIntervalosDia(diaSemana) {
        let oDiaSemana = this.obterDia(diaSemana);
        
        if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > 0) {
            let oIntervalosAdicionados = [];
            let qtdIntervalos = oDiaSemana.intervalos.length;
            let qtdIntervalosAdicionados;
            let indiceAdicionar;
            let definir = false;
            let adicionar = false;

            // Zera todos os intervalos.
            for(let i = 0; i < oDiaSemana.intervalos.length; i++) {
                oDiaSemana.intervalos[i].qtd_mensagens_intervalo = 0;
                oDiaSemana.intervalos[i].horas_exibicao = [];
                
                if(oDiaSemana.intervalos[i].ativado) {
                    definir = true;
                }
            }
            if(definir) {

                for(let i = 0; i < oDiaSemana.qtd_mensagens_dia; i++) {
                    
                    indiceAdicionar = this.oUtil.getRand(qtdIntervalos);
                    adicionar = true;
                    
                    if(oIntervalosAdicionados.length > 0) {
                        for(let a = 0; a < oIntervalosAdicionados.length; a++) {
                            
                            // Procura o indice dentre os ja utilizados.
                            if(oIntervalosAdicionados[a] === indiceAdicionar) {

                                adicionar = false;
                                break;
                            }
                        }                        
                    }

                    if(!oDiaSemana.intervalos[indiceAdicionar].ativado) {
                        adicionar = false;
                    }

                    if(!adicionar) {
                        // Procura o proximo intervalo ainda não usado, para garantir que não ficará sem nenhum mensagem.
                        for(let y = 0; y < oDiaSemana.intervalos.length; y++) {

                            if(oDiaSemana.intervalos[y].ativado && !oDiaSemana.intervalos[y].qtd_mensagens_intervalo) {
                                
                                indiceAdicionar = y;
                                adicionar = true;
                                break;
                            }
                        }
                    }

                    if(!adicionar && oIntervalosAdicionados.length > 0) {
                        // Sorteia novamente, mas dentre os já adicionados.
                        qtdIntervalosAdicionados = oIntervalosAdicionados.length;
                        indiceAdicionar = this.oUtil.getRand(qtdIntervalosAdicionados);
                        indiceAdicionar = oIntervalosAdicionados[indiceAdicionar];
                        adicionar = true;
                    }

                    if(adicionar) {
                        // Incrementa o numero de mensagens a exibir do intervalo.
                        oDiaSemana.intervalos[indiceAdicionar].qtd_mensagens_intervalo++;
                        this.oDadosControleApp.alterou_agenda = true;

                        oIntervalosAdicionados.push(indiceAdicionar);
                        
                        if((oIntervalosAdicionados.length) === qtdIntervalos) {
                            oIntervalosAdicionados = [];
                        }
                    }
                }
            } else {
                console.log(`definirDistribuicaoMensagensIntervalosDia() Nenhum intervalo ativo para o dia ${diaSemana} para definir distribuicao das mensagens`);
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
        let adicionou = false;
        let oDiaSemana = this.obterDia(diaSemana);
        
        let oIntervaloAdicionar = clonarObjeto(oIntervaloDiaAdicionar);        
        oIntervaloAdicionar.dia_semana = diaSemana;

        if(oDiaSemana) {

            if(oDiaSemana.intervalos.length < 5) {
                if(this.validarIntervalo(diaSemana, oIntervaloDiaAdicionar)) {
                    oIntervaloDiaAdicionar.dia_semana = diaSemana;
                    oDiaSemana.intervalos.push(oIntervaloAdicionar);
                    this.oDadosControleApp.alterou_agenda = true;
                    adicionou = true;
                }
            } else {
                Alert.alert('Despertador de Consciência', 'É possível adicionar até cinco intervalos por dia.');
            }
        } else {
            
            // Cria o dia da semana e adiciona o primeiro intervalo ao dia.
            oDiaSemana = clonarObjeto(DADOS_DIA_SEMANA);
            oDiaSemana.dia_semana = diaSemana;
            oDiaSemana.intervalos.push(oIntervaloAdicionar);
            
            this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias[diaSemana] = oDiaSemana;
            this.oDadosControleApp.alterou_agenda = true;
            adicionou = true;
        }
        if(oDiaSemana.qtd_mensagens_dia < oDiaSemana.intervalos.length) {
            oDiaSemana.qtd_mensagens_dia = oDiaSemana.intervalos.length;
        }
        if(adicionou) {
            this.ordenarIntervalosDiaSemana(diaSemana);
            this.definirDistribuicaoMensagensIntervalosDia(diaSemana);
        }
        return adicionou;
    }

    inverterSelecaoTodosIntervalos(selecaoAtual) {
        let oAgendaIntervalosDias;
        let oDiaSemana;
        let oIntervalo;
        let quantidade = 0;

        if(this.oDadosTelaConfiguracao.agenda_notificacoes) {
            oAgendaIntervalosDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
        }

        if(oAgendaIntervalosDias && oAgendaIntervalosDias.length > 0) {

            for(let iDiaSemana = 0; iDiaSemana < oAgendaIntervalosDias.length; iDiaSemana++){
                
                oDiaSemana = oAgendaIntervalosDias[iDiaSemana];
                
                if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > 0) {
                    
                    for(let t = 0; t < oDiaSemana.intervalos.length; t++) {
                        
                        oIntervalo = oDiaSemana.intervalos[t];

                        oIntervalo.selecionado = !selecaoAtual;
                        quantidade ++;
                    }
                }
            }
        }
        return quantidade;
    }

    temIntervaloSelecionado() {
        let oAgendaIntervalosDias;
        let oDiaSemana;
        let oIntervalo;

        if(this.oDadosTelaConfiguracao.agenda_notificacoes) {
            oAgendaIntervalosDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
        }

        if(oAgendaIntervalosDias && oAgendaIntervalosDias.length > 0) {

            for(let iDiaSemana = 0; iDiaSemana < oAgendaIntervalosDias.length; iDiaSemana++){
                
                oDiaSemana = oAgendaIntervalosDias[iDiaSemana];
                
                if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > 0) {
                    
                    for(let t = 0; t < oDiaSemana.intervalos.length; t++) {
                        
                        oIntervalo = oDiaSemana.intervalos[t];

                        if(oIntervalo.selecionado) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    ativarIntervalosSelecionados(indEfetivar, indAtivaDesativa) {
        let oAgendaIntervalosDias;
        let oDiaSemana;
        let oIntervalo;
        let quantidade = 0;

        if(this.oDadosTelaConfiguracao.agenda_notificacoes) {
            oAgendaIntervalosDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
        }

        if(oAgendaIntervalosDias && oAgendaIntervalosDias.length > 0) {

            for(let iDiaSemana = 0; iDiaSemana < oAgendaIntervalosDias.length; iDiaSemana++){
                
                oDiaSemana = oAgendaIntervalosDias[iDiaSemana];
                
                if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > 0) {
                    
                    for(let t = 0; t < oDiaSemana.intervalos.length; t++) {
                        
                        oIntervalo = oDiaSemana.intervalos[t];

                        if(oIntervalo.selecionado) {
                            
                            if(indEfetivar) {
                                oIntervalo.selecionado = false;

                                if(this.ativarIntervaloDiaSemana(oDiaSemana.dia_semana, t, indAtivaDesativa)) {
                                    t--;
                                }
                            }

                            quantidade++;    
                        }
                    }
                }
            }
        }
        return quantidade;
    }

    ativarIntervaloDiaSemana(diaSemana, indiceIntervalo, indAtivaDesativa) {

        let oDiaSemana = this.obterDia(diaSemana);
        let oIntervalo;
        let indAlterou = false;

        if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > indiceIntervalo) {
            
            oIntervalo = oDiaSemana.intervalos[indiceIntervalo];

            if(oIntervalo.ativado !== indAtivaDesativa) {
                console.log(`ativarIntervaloDiaSemana() Alterando o intervalo para ativado = ${indAtivaDesativa}...`);
                oIntervalo.ativado = indAtivaDesativa;
                
                indAlterou = true;
                this.definirDistribuicaoMensagensIntervalosDia(diaSemana);            
                this.obterProximaDataHoraExibicao();
                this.oDadosControleApp.alterou_agenda = true;
            }
        }

        return indAlterou;
    }
    
    excluirIntervalosSelecionados(indEfetivarExclusao) {
        let oAgendaIntervalosDias;
        let oDiaSemana;
        let oIntervalo;
        let quantidade = 0;

        if(this.oDadosTelaConfiguracao.agenda_notificacoes) {
            oAgendaIntervalosDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
        }

        if(oAgendaIntervalosDias && oAgendaIntervalosDias.length > 0) {

            for(let iDiaSemana = 0; iDiaSemana < oAgendaIntervalosDias.length; iDiaSemana++){
                
                oDiaSemana = oAgendaIntervalosDias[iDiaSemana];
                
                if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > 0) {
                    
                    for(let t = 0; t < oDiaSemana.intervalos.length; t++) {
                        
                        oIntervalo = oDiaSemana.intervalos[t];

                        if(oIntervalo.selecionado) {
                            
                            if(indEfetivarExclusao) {
                                oIntervalo.selecionado = false;

                                if(this.excluirIntervaloDiaSemana(oDiaSemana.dia_semana, t)) {
                                    t--;
                                }
                            }

                            quantidade++;    
                        }
                    }
                }
            }
        }
        return quantidade;
    }

    excluirIntervaloDiaSemana(diaSemana, indiceIntervalo) {

        let oDiaSemana = this.obterDia(diaSemana);
        let indExcluiu = false;

        if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > indiceIntervalo) {
            
            oDiaSemana.intervalos.splice(indiceIntervalo, 1);
            indExcluiu = true;

            if(oDiaSemana.intervalos.length === 0) {

                // Remove o dia da semana tambem.
                this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias[diaSemana] = null;
            }

            this.definirDistribuicaoMensagensIntervalosDia(diaSemana);            
            this.obterProximaDataHoraExibicao();
            this.oDadosControleApp.alterou_agenda = true;
            this.oDadosTelaConfiguracao.agenda_notificacoes.forma_agendamento = '';
        }

        return indExcluiu;
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
                        
                        let h1 = `${oIntervaloDiaItem.hora_inicial.hora}`.padStart(2, '0');
                        let m1 = `${oIntervaloDiaItem.hora_inicial.minuto}`.padStart(2, '0');
                        let h2 = `${oIntervaloDiaItem.hora_final.hora}`.padStart(2, '0');
                        let m2 = `${oIntervaloDiaItem.hora_final.minuto}`.padStart(2, '0');
                        Alert.alert('Despertador de Consciência', `O intervalo informado coincide com o seguinte intervalo de ${DIAS_SEMANA[oIntervaloDiaItem.dia_semana]}:\n\n => ${h1}:${m1} às ${h2}:${m2}.\n\nAjuste o novo intervalo para que as horas de início e fim não coincidam.`);
                        intervaloOk = false;
                        break;
                    }
                }
            }
        }

        return intervaloOk;
    }

    gerarHorasExibicaoIntervaloDia(oIntervaloDia, numDiasAcrescentar) {
        let bGerou = false;

        if(oIntervaloDia && oIntervaloDia.hora_inicial && oIntervaloDia.hora_final) {
            oIntervaloDia.horas_exibicao = [];
            let oHoraCalculada;
            let oHoraAtual = new Date();

            for(let i = 0; i < oIntervaloDia.qtd_mensagens_intervalo; i++){
                //TODO: Deve ser implementado calculo de intervalo minimo entre as mensagens (talvez utilizando uma porcentagem do tamanho do intervalo em minutos).
                oHoraCalculada = this.gerarHoraAleatoria(oIntervaloDia.hora_inicial, oIntervaloDia.hora_final);
                //fazer ele calcular todas as horas e verificar se elas possuem o espaçamento adequado antes de dar o push
                //falta limitar o numero de mensagens de acordo com o tamanho do período
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
        console.log('[despertadorapp] obterProximaDataHoraExibicao() ++++++++++++ iniciou ++++++++++++');

        let oDadosProximaDataHoraAgendar = this.obterProximaDataHoraIntervalo();

        if(oDadosProximaDataHoraAgendar && oDadosProximaDataHoraAgendar.data_hora_agenda) {
            
            let oDadosUltimaDataHoraAgendada = this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada;

            if(oDadosUltimaDataHoraAgendada &&
               oDadosUltimaDataHoraAgendada.data_hora_agenda === oDadosProximaDataHoraAgendar.data_hora_agenda) {
           
                oDadosProximaDataHoraAgendar.data_hora_agenda = 'DATA_HORA_IGUAL';
            }
        } else {
            console.log('[despertadorapp] obterProximaDataHoraExibicao() Nao tem data-hora agendada.');
        }
        console.log('[despertadorapp] obterProximaDataHoraExibicao() ------------ terminou ------------');
        
        return oDadosProximaDataHoraAgendar;
    }

    gerarHorasExibicaoProximoIntervalo(oProximoIntervalo) {
        
        if(oProximoIntervalo) {
        
            let diaSemanaProximoIntervalo = oProximoIntervalo.dia_semana;
            let numDiasAcrescentar = 0;
            let oHoje = new Date();
            let diaSemanaHoje = oHoje.getDay();

            // Calcula as horas do intervalo.
            if(diaSemanaProximoIntervalo === 7) {
                
                numDiasAcrescentar++;
            } else {

                // Calcula o numero de dias para o proximo dia da semana.
                if (diaSemanaProximoIntervalo <= diaSemanaHoje) {
                    numDiasAcrescentar = (7 - diaSemanaHoje) + diaSemanaProximoIntervalo;
                } else {
                    numDiasAcrescentar = diaSemanaProximoIntervalo - diaSemanaHoje;
                }
            }

            this.gerarHorasExibicaoIntervaloDia(oProximoIntervalo, numDiasAcrescentar);
        }
    }

    obterProximoIntervaloAgenda(diaInicial) {
        let oHoje = this.obterDia();
        let oIntervalosDia = [];
        let oIntervaloItem;
        
        if(oHoje && oHoje.dia_semana === diaInicial) {
            let oDataHoraAtual = new Date();
            let oDataHoraInicial = new Date();
            let oDataHoraFinal = new Date();
            let oDataHoraExibicao;
            let t;
            
            oIntervalosDia = oHoje.intervalos;

            for (let i = 0; i < oIntervalosDia.length; i++) {
                oIntervaloItem = oIntervalosDia[i];

                if(oIntervaloItem.ativado && oIntervaloItem.qtd_mensagens_intervalo > 0) {
                            
                    oDataHoraInicial.setHours(parseInt(oIntervaloItem.hora_inicial.hora), parseInt(oIntervaloItem.hora_inicial.minuto), 0, 0);
                    oDataHoraFinal.setHours(parseInt(oIntervaloItem.hora_final.hora), parseInt(oIntervaloItem.hora_final.minuto), 59, 59);
                
                    // Se o intervalo foi adicionado agora, verifica se a data hora atual estah dentro do novo intervalo.
                    if ((oDataHoraAtual >= oDataHoraInicial && oDataHoraAtual <= oDataHoraFinal) ||
                         oDataHoraAtual <= oDataHoraInicial) {  
                        
                        if(!oIntervaloItem.horas_exibicao || oIntervaloItem.horas_exibicao.length <= 0) {
                
                            // Gera as horas para o novo intervalo.
                            this.gerarHorasExibicaoIntervaloDia(oIntervaloItem, 0);
                        }
                    }

                    if(oIntervaloItem.horas_exibicao && oIntervaloItem.horas_exibicao.length > 0) {
                        
                        for(t = 0; t < oIntervaloItem.horas_exibicao.length; t++) {
                            // Verifica se as horas disponiveis no intervalo são maiores que a data hora atual.
                            oDataHoraExibicao = new Date(oIntervaloItem.horas_exibicao[t]);

                            if(oDataHoraExibicao > oDataHoraAtual) {                                
                                break;
                            }
                        }

                        // Exclui os intervalos com as horas passadas, se houver.
                        if(oIntervaloItem.horas_exibicao.length >= t) {
                            oIntervaloItem.horas_exibicao.splice(0, t);
                        }

                        oIntervaloItem.qtd_mensagens_intervalo = oIntervaloItem.horas_exibicao.length;

                        if(oIntervaloItem.ativado && oIntervaloItem.qtd_mensagens_intervalo > 0) {                            
                            return oIntervaloItem;
                        }
                    }
                }
            }
        }

        // Se não encontrou no dia de hoje, procura o próximo dia.
        let oProximoDia = this.obterProximoDiaSemana(diaInicial);

        if(oProximoDia) {
            
            oIntervalosDia = oProximoDia.intervalos;
        
            let qtd_mensagens_dia_disponiveis = 0;

            for (let i = 0; i < oIntervalosDia.length; i++) {
                
                oIntervaloItem = oIntervalosDia[i];
                if(oIntervaloItem.ativado) {
                    qtd_mensagens_dia_disponiveis += oIntervaloItem.qtd_mensagens_intervalo;
                }
            }

            if(qtd_mensagens_dia_disponiveis < oProximoDia.qtd_mensagens_dia) {
                this.definirDistribuicaoMensagensIntervalosDia(oProximoDia.dia_semana);
            }

            for (let i = 0; i < oIntervalosDia.length; i++) {
                oIntervaloItem = oIntervalosDia[i];

                if(oIntervaloItem.ativado && oIntervaloItem.qtd_mensagens_intervalo > 0) {
                    
                    return oIntervaloItem;
                }
            }

            // Retorna o dia de hoje para a funcao chamador saber onde continuar, se necessario.
            oIntervaloItem = clonarObjeto(DADOS_INTERVALO);
            oIntervaloItem.dia_semana = oProximoDia.dia_semana;

            return oIntervaloItem;
        }
        
        return null;        
    }

    obterProximaDataHoraIntervalo() {
        let oDataHoraAtual = new Date();
        let oDataHoraExibicao;
        let oDadosProximaDataHoraAgendar;
        let oProximoIntervalo;

        // Dia de hoje como ponto de partida.
        let diaHoje = oDataHoraAtual.getDay();
        let diaInicial = diaHoje;
        let numVezes = 0;
        let i;

        do {
            numVezes++;
            oDadosProximaDataHoraAgendar = null;

            // Consulta o proximo intervalo da agenda.
            oProximoIntervalo = this.obterProximoIntervaloAgenda(diaInicial);

            if(oProximoIntervalo) {
                diaInicial = oProximoIntervalo.dia_semana;

                if(!oProximoIntervalo.horas_exibicao || oProximoIntervalo.horas_exibicao.length <= 0) {
                    
                    this.gerarHorasExibicaoProximoIntervalo(oProximoIntervalo);                
                }
                
                for(i = 0; i < oProximoIntervalo.horas_exibicao.length; i++) {
                    
                    oDataHoraExibicao = new Date(oProximoIntervalo.horas_exibicao[i]);

                    if(oDataHoraExibicao > oDataHoraAtual) {

                        oDadosProximaDataHoraAgendar = clonarObjeto(DADOS_DATA_HORA_AGENDAMENTO);

                        oDadosProximaDataHoraAgendar.dia_semana = oProximoIntervalo.dia_semana;
                        oDadosProximaDataHoraAgendar.indice_hora = i;
                        oDadosProximaDataHoraAgendar.indice_intervalo = oProximoIntervalo.indice_lista;
                        oDadosProximaDataHoraAgendar.data_hora_agenda = oProximoIntervalo.horas_exibicao[i];
                        numVezes = 8;                       
                        break;
                    }
                }

                if(oProximoIntervalo.horas_exibicao.length >= i) {
                        
                    oProximoIntervalo.horas_exibicao.splice(0, i);
                    oProximoIntervalo.qtd_mensagens_intervalo = oProximoIntervalo.horas_exibicao.length;
                }
            }

        } while (numVezes < 8);

        return oDadosProximaDataHoraAgendar;
    }

    removerUltimaDataHoraAgendada() {
        console.log('[despertadorapp] removerUltimaDataHoraAgendada() ++++++++++++ iniciou ++++++++++++');
        let oDadosUltimaDataHoraAgendada = this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada;
                
        if(oDadosUltimaDataHoraAgendada && oDadosUltimaDataHoraAgendada.indice_hora >= 0) {
            // Limpa o objeto de controle da ultima data hora agendada.
            this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada = clonarObjeto(DADOS_DATA_HORA_AGENDAMENTO);
            
            console.log('[despertadorapp] removerUltimaDataHoraAgendada() Cancelando todas as notificacoes.');
            // Exclui o agendamento da ultima data hora.
            PushNotification.cancelAllLocalNotifications();
        }
        console.log('[despertadorapp] removerUltimaDataHoraAgendada() ------------ terminou ------------');
    }

    obterDia (diaSemana) {

        let oAgendaIntervalosDias;
        let oDiaSemanaItem;

        if(this.oDadosTelaConfiguracao.agenda_notificacoes) {
            oAgendaIntervalosDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
        }

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

    obterProximoDiaSemana(diaInicial) {

        let oAgendaIntervalosDias;
        let oProximoDia = null;
        let oHoje = new Date();
        
        if(this.oDadosTelaConfiguracao.agenda_notificacoes) {
            oAgendaIntervalosDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
        }
        if(oAgendaIntervalosDias) {
            oProximoDia = oAgendaIntervalosDias[7];
            
            if(oProximoDia) {
                return oProximoDia;
            }        
            
            let proximoDia = diaInicial + 1;
            
            // Procura pelo proximo intervalo a partir do dia de hoje ate o final da semana.
            for(; proximoDia < oAgendaIntervalosDias.length; proximoDia++) {
                
                oProximoDia = oAgendaIntervalosDias[proximoDia];
                
                if(oProximoDia && oProximoDia.qtd_mensagens_dia > 0) {
                    break;
                }
                oProximoDia = null;
            }

            // Se nao encontrou, procura do inicio ate o dia de hoje.
            if(!oProximoDia) {
                let diaHoje = oHoje.getDay();
                proximoDia = 0;

                for(; proximoDia <= diaHoje; proximoDia++) {
                
                    oProximoDia = oAgendaIntervalosDias[proximoDia];
                    
                    if(oProximoDia && oProximoDia.qtd_mensagens_dia > 0) {
                        break;
                    }
                    oProximoDia = null;
                }   
            }
        }
        return oProximoDia;
    }

    atribuirMensagensPorDia(diaSemana, qtdMensagensDia, callback) {
        let oDiaSemana = this.obterDia(diaSemana);

        if(oDiaSemana) {
            oDiaSemana.qtd_mensagens_dia = qtdMensagensDia;

            this.definirDistribuicaoMensagensIntervalosDia(diaSemana);
            this.obterProximaDataHoraExibicao();

            if(callback) {
                callback();
            }
        }
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

    agendarNotificacao(tipoAgendamento, emSegundoPlano) {
        console.log('[despertadorapp] agendarNotificacao() ++++++++++++ iniciou ++++++++++++');

        try {
            let oDadosProximaDataHoraAgendar = this.obterProximaDataHoraExibicao();
            
            if(oDadosProximaDataHoraAgendar && oDadosProximaDataHoraAgendar.data_hora_agenda) {

                if(oDadosProximaDataHoraAgendar.data_hora_agenda !== 'DATA_HORA_IGUAL') {
                    // Remove a ultima data hora agendada, pois sera fornecida nova data hora
                    this.removerUltimaDataHoraAgendada();
                    
                    let oDataHoraAgendar = new Date(oDadosProximaDataHoraAgendar.data_hora_agenda);
                    
                    oDadosProximaDataHoraAgendar.forma_agendamento = tipoAgendamento;
                    this.oDadosControleApp.primeira_vez = false;
                    this.oNotifService.scheduleNotif(oDataHoraAgendar, this.oDadosApp.dados_mensagens);
                    this.registrarUltimaDataHoraAgendada(oDadosProximaDataHoraAgendar);
                } else {
                    console.log('[despertadorapp] agendarNotificacao() Proxima data-hora: ', oDadosProximaDataHoraAgendar.data_hora_agenda);
                }
            } else {
                console.log('[despertadorapp] agendarNotificacao() Nao foi possivel determinar a proxima data-hora.');
                // Remove a ultima data hora agendada, pois sera fornecida nova data hora
                this.removerUltimaDataHoraAgendada();
            }
        } catch (exc) {
            console.log('[despertadorapp] agendarNotificacao() Erro ao determinar a proxima data-hora.', exc);

            if(!emSegundoPlano) {
                Alert.alert('Despertador de Consciência', 'Erro ao determinar a proxima data-hora.');
            }                
            // Remove a ultima data hora agendada, pois sera fornecida nova data hora
            this.removerUltimaDataHoraAgendada();
        }
        console.log('[despertadorapp] agendarNotificacao() ------------ terminou ------------');
    }

    verificarNotificacaoEmSegundoPlano(pTaskId) {
        console.log('[despertadorapp] verificarNotificacaoEmSegundoPlano() ++++++++++++ iniciou ++++++++++++');

        this.obterAgendaNotificacoesDoDispositivo(() => {
            if(new String(pTaskId).toUpperCase() === 'Ok'.toUpperCase()) {
                this.removerUltimaDataHoraAgendada();
            }
            this.oMensagem.obterDadosMensagens(() => {
                this.reagendarNotificacaoEmSegundoPlano(pTaskId)
            });
        });

        console.log('[despertadorapp] verificarNotificacaoEmSegundoPlano() ------------ terminou ------------');
    }

    reagendarNotificacaoEmSegundoPlano(taskId) {
        
        console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() ++++++++++++ iniciou ++++++++++++');
        
        try {
            console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() - this.oDadosTelaConfiguracao:', this.oDadosTelaConfiguracao);
            
            if(this.oDadosTelaConfiguracao && this.oDadosTelaConfiguracao.agenda_notificacoes) {
                let emSegundoPlanoSistema = false;
                let formaAgendamento = FORMAS_AGENDAMENTO.em_segundo_plano_ok;

                if(taskId && new String(taskId).toUpperCase() !== 'Ok'.toUpperCase()) {
                    emSegundoPlanoSistema = true;
                    formaAgendamento = FORMAS_AGENDAMENTO.em_segundo_plano_sistema;
                }
                                
                if(this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada) {
                    
                    let ultimaDataHoraAgendada = this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada;
                
                    if(ultimaDataHoraAgendada && ultimaDataHoraAgendada.data_hora_agenda) {
                        let oUltimaDataHoraAgendada = new Date(ultimaDataHoraAgendada.data_hora_agenda);
                        let oDataHoraAtual = new Date();

                        console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() - Ultima data-hora agendada: ', ultimaDataHoraAgendada.data_hora_agenda);
                        console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() - Data-hora atual: ', oDataHoraAtual.toLocaleString());
                        
                        if(emSegundoPlanoSistema) {
                            let horaAtual = oUltimaDataHoraAgendada.getHours();
                            oUltimaDataHoraAgendada.setHours((horaAtual + 1));
                            
                            console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() - Ultima data-hora agendada + 1 horas: ', oUltimaDataHoraAgendada.toLocaleString());
                        } else {

                            console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() - Ultima data-hora agendada: ', oUltimaDataHoraAgendada.toLocaleString());
                        }
                        
                        if(oUltimaDataHoraAgendada < oDataHoraAtual) {
                            console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() Data-hora agendada foi ignorada. Serah reagendada...');
                            
                            this.oMensagem.definirMensagemExibir(() => {    
                                this.agendarNotificacao(formaAgendamento, true);
                            });
                        } else {
                            console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() Data-hora agendada eh maior. Nada a ser feito...');
                        }
                    } else {
                        console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() Data-hora agendada nao encontrada. Serah agendada...');
                        
                        this.oMensagem.definirMensagemExibir(() => {
                            this.agendarNotificacao(formaAgendamento, true);
                        });
                    }
                } else {
                    console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() Nao encontrou dados de configuracoes salvos no dispositivo.');
                }
            } else {
                console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() Nao encontrou a agenda de notificacoes salva no dispositivo.');
            }
            
        } catch(e) {
            console.error('[despertadorapp] reagendarNotificacaoEmSegundoPlano() Erro ao reagendarNotificacaoEmSegundoPlano()... ', e);
        }

        if(taskId) {
            
            console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() ... finalizando headlessTask() taskId =', taskId);
            // Required:  Signal to native code that your task is complete.
            // If you don't do this, your app could be terminated and/or assigned
            // battery-blame for consuming too much time in background.
            BackgroundFetch.finish(taskId);
        }
        console.log('[despertadorapp] reagendarNotificacaoEmSegundoPlano() ------------ terminou ------------');
    }

    aoRegistrarNotificacao(token) {
        console.log('aoRegistrarNotificacao: ', token);
    }
    
    aoNotificar(notif) {
        console.log('[despertadorapp] aoNotificar() ++++++++++++ iniciou ++++++++++++');
        console.log('[despertadorapp] aoNotificar() - idClearTimeout', this.oDadosControleApp.idClearTimeout);
        
        if(this.oDadosControleApp.idClearTimeout) {
            // Anula a chamada da funcao inicializar(), da tela inicial (TelaMensagem), 
            // cuja execucao foi postergada na abertura do app pelo setTimeout().
            clearTimeout(this.oDadosControleApp.idClearTimeout);
            this.oDadosControleApp.idClearTimeout = null;
        }

        this.obterAgendaNotificacoesDoDispositivo(() => {

            this.oMensagem.obterDadosMensagens(() => {
             
                this.oMensagem.definirMensagemExibir(() => {

                    console.log('[despertadorapp] aoNotificar(), Vai recarregar a tela de mensagens...');                    
                    this.oGerenciadorContextoApp.atualizarEstadoTela();

                    this.oUtil.fecharMensagem();
                    this.agendarNotificacao(FORMAS_AGENDAMENTO.ao_abrir_notificacao);
                });
            });
        });

        console.log('[despertadorapp] aoNotificar() ------------ terminou ------------');
    }
}