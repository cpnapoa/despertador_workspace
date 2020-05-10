/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import Util, { clonarObjeto } from '../common/Util';
import {DADOS_DIA_SEMANA} from '../contexts/DadosAppGeral';
import {
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

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
        this.calcularIntervalos = this.calcularIntervalos.bind(this);
        this.gerarHoraAleatoria = this.gerarHoraAleatoria.bind(this);

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

    adicionarIntervaloDiaSemana(diaSemana, oIntervaloAdicionar) {
        let oIntervaloDiaSemanaAtual;

        this.oDadosTelaConfiguracao.intervalos_dias_semana.forEach(oIntervaloDiaItem => {
            // Procura o dia da semana.
            if(oIntervaloDiaItem.dia_semana === diaSemana) {
                oIntervaloDiaSemanaAtual = oIntervaloDiaItem;
                return;
            }
        });

        if(oIntervaloDiaSemanaAtual) {
            // TODO: Deve ser validado se nao tem intervalo sobrescrito.
            oIntervaloDiaSemanaAtual.intervalos.push(oIntervaloAdicionar);
        } else {
            // Cria o dia da semana e adiciona o primeiro intervalo ao dia.
            oIntervaloDiaSemanaAtual = clonarObjeto(DADOS_DIA_SEMANA);
            oIntervaloDiaSemanaAtual.dia_semana = diaSemana;
            oIntervaloDiaSemanaAtual.intervalos.push(oIntervaloAdicionar);
            this.oDadosTelaConfiguracao.intervalos_dias_semana.push(oIntervaloDiaSemanaAtual);
        }
    }

    calcularIntervalos(listaIntervalos) {
        if(listaIntervalos && listaIntervalos instanceof Array) {
            listaIntervalos.forEach(dia_semana => {
                let intervaloDia = dia_semana.intervalo;
                let qtdMensagens = dia_semana.intervalo.qtd_mensagens;
                
                for(let i = 0; i < qtdMensagens; i++){
                    //TODO: Deve ser implementado calculo de intervalo minimo entre as mensagens.

                    intervaloDia.horas_exibicao.push(this.gerarHoraAleatoria(intervaloDia.hora_inicial, intervaloDia.hora_final));
                }
            });
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

}
