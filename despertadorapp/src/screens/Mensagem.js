import Util, { clonarObjeto } from '../common/Util';
import {
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class Mensagem {

    constructor(gerenciadorContexto) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTelaConfiguracao = this.oDadosApp.tela_configuracao;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
        }

        this.tratarBuscarMensagens = this.tratarBuscarMensagens.bind(this);
        this.listar = this.listar.bind(this);
        this.chamarServico = this.chamarServico.bind(this);
        this.tratarRespostaHTTP = this.tratarRespostaHTTP.bind(this);
        this.obterProximaMensagem = this.obterProximaMensagem.bind(this);
        this.salvarDadosMensagensNoDispositivo = this.salvarDadosMensagensNoDispositivo.bind(this);
        this.obterDadosMensagens = this.obterDadosMensagens.bind(this);
    }

    async tratarBuscarMensagens(oJsonMensagens) {
        if(oJsonMensagens && oJsonMensagens.length > 0) {

            this.oDadosApp.dados_mensagens.lista_mensagens_exibir = oJsonMensagens
            this.oDadosApp.dados_mensagens.lista_mensagens_exibidas = [];
            await this.salvarDadosMensagensNoDispositivo();

        } else {
            this.oDadosTela.dados_mensagens.lista_mensagens_exibir = null;
        }
        this.oUtil.fecharMensagem();
    }

    listar(funcaoTratamentoRetono, callback) {

        try {
            let url = this.oUtil.getURL('/mensagens');

            this.oUtil.fecharMensagem();
            this.oUtil.exibirMensagem('Buscando mensagens do servidor.\nAguarde...');

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
        let listaMensagensExibir = this.oDadosApp.dados_mensagens.lista_mensagens_exibir;

        if (listaMensagensExibir instanceof Array && listaMensagensExibir.length > 0){
            let indiceMensagem = 0;

            if(listaMensagensExibir.length > 1) {
                indiceMensagem = this.oUtil.getRand(listaMensagensExibir.length);
            }

            let oMensagem = listaMensagensExibir[indiceMensagem];

            listaMensagensExibir.splice(indiceMensagem, 1);
            
            return oMensagem.texto;
        } else {
            Alert.alert('Despertador de Consciência', 'Você não tem novas mensagens. :(');
        }
    }

    definirMensagemExibir(callback) {
        console.log('[despertadorapp] definirMensagemExibir() ++++++++++++ iniciou ++++++++++++');

        this.obterDadosMensagens(() => {
            //O atributo 'mensagem_proxima' deve conter sempre a mensagem para a próxima notificação.
            //Quando o usuario abre o app, o que está na 'mensagem_proxima' é atribuido para 'mensagem_atual' 
            //que vai ser exibida na tela inicial.
            //Após isso, uma nova mensagem é sorteada para a 'mensagem_proxima', para ser exibida na próxima notificação.
            if(this.oDadosApp.dados_mensagens.mensagem_proxima) {

                this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.push(this.oDadosApp.dados_mensagens.mensagem_atual);
                this.oDadosApp.dados_mensagens.mensagem_atual = this.oDadosApp.dados_mensagens.mensagem_proxima;

                console.log('[despertadorapp] definirMensagemExibir() atribuiu mensagem_proxima para mensagem_atual = ', this.oDadosApp.dados_mensagens.mensagem_atual);
            }
        
            this.oDadosApp.dados_mensagens.mensagem_proxima = this.obterProximaMensagem();
            this.salvarDadosMensagensNoDispositivo(callback);
        });
        console.log('[despertadorapp] definirMensagemExibir() ------------ terminou ------------');
   }

//    voltarMensagemExibir() {
//         //O atributo 'mensagem_proxima' deve conter sempre a mensagem para a próxima notificação.
//         //Quando o usuario abre o app, o que está na 'mensagem_proxima' é atribuido para 'mensagem_atual' 
//         //que vai ser exibida na tela inicial.
//         //Após isso, uma nova mensagem é sorteada para a 'mensagem_proxima', para ser exibida na próxima notificação.
//         if(this.oDadosApp.dados_mensagens.mensagem_proxima) {

//             this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.push(this.oDadosApp.dados_mensagens.mensagem_atual);
//             this.oDadosApp.dados_mensagens.mensagem_atual = this.oDadosApp.dados_mensagens.mensagem_proxima;

//             console.log('[despertadorapp] definirMensagemExibir() atribuiu mensagem_proxima para mensagem_atual = ', this.oDadosApp.dados_mensagens.mensagem_atual);
//         }
    
//         this.oDadosApp.dados_mensagens.mensagem_proxima = this.obterProximaMensagem();
//         this.salvarDadosMensagensNoDispositivo(callback);
//    }

    async salvarDadosMensagensNoDispositivo (callback) {
        console.log('[despertadorapp] salvarDadosMensagensNoDispositivo() ++++++++++++ iniciou ++++++++++++');
        console.log('[despertadorapp] salvarDadosMensagensNoDispositivo() salvando as mensagens no dispositivo (dados_mensagens)...');

        try {                   

            await AsyncStorage.setItem('dados_mensagens', JSON.stringify(this.oDadosApp.dados_mensagens)).then(() => {
                if(callback) {
                    callback();
                }
            });
        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao salvar mensagens no dispositivo: ' + error);
        }

        console.log('[despertadorapp] salvarDadosMensagensNoDispositivo() ------------ terminou ------------');
    }

    obterDadosMensagens (callback) {
        console.log('[despertadorapp] obterDadosMensagens() ++++++++++++ iniciou ++++++++++++');

        try {
            if(!this.oDadosApp.dados_mensagens ||  
               (this.oDadosApp.dados_mensagens.lista_mensagens_exibir.length <= 0 &&
               this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.length <= 0)) {

                AsyncStorage.getItem('dados_mensagens').then((valor) => {
                    
                    if(valor) {
                        this.oDadosApp.dados_mensagens = JSON.parse(valor);
                        let listaMensagensExibir = this.oDadosApp.dados_mensagens.lista_mensagens_exibir;

                        if(listaMensagensExibir && listaMensagensExibir.length > 0) {
                            console.log('[despertadorapp] obterDadosMensagens() lista_mensagens_exibir.length = ', listaMensagensExibir.length);
                            
                            if(callback) {
                                callback();
                            }
                        } else {
                            console.log('[despertadorapp] obterDadosMensagens() buscando mensagens do servidor pq acabaram as mensagens...');

                            this.listar(this.tratarBuscarMensagens, callback);
                        }                    
                    } else {
                        console.log('[despertadorapp] obterDadosMensagens() buscando mensagens do servidor a primeira vez...');

                        this.listar(this.tratarBuscarMensagens, callback);
                    }
                });
            } else {
                if(callback) {
                    callback();
                }
            }
        } catch (error) {
            
            Alert.alert('Despertador de Consciência', 'Erro ao ler mensagens a exibir: ' + error);
        }
        console.log('[despertadorapp] obterDadosMensagens() ------------ terminou ------------');
    }
}
