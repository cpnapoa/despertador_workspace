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

        this.salvarAgendaNotificacoesNoDispositivo = this.salvarAgendaNotificacoesNoDispositivo.bind(this);
        this.obterAgendaNotificacoesDoDispositivo = this.obterAgendaNotificacoesDoDispositivo.bind(this);
        this.obterConfiguracoesNoDispositivo = this.obterConfiguracoesNoDispositivo.bind(this);
        this.adicionarIntervaloDiaSemana = this.adicionarIntervaloDiaSemana.bind(this);
        this.gerarHoraAleatoria = this.gerarHoraAleatoria.bind(this);
        this.gerarHorasExibicaoIntervaloDia = this.gerarHorasExibicaoIntervaloDia.bind(this);
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
        this.atribuirMensagensPorDia = this.atribuirMensagensPorDia.bind(this);
    }
    
    salvarConfiguracoes(bSalvar, callback) {

        if(!this.oGerenciadorContextoApp.appAtivo || bSalvar === true) {
            this.salvarAgendaNotificacoesNoDispositivo(this.agendarNotificacao, callback);
        }
    }

    salvarAgendaNotificacoesNoDispositivo (callback, callback2) {
        try {
            AsyncStorage.setItem('agenda_notificacoes', JSON.stringify(this.oDadosTelaConfiguracao.agenda_notificacoes))
            .then(() => {
            
                if(callback) {
                    callback();

                    if(callback2) {
                        callback2();
                    }
                };
            })

        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao salvar intervalos no dispositivo: ' + error);
        }
    }

    obterAgendaNotificacoesDoDispositivo (callback) {
        try {                   
            let dados;
            
            AsyncStorage.getItem('agenda_notificacoes').then((valor) => {
            
                if(valor) {

                    dados = JSON.parse(valor);

                    this.oDadosTelaConfiguracao.agenda_notificacoes = dados;
                    
                    if(callback) {
                        callback();
                    }
                }
            })

        } catch (error) {

            Alert.alert('Despertador de Consciência', 'Erro ao ler intervalos do dispositivo: ' + error);
        }
    }

    obterConfiguracoesNoDispositivo(callback) {
        
         this.obterAgendaNotificacoesDoDispositivo(callback);
    }

    excluirIntervaloDiaSemana(diaSemana, indiceIntervalo) {

        let oDiaSemana = this.obterDia(diaSemana);

        if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > indiceIntervalo) {
            
            oDiaSemana.intervalos.splice(indiceIntervalo, 1);

            if(oDiaSemana.intervalos.length === 0) {

                // Remove o dia da semana tambem.
                this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias[diaSemana] = null;
            }

            this.definirDistribuicaoMensagensIntervalosDia(diaSemana);            
            this.obterProximaDataHoraExibicao();
        }
    }

    definirDistribuicaoMensagensIntervalosDia(diaSemana) {
        let oDiaSemana = this.obterDia(diaSemana);
        
        if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > 0) {
            let oIntervalosAdicionados = []; //lista contendo os índices dos intervalos que já receberam mensagem
            let qtdIntervalos = oDiaSemana.intervalos.length; //inicialização da quantidade total de intervalos
            let indiceAdicionar; //é o índice do intervalo que terá o numero de mensagens alterado
            let adicionar; //flag para identificar se um intervalo já tem mensagens ou não

            // Zera todos os intervalos.
            for(let i = 0; i < oDiaSemana.intervalos.length; i++) {
                oDiaSemana.intervalos[i].qtd_mensagens_intervalo = 0;
                oDiaSemana.intervalos[i].horas_exibicao = [];
            }

            for(let i = 0; i < oDiaSemana.qtd_mensagens_dia; i++) { //para cada mensagem
                indiceAdicionar = this.oUtil.getRand(qtdIntervalos); //é sorteado um intervalo
                
                if(oIntervalosAdicionados.length > 0) { //se algum intervalo já tiver sido adicionado

                    indiceAdicionar = this.oUtil.getRand(qtdIntervalos); //escolhe-se um intervalo aleatoriamente
                    adicionar = true; //marca o intervalo como passivel de receber mensagem
                    
                    for(a = 0; a < oIntervalosAdicionados.length; a++) {//para cada intervalo já adicionado
                        
                        // Procura o indice dentre os ja utilizados.
                        if(oIntervalosAdicionados[a] === indiceAdicionar) {

                            adicionar = false;//marca o intervalo como já tendo uma mensagem
                            break;
                        }
                    } //ou seja, se o intervalo escolido estiver na lista de intervalos que já receberam mensagens, adicionar = false                        

                    if(!adicionar) {//'adicionar' será 'false' quando o intervalo escolhido já tiver uma mensagem
                        // Procura o proximo intervalo ainda não usado, para garantir que não ficará sem nenhum mensagem.
                        for(let y = 0; y < oDiaSemana.intervalos.length; y++) {

                            if(!oDiaSemana.intervalos[y].qtd_mensagens_intervalo) {//se o intervalo estiver vazio
                                
                                indiceAdicionar = y;//define-se esse intervalo como o próximo a receber a mensagem
                                break;
                            }
                        }
                    }
                }                
            
                // Incrementa o numero de mensagens a exibir do intervalo.
                oDiaSemana.intervalos[indiceAdicionar].qtd_mensagens_intervalo++;//adiciona a mensagem no intervalo
                        
                oIntervalosAdicionados.push(indiceAdicionar);//coloca-se o índice do intervalo adicionado na lista de intervalos que já receberam mensagem
                
                if((oIntervalosAdicionados.length) === qtdIntervalos) {//quando todos os intervalos já tiverem recebido uma mensagem
                    oIntervalosAdicionados = [];//reseta a lista de intervalos que receberam mensagens para que eles possam receber outra mensagem
                }//ou seja, um intervalo só vai receber a segunda mensagem se todos os interavalos já tiverem ao menos uma mensagem.
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
        
        // Valida se a hor final é maior que a hora inicial
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

        // Valida se o intervalo posui no mínimo 30 minutos


        // Calcula quantas mensagens cabem no intervalo

        return intervaloOk;
    }

    gerarHorasExibicaoIntervaloDia(oIntervaloDia, numDiasAcrescentar) {
        let bGerou = false;

        if(oIntervaloDia && oIntervaloDia.hora_inicial && oIntervaloDia.hora_final) {
            oIntervaloDia.horas_exibicao = [];
            let oHoraCalculada = [];
            let oHoraAtual = new Date();
            let intervalo = 0;
            let k = 0;


            //sorteio e validação do intervalo mínimo entre os horários sorteados
            for(let i = 0; i < oIntervaloDia.qtd_mensagens_intervalo; i++){
                oHoraCalculada[i] = this.gerarHoraAleatoria(oIntervaloDia.hora_inicial, oIntervaloDia.hora_final);//sorteia um horário

                for (let j = 0; j < i; j++){//compara todos os valores sorteados para um intervalo
                    if( i != j){
                        intervalo = Math.abs((oHoraCalculada[i] - oHoraCalculada[j]) / (1000*60)); //calcula a diferença dos intervalos e transforma em minutos
                        //Alert.alert('Despertador de Consciência', 'o intervalo é '+ intervalo);
                        
                        k = 0 //k é um contador no caso de o programa não conseguir sortear um horário válido
                        while (intervalo < 15) {
                            oHoraCalculada[j] = this.gerarHoraAleatoria(oIntervaloDia.hora_inicial, oIntervaloDia.hora_final);
                            intervalo = oHoraCalculada[i] - oHoraCalculada[j];
                            if (k > 30) { //se não conseguir sortear um horário válido em 30 tentativas...
                                oHoraCalculada[j] = oHoraCalculada[j] + 16*60*1000; //...define para 16 minutos depois
                                break;
                            }
                            k++
                            //Alert.alert('Despertador de Consciência', 'o intervalo é '+ intervalo);
                        }
                       
                    }
                }

            }

            


            for (i = 0; i < oIntervaloDia.qtd_mensagens_intervalo; i++){// faz o push das horas sorteadas

                oHoraCalculada[i].setDate(oHoraCalculada[i].getDate() + numDiasAcrescentar);
                
                
                if(oHoraCalculada[i] > oHoraAtual) {
                    bGerou = true;
                    oIntervaloDia.horas_exibicao.push(oHoraCalculada[i].toJSON());
                } else {
                    bGerou = false;
                    break;
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
        
        let oDadosProximaDataHoraAgendar = this.obterProximaDataHoraIntervalo();

        if(oDadosProximaDataHoraAgendar && oDadosProximaDataHoraAgendar.data_hora_agenda) {
            
            let oDadosUltimaDataHoraAgendada = this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada;

            if(oDadosUltimaDataHoraAgendada &&
               oDadosUltimaDataHoraAgendada.data_hora_agenda === oDadosProximaDataHoraAgendar.data_hora_agenda) {
           
                oDadosProximaDataHoraAgendar.data_hora_agenda = 'DATA_HORA_IGUAL';
            }
        } else {
            Alert.alert('Configure os intervalos de tempo para o despertar da sua consciência.');
        }

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

                if(oIntervaloItem.qtd_mensagens_intervalo > 0) {
                            
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

                        if(oIntervaloItem.qtd_mensagens_intervalo > 0) {                            
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
                qtd_mensagens_dia_disponiveis += oIntervaloItem.qtd_mensagens_intervalo;
            }

            if(qtd_mensagens_dia_disponiveis < oProximoDia.qtd_mensagens_dia) {
                this.definirDistribuicaoMensagensIntervalosDia(oProximoDia.dia_semana);
            }

            for (let i = 0; i < oIntervalosDia.length; i++) {
                oIntervaloItem = oIntervalosDia[i];

                if(oIntervaloItem.qtd_mensagens_intervalo > 0) {
                    
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
        let oDadosUltimaDataHoraAgendada = this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_data_hora_agendada;
                
        if(oDadosUltimaDataHoraAgendada && oDadosUltimaDataHoraAgendada.indice_hora >= 0) {
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

    obterProximoDiaSemana(diaInicial) {

        let oAgendaIntervalosDias = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos_dias;
        let oProximoDia = null;
        let oHoje = new Date();
        
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

    configurarNotificacao(oTelaMensagem, oNavegacao) {
        var obterConfiguracoesNoDispositivo = this.obterConfiguracoesNoDispositivo;

        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function (token) {
                // console.log("TOKEN:", token);
            },
    
            // (required) Called when a remote or local notification is opened or received
            onNotification: function (notificacao) {
                // console.log("NOTIFICATION:", notificacao);

                oNavegacao.navigate('Mensagem');
                obterConfiguracoesNoDispositivo(oTelaMensagem.carregar);
    
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
                    // Remove a ultima data hora agendada, pois sera fornecida nova data hora
                    this.removerUltimaDataHoraAgendada();
                    
                    let oDataHoraAgendar = new Date(oDadosProximaDataHoraAgendar.data_hora_agenda);

                    PushNotification.localNotificationSchedule({
                        //... You can use all the options from localNotifications
                        bigText: this.oDadosApp.mensagem_proxima.texto_proxima, //remover essa linha para remover mensagem na notificação
                        message: this.oDadosApp.mensagem_proxima.texto_proxima, //remover essa linha para remover mensagem na notificação
                        //message: 'Abra o app e desperte sua consciência...', //adicionar essa linha para remover mensagem na notificação
                        playSound: false,
                        //allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
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

                // Remove a ultima data hora agendada, pois sera fornecida nova data hora
                this.removerUltimaDataHoraAgendada();
            }
        } else {
            
            // Remove a ultima data hora agendada, pois sera fornecida nova data hora
            this.removerUltimaDataHoraAgendada();
        }
    }
}