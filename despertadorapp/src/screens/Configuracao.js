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
        this.salvarIntervalosNoDispositivo = this.salvarIntervalosNoDispositivo.bind(this);
        this.obterListaIntervalosNoDispositivo = this.obterListaIntervalosNoDispositivo.bind(this);
        this.adicionarIntervaloDiaSemana = this.adicionarIntervaloDiaSemana.bind(this);
        this.gerarHoraAleatoria = this.gerarHoraAleatoria.bind(this);
        this.gerarHorasExibicaoIntervaloDia = this.gerarHorasExibicaoIntervaloDia.bind(this);
        this.configurarNotificacao = this.configurarNotificacao.bind(this);
        this.agendarNotificacao = this.agendarNotificacao.bind(this);
        this.obterDiaSemana = this.obterDiaSemana.bind(this);
        this.obterHoraMaisRecenteDiaSemana = this.obterHoraMaisRecenteDiaSemana.bind(this);
        this.obterProximaHoraMensagemDiaSemana = this.obterProximaHoraMensagemDiaSemana.bind(this);
        this.calcularHorasExibicaoDiaSemana = this.calcularHorasExibicaoDiaSemana.bind(this);
        //this. = this..bind(this);
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

    async salvarIntervalosNoDispositivo () {
        try {                   

            let promiseIntervalos = AsyncStorage.setItem('intervalos_mensagens', JSON.stringify(this.oDadosTelaConfiguracao.intervalos_dias_semana));

            await promiseIntervalos;
        } catch (error) {
            console.log(error);
            Alert.alert('Despertador de Consciência', 'Erro ao salvar intervalos no dispositivo: ' + error);
        }
    }

    async obterListaIntervalosNoDispositivo () {
        try {                   
            
            let promiseIntervalos = await AsyncStorage.getItem('intervalos_mensagens');
            
            if(promiseIntervalos) {
                
                return JSON.parse(promiseIntervalos);
            }
            
            return null;

        } catch (error) {
            console.log(error);
            Alert.alert('Despertador de Consciência', 'Erro ao ler intervalos do dispositivo: ' + error);
        }
    }

    adicionarIntervaloDiaSemana(diaSemana, oIntervaloDiaAdicionar) {
        let oIntervaloDiaSemanaAtual;

        this.oDadosTelaConfiguracao.intervalos_dias_semana.forEach(oIntervaloDiaItem => {
            // Procura o dia da semana.
            if(oIntervaloDiaItem.dia_semana === diaSemana) {
                oIntervaloDiaSemanaAtual = oIntervaloDiaItem;
                return;
            }
        });

        if(oIntervaloDiaSemanaAtual) {
            // TODO: Deve ser validado se nao tem intervalos concomitantes.
            oIntervaloDiaSemanaAtual.intervalos.push(oIntervaloDiaAdicionar);
        } else {
            // Cria o dia da semana e adiciona o primeiro intervalo ao dia.
            oIntervaloDiaSemanaAtual = clonarObjeto(DADOS_DIA_SEMANA);
            oIntervaloDiaSemanaAtual.dia_semana = diaSemana;
            oIntervaloDiaSemanaAtual.intervalos.push(oIntervaloDiaAdicionar);

            this.oDadosTelaConfiguracao.intervalos_dias_semana.push(oIntervaloDiaSemanaAtual);
        }
    }

    obterProximaHoraMensagemDiaSemana(diaSemana) {
        
        let oIntervaloDiaSemanaAtual = this.obterDiaSemana(diaSemana);
        
        if(oIntervaloDiaSemanaAtual) {
            // Calcula as horas de exibicao da mensagem no dia, conforme os intervalos, se não existir nenhuma.
            this.calcularHorasExibicaoDiaSemana(diaSemana);
            
            return this.obterHoraMaisRecenteDiaSemana(diaSemana);

        } else {
            Alert.alert('Não foi encontrada configuração para o dia de hoje, da semana.');
        }
    }

    gerarHorasExibicaoIntervaloDia(oIntervaloDia) {
        if(oIntervaloDia && oIntervaloDia.hora_inicial && oIntervaloDia.hora_final) {
            oIntervaloDia.horas_exibicao = [];
            
            for(let i = 0; i < oIntervaloDia.qtd_mensagens; i++){
                //TODO: Deve ser implementado calculo de intervalo minimo entre as mensagens (talvez utilizando uma porcentagem do tamanho do intervalo em minutos).
                
                oIntervaloDia.horas_exibicao.push(this.gerarHoraAleatoria(oIntervaloDia.hora_inicial, oIntervaloDia.hora_final));
            }
        }
    }

    calcularHorasExibicaoDiaSemana(diaSemana) {
        let oIntervaloDiaSemanaAtual = this.obterDiaSemana(diaSemana);
        let oHoraExibicaoAtual = this.obterHoraMaisRecenteDiaSemana(diaSemana);

        if(!oHoraExibicaoAtual) {
            // Recalcula todas as horas do dia, pois não encontrou nenhuma.
            oHoraExibicaoAtual = oIntervaloDiaSemanaAtual.intervalos.forEach(oIntervaloItem => {
                this.gerarHorasExibicaoIntervaloDia(oIntervaloItem);
            });
        }

    }

    obterHoraMaisRecenteDiaSemana(diaSemana) {
        let oIntervaloDiaSemanaAtual = this.obterDiaSemana(diaSemana);
        let oHoraExibicaoAtual;
        
        oIntervaloDiaSemanaAtual.intervalos.forEach(oIntervaloItem => {
            if(oIntervaloItem.horas_exibicao && oIntervaloItem.horas_exibicao.length > 0) {
                // Retorna a primeira hora previamente calculada do array e remove a mesma.
                oHoraExibicaoAtual = oIntervaloItem.horas_exibicao.shift();
                return;
            }
        });
        
        return oHoraExibicaoAtual;
    }

    obterDiaSemana (diaSemana){
        let oIntervaloDiaItemAtual;

        this.oDadosTelaConfiguracao.intervalos_dias_semana.forEach(oIntervaloDiaItem => {
            // Procura o dia da semana.
            if(oIntervaloDiaItem.dia_semana === diaSemana) {
                oIntervaloDiaItemAtual = oIntervaloDiaItem;
                return;
            }
        });

        return oIntervaloDiaItemAtual;
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

    configurarNotificacao(oNavegacao, oDadosControleApp) {
        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function (token) {
                console.log("TOKEN:", token);
            },
    
            // (required) Called when a remote or local notification is opened or received
            onNotification: async function (notificacao) {
                console.log("NOTIFICATION:", notificacao);
                
                oDadosControleApp.exibir_mensagem = true;
                oNavegacao.popToTop();
    
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
            popInitialNotification: true,
    
            /**
             * (optional) default: true
             * - Specified if permissions (ios) and token (android and ios) will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             */
            requestPermissions: false
        });
    }

    agendarNotificacao() {
        // let PushNotification = require("react-native-push-notification");
        let oHoraInicial = clonarObjeto(HORA_MENSAGEM);
        let oHoraFinal = clonarObjeto(HORA_MENSAGEM);
        
        oHoraInicial.hora = this.oDadosTelaConfiguracao.h1;
        oHoraInicial.minuto = this.oDadosTelaConfiguracao.m1;
        oHoraFinal.hora = this.oDadosTelaConfiguracao.h2;
        oHoraFinal.minuto = this.oDadosTelaConfiguracao.m2;

        let dataHora = this.obterProximaHoraMensagemDiaSemana(1);
        
        // this.oGerenciadorContextoApp.atualizarEstadoTela(this);

        PushNotification.localNotificationSchedule({
            //... You can use all the options from localNotifications
            message: 'Desperte sua consciência...',
            playSound: false,
            date: dataHora
        });
    }
}
