/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import Util, { clonarObjeto } from '../common/Util';
import {DADOS_DIA_SEMANA, HORA_MENSAGEM} from '../contexts/DadosAppGeral';
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
        this.obterProximaDataHoraAgenda = this.obterProximaDataHoraAgenda.bind(this);
        this.obterProximoDiaSemana = this.obterProximoDiaSemana.bind(this);
        this.obterProximaDataHoraExibicao = this.obterProximaDataHoraExibicao.bind(this);
        this.validarIntervalo = this.validarIntervalo.bind(this);
        this.compararHora = this.compararHora.bind(this);
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
        let oIntervalosDiasSemana = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos;

        if(oIntervalosDiasSemana && oIntervalosDiasSemana.length > diaSemana) {
            let oDiaSemana = oIntervalosDiasSemana[diaSemana];

            if(oDiaSemana && oDiaSemana.intervalos && oDiaSemana.intervalos.length > indiceIntervalo) {
                oDiaSemana.intervalos.splice(indiceIntervalo, 1);
          
                this.salvarAgendaNotificacoesNoDispositivo();
            }
        }
    }

    ordenarIntervalosDiaSemana(diaSemana) {
        let oDiaSemana = this.obterDia(diaSemana);
     
        if(oDiaSemana){
            oDiaSemana.intervalos.sort((oIntervalo1, oIntervalo2) => {
                if(oIntervalo1 && oIntervalo2) {
                    let dh1 = new Date();
                    let dh2 = new Date();
            
                    dh1.setHours(parseInt(oIntervalo1.hora_inicial.hora), parseInt(oIntervalo1.hora_inicial.minuto), 0, 0);
                    dh2.setHours(parseInt(oIntervalo2.hora_inicial.hora), parseInt(oIntervalo2.hora_inicial.minuto), 59, 999);
            
                    return this.compararHora(dh1, dh2);
                }
            })
        }
    }

    adicionarIntervaloDiaSemana(diaSemana, oIntervaloDiaAdicionar) {
        
        let oIntervalosDiasSemana = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos;
        let oIntervaloDiaAtual = oIntervalosDiasSemana[diaSemana];
        
        if(oIntervaloDiaAtual) {
            if(this.validarIntervalo(diaSemana, oIntervaloDiaAdicionar)) {

                oIntervaloDiaAtual.intervalos.push(oIntervaloDiaAdicionar);
            }
        } else {
            // Cria o dia da semana e adiciona o primeiro intervalo ao dia.
            oIntervaloDiaAtual = clonarObjeto(DADOS_DIA_SEMANA);
            oIntervaloDiaAtual.dia_semana = diaSemana;
            oIntervaloDiaAtual.intervalos.push(oIntervaloDiaAdicionar);

            this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos[diaSemana] = oIntervaloDiaAtual;
        }

        this.ordenarIntervalosDiaSemana(diaSemana);
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
            let oAgora = new Date();

            if(oIntervalosDia) {
                let hora_inicial_item;
                let hora_final_item;
                
                
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
            
            if(intervaloOk) {
                if(diaSemana === oAgora.getDay()) {
                    if(oAgora <= hora_final_validar) {
                        // Calcula a data/hora exibicao do novo intervalo adicionado, que está dentro da hora atual ou futura.
                        this.gerarHorasExibicaoIntervaloDia(oIntervaloValidar, 0);
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

            for(let i = 0; i < oIntervaloDia.qtd_mensagens; i++){
                //TODO: Deve ser implementado calculo de intervalo minimo entre as mensagens (talvez utilizando uma porcentagem do tamanho do intervalo em minutos).
                oHoraCalculada = this.gerarHoraAleatoria(oIntervaloDia.hora_inicial, oIntervaloDia.hora_final);
                oHoraCalculada.setDate(oHoraCalculada.getDate() + numDiasAcrescentar);
                
                if(oHoraCalculada > oHoraAtual) {
                    bGerou = true;
                    oIntervaloDia.horas_exibicao.push(oHoraCalculada.toJSON());
                }
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
        
        // Consulta a proxima hora existente do dia de hoje, para saber se existe.
        let proximaHoraExibicao = this.obterProximaDataHoraAgenda();
        let bGerouHorasDia = false;
        let oDataHoraExibicao;
        let oDataHoraAtual = new Date();

        if(proximaHoraExibicao) {
            
            oDataHoraExibicao = new Date(proximaHoraExibicao);
            
            if (oDataHoraExibicao < oDataHoraAtual) {
                // Descarta a proxima hora obtida, pois já passou.
                this.removerProximaDataHoraAgenda();
                // Tenta obter a proxima hora novamente, se existir
                proximaHoraExibicao = this.obterProximaDataHoraAgenda();
            }
        } 
        
        if(!proximaHoraExibicao || oDataHoraExibicao.getDate() > oDataHoraAtual.getDate()) {
            
            let oIntervaloDiaSemanaAtual = this.obterDia();

            // Nao encontrou proxima hora, entao vai calcular as proximas horas.
            if(oIntervaloDiaSemanaAtual) {
                // Tenta calcular as horas futuras do dia de hoje, pois não encontrou nenhuma.
                oIntervaloDiaSemanaAtual.intervalos.forEach(oIntervaloItem => {
                    bGerouHorasDia = this.gerarHorasExibicaoIntervaloDia(oIntervaloItem, 0);
                });
            }

            if(!bGerouHorasDia && !proximaHoraExibicao) {
                // Se nao tem mais horas para o dia de hoje, calcula as do proximo dia da semana definido.
                let oProximoDiaSemana = this.obterProximoDiaSemana();
             
                if(oProximoDiaSemana) {
                    let numDiasAcrescentar = 0;
                    
                    if(oProximoDiaSemana.dia_semana === 7) {
                        numDiasAcrescentar++;
                    } else {
                        let oHoje = new Date();
                        let diaSemanaHoje = oHoje.getDay();
                    
                        // Calcula o numero de dias para o proximo dia da semana.
                        if (oProximoDiaSemana.dia_semana < diaSemanaHoje) {
                            numDiasAcrescentar = (7 - diaSemanaHoje) + oProximoDiaSemana.dia_semana;
                        } else {
                            numDiasAcrescentar = oProximoDiaSemana.dia_semana - diaSemanaHoje;
                        }
                    }

                    // Calcula todas as horas do proximo dia.
                    oProximoDiaSemana.intervalos.forEach(oIntervaloItem => {
                        bGerouHorasDia = this.gerarHorasExibicaoIntervaloDia(oIntervaloItem, numDiasAcrescentar);
                    });
                }
            }            
        }

        if(bGerouHorasDia) {
            // Retira a proxima hora gerada da agenda.
            proximaHoraExibicao = this.obterProximaDataHoraAgenda();            
        }

        if(proximaHoraExibicao && 
           proximaHoraExibicao === this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_hora_agendada) {
                
            proximaHoraExibicao = 'DATA_HORA_IGUAL';
        } else {
            this.salvarAgendaNotificacoesNoDispositivo();
        }

        return proximaHoraExibicao;
    }

    obterProximaDataHoraAgenda() {
        let oIntervalosHoje = this.obterDia();
        let oIntervalosDia = [];
        let oIntervaloItem;
        let horaExibicaoString;
        
        if(oIntervalosHoje) {
            oIntervalosDia = oIntervalosHoje.intervalos;
            
            for (let i = 0; i < oIntervalosDia.length; i++) {
                oIntervaloItem = oIntervalosDia[i];

                if(oIntervaloItem.horas_exibicao && oIntervaloItem.horas_exibicao.length > 0) {
                    // Retorna a primeira hora previamente calculada do array, sem remove-la.
                    horaExibicaoString = oIntervaloItem.horas_exibicao[0];
                    
                    horaExibicaoString;
                    break;
                }
            }
            if(!horaExibicaoString) {
                let oIntervaloProximoDia = this.obterProximoDiaSemana();

                if(oIntervaloProximoDia) {
                    oIntervalosDia = oIntervaloProximoDia.intervalos;

                    for (let i = 0; i < oIntervalosDia.length; i++) {
                        oIntervaloItem = oIntervalosDia[i];

                        if(oIntervaloItem.horas_exibicao && oIntervaloItem.horas_exibicao.length > 0) {
                            // Retorna a primeira hora previamente calculada do array, sem remove-la.
                            horaExibicaoString = oIntervaloItem.horas_exibicao[0];
                            
                            horaExibicaoString;
                            break;
                        }
                    }       
                }
            }
        }
        return horaExibicaoString;
    }

    removerProximaDataHoraAgenda() {
        let oIntervalosHoje = this.obterDia();
        let oIntervalosDia = [];
        let oIntervaloItem;
        let horaExibicaoString;
        
        if(oIntervalosHoje) {
            oIntervalosDia = oIntervalosHoje.intervalos;
        }

        for (let i = 0; i < oIntervalosDia.length; i++) {
            
            oIntervaloItem = oIntervalosDia[i];

            if(oIntervaloItem.horas_exibicao && oIntervaloItem.horas_exibicao.length > 0) {
                
                // Retorna a primeira hora previamente calculada do array, removendo-a.
                horaExibicaoString = oIntervaloItem.horas_exibicao.shift();
                
                return horaExibicaoString;
            }
        }
    }

    obterDia (diaSemana) {

        let oIntervalosDiasSemana = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos;
        let oDiaSemanaItem;

        if(oIntervalosDiasSemana) {
            oDiaSemanaItem = oIntervalosDiasSemana[7];
            
            if(!oDiaSemanaItem) {
                
                if(!diaSemana || diaSemana < 0) {
                    let oHoje = new Date();
                    diaSemana = oHoje.getDay();
                }
                
                oDiaSemanaItem = oIntervalosDiasSemana[diaSemana];
            }
        }   

        return oDiaSemanaItem;
    }

    obterProximoDiaSemana () {

        let oIntervalosDiasSemana = this.oDadosTelaConfiguracao.agenda_notificacoes.agenda_intervalos;
        let oProximoDia;
        let oHoje = new Date();
        
        oProximoDia = oIntervalosDiasSemana[7];
        
        if(oProximoDia) {
            return oProximoDia;
        }
        
        let diaHoje = oHoje.getDay();
        
        // Procura pelo proximo intervalo no maximo 7 vezes.
        for(let cont = 0; cont < 7; cont++) {
            
            diaHoje++;
            oProximoDia = oIntervalosDiasSemana[diaHoje];
            
            if(oProximoDia) {
                break;
            }

            if(diaHoje === 6) {            
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

    registrarUltimaDataHoraAgendada(dataHora) {
        this.oDadosTelaConfiguracao.agenda_notificacoes.ultima_hora_agendada = dataHora;

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
        
        let dataHora = this.obterProximaDataHoraExibicao();
        
        if(dataHora) {
            
            try {
                if(dataHora !== 'DATA_HORA_IGUAL') {
                    let oDataHoraAgendar = new Date(dataHora);

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
                    
                    this.registrarUltimaDataHoraAgendada(dataHora);
                }
            } catch (exc) {
                Alert.alert(`Erro ao agendar hora no dispositivo: ${exc}`);
            }
        } else {
            Alert.alert('Configure os intervalos de tempo para o despertar da sua consciência.');
        }
    }
}