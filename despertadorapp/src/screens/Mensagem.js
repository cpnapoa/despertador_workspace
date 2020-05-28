import Util from '../common/Util';
import {
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { call, Value } from 'react-native-reanimated';

export default class Mensagem {

    constructor(gerenciadorContexto) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTelaConfiguracao = this.oDadosApp.tela_configuracao;
        }

        // this.sincronizarMensagensComServidor = this.sincronizarMensagensComServidor.bind(this);
        this.tratarBuscarMensagens = this.tratarBuscarMensagens.bind(this);
        this.listar = this.listar.bind(this);
        this.chamarServico = this.chamarServico.bind(this);
        this.tratarRespostaHTTP = this.tratarRespostaHTTP.bind(this);
        this.obterProximaMensagem = this.obterProximaMensagem.bind(this);
        this.salvarMensagensNoDispositivo = this.salvarMensagensNoDispositivo.bind(this);
        this.lerMensagensExibir = this.lerMensagensExibir.bind(this);
        this.lerMensagensExibidas = this.lerMensagensExibidas.bind(this);

        this.oUtil = new Util();
    }

    // // Busca na base de dados as mensagens cadastradas e salva no dispositivo.
    // async sincronizarMensagensComServidor() {
    //     // let listaMensagensExibir = await this.lerMensagensExibir();
        
    //     // listaMensagensExibir;

    //     // if(!listaMensagensExibir || (listaMensagensExibir instanceof Array && listaMensagensExibir.length <= 0)) { 
            
    //     // }
    // }    

    tratarBuscarMensagens(oJsonMensagens) {
        if(oJsonMensagens && oJsonMensagens.length > 0) {
            
            this.oDadosApp.mensagens_exibir = oJsonMensagens
            this.oDadosApp.mensagens_exibidas = [];
            this.salvarMensagensNoDispositivo(oJsonMensagens, []);

            Alert.alert('Despertador de Consciência', oJsonMensagens.length + ' mensagens sincronizadas no seu dispositivo.');
        } else {
            Alert.alert('Despertador de Consciência', 'Cadastrado de mensagens não localizado.');
        }
    }

    listar(funcaoTratamentoRetono, callback) {

        try {
            let url = this.oUtil.getURL('/mensagens');
            
            this.chamarServico(url, {method: 'GET'}, funcaoTratamentoRetono, callback);
        } catch (exc) {
            Alert.alert('Despertador de Consciência', exc);
        }
    }
    
    chamarServico(url, parametrosHTTP, funcaoTratamentoRetono, callback) {
        fetch(url, parametrosHTTP)
        .then(this.tratarRespostaHTTP)
        .then((oJsonDadosRetorno) => {
            funcaoTratamentoRetono(oJsonDadosRetorno);
            callback();
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

    //Faz o sorteio da mensagem a partir da lista salva no dispositivo.
    obterProximaMensagem() {
        let msg = '';
        let listaMensagensExibir = this.oDadosApp.mensagens_exibir;

        if (listaMensagensExibir instanceof Array && listaMensagensExibir.length > 0){
            let indiceMensagem = 0;

            if(listaMensagensExibir.length > 1) {
                indiceMensagem = this.oUtil.getRand(listaMensagensExibir.length);
            }

            let oMensagem = listaMensagensExibir[indiceMensagem];

            msg = oMensagem.texto;
            oMensagem.indicadorExibida = true;
            
            listaMensagensExibir.splice(indiceMensagem, 1);

            let listaMensagensExibidas = this.oDadosApp.mensagens_exibidas;
            listaMensagensExibidas.push(oMensagem);            

            this.salvarMensagensNoDispositivo(listaMensagensExibir, listaMensagensExibidas);
            
        } else {
            Alert.alert('Despertador de Consciência', 'Você não tem novas mensagens. :(');
        }
        return msg;
    }

    // create a function that saves your data asyncronously
    async salvarMensagensNoDispositivo (listaMensagensExibir, listaMensagensExibidas) {
        try {                   
            await AsyncStorage.setItem('msgExibir', JSON.stringify(listaMensagensExibir));
            await AsyncStorage.setItem('msgExibidas', JSON.stringify(listaMensagensExibidas));
        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao salvar mensagens no dispositivo: ' + error);
        }
    }

    lerMensagensExibir (callback) {
        try {                
            let dados;   
            AsyncStorage.getItem('msgExibir').then((valor) => {
                if(valor) {
                    dados = JSON.parse(valor);
                    
                    if(dados && dados instanceof Array && dados.length <= 0) {
                        this.listar(this.tratarBuscarMensagens, callback);
                    } else {
                        this.oDadosApp.mensagens_exibir = dados;   
                    }
                    
                    if(callback) {
                        
                        this.lerMensagensExibidas(callback);
                    }
                } else {
                    this.listar(this.tratarBuscarMensagens, callback);
                }
            });
            
        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao ler mensagens a exibir: ' + error);
        }
    }

    lerMensagensExibidas (callback) {
        try {
            let dados;

            AsyncStorage.getItem('msgExibidas').then((valor) => {
                if(valor) {
                    dados = JSON.parse(valor);
                    
                    this.oDadosApp.mensagens_exibidas = dados;

                    if(callback) {
                        
                        callback(dados);
                    }
                }
            });

        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao ler mensagens a exibir: ' + error);
        }
    }
}
