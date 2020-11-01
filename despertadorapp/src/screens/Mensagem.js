import Util from '../common/Util';
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
        this.fazerTransicaoNovasMensagens = this.fazerTransicaoNovasMensagens.bind(this);
        this.obterProximaMensagem = this.obterProximaMensagem.bind(this);
        this.salvarDadosMensagensNoDispositivo = this.salvarDadosMensagensNoDispositivo.bind(this);
        this.obterDadosMensagens = this.obterDadosMensagens.bind(this);
    }

    async tratarBuscarMensagens(oJsonMensagens, callback) {
        if(oJsonMensagens && oJsonMensagens.length > 0) {

            this.fazerTransicaoNovasMensagens(oJsonMensagens);

            await this.salvarDadosMensagensNoDispositivo(() => {
                if(callback){
                    callback();
                }
                this.oUtil.fecharMensagem();
            });
            
        } else {
            this.oDadosTela.dados_mensagens.lista_mensagens_exibir = null;
            this.oUtil.fecharMensagem();
        }
    }

    fazerTransicaoNovasMensagens(oJsonMensagens) {
        this.oDadosApp.dados_mensagens.lista_mensagens_exibir = oJsonMensagens;
        this.oDadosApp.dados_mensagens.qtd_mensagens_exibidas = this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.length;
        this.oDadosApp.dados_mensagens.qtd_total_mensagens = this.oDadosApp.dados_mensagens.qtd_mensagens_exibidas;
        this.oDadosApp.dados_mensagens.lista_mensagens_exibidas = [];
    }

    listar(funcaoTratamentoRetorno, callback) {

        try {
            let url = this.oUtil.getURL('/mensagens');
            this.oDadosControleApp.fazendo_requisicao = true;
            
            if(!this.oDadosControleApp.em_segundo_plano) {
                this.oUtil.fecharMensagem();
                this.oUtil.exibirMensagem('Buscando mensagens do servidor.\nIsso pode demorar um pouco.\n\nPor favor, aguarde...');
            }
            
            this.chamarServico(url, {method: 'GET'}, funcaoTratamentoRetorno, callback);
        } catch (exc) {
            console.log('[despertadorapp] Mensagem.listar() Erro ao buscar mensagens do servidor.', exc);

            Alert.alert('Despertador de Consciência', 'Erro buscar mensagens do servidor: ' + exc);
        }
    }
    
    chamarServico(url, parametrosHTTP, funcaoTratamentoRetorno, callback) {
        fetch(url, parametrosHTTP)
        .then(this.tratarRespostaHTTP)
        .then((oJsonDadosRetorno) => {
            funcaoTratamentoRetorno(oJsonDadosRetorno, callback);
            this.oDadosControleApp.fazendo_requisicao = false;
        })
        .catch(function (erro) {
            console.log('[despertadorapp] Mensagem.chamarServico() Erro ao buscar mensagens do servidor.', erro);
            Alert.alert('Despertador de Consciência', erro);
            
            this.oDadosControleApp.fazendo_requisicao = false;
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
        let texto;

        //O atributo 'mensagem_proxima' deve conter sempre a mensagem para a próxima notificação.
        //Quando o usuario abre o app, o que está na 'mensagem_proxima' é atribuido para 'mensagem_atual' 
        //que vai ser exibida na tela inicial.
        //Após isso, uma nova mensagem é sorteada para a 'mensagem_proxima', para ser exibida na próxima notificação.
        if(this.oDadosApp.dados_mensagens.mensagem_proxima) {

            this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.push(this.oDadosApp.dados_mensagens.mensagem_atual);
            this.oDadosApp.dados_mensagens.mensagem_atual = this.oDadosApp.dados_mensagens.mensagem_proxima;
            this.oDadosApp.dados_mensagens.qtd_mensagens_exibidas = this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.length;
            console.log('[despertadorapp] definirMensagemExibir() atribuiu mensagem_proxima para mensagem_atual = ', this.oDadosApp.dados_mensagens.mensagem_atual);
        }
        
        if (listaMensagensExibir instanceof Array && listaMensagensExibir.length > 0){
            let indiceMensagem = 0;

            if (this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.length > 0) {
                this.oDadosApp.dados_mensagens.qtd_total_mensagens = this.oDadosApp.dados_mensagens.lista_mensagens_exibir.length + this.oDadosApp.dados_mensagens.lista_mensagens_exibidas.length;
            }

            if(listaMensagensExibir.length > 1) {
                indiceMensagem = this.oUtil.getRand(listaMensagensExibir.length);
            }

            let oMensagem = listaMensagensExibir[indiceMensagem];

            listaMensagensExibir.splice(indiceMensagem, 1);
            
            texto = oMensagem.texto;
        }

        this.oDadosApp.dados_mensagens.mensagem_proxima = texto;
    }

    definirMensagemExibir(callback) {
        console.log('[despertadorapp] definirMensagemExibir() ++++++++++++ iniciou ++++++++++++');

        this.obterDadosMensagens(() => {
            
            this.obterProximaMensagem();

            if(this.oDadosApp.dados_mensagens.mensagem_proxima) {
                
                console.log('[despertadorapp] obterDadosMensagens() salvando mensagens do servidor .........');
                this.salvarDadosMensagensNoDispositivo(callback);
            } else {
                console.log('[despertadorapp] obterDadosMensagens() buscando mensagens do servidor pq acabaram as mensagens...');
    
                this.listar(this.tratarBuscarMensagens, () => {
                    this.obterProximaMensagem();
                    this.salvarDadosMensagensNoDispositivo(callback);
                });                
            }
        });
        console.log('[despertadorapp] definirMensagemExibir() ------------ terminou ------------');
    }

    async salvarDadosMensagensNoDispositivo (callback) {
        console.log('[despertadorapp] salvarDadosMensagensNoDispositivo() ++++++++++++ iniciou ++++++++++++');
        console.log('[despertadorapp] salvarDadosMensagensNoDispositivo() salvando as mensagens no dispositivo (dados_mensagens)...', JSON.stringify(this.oDadosApp.dados_mensagens));

        try {                   

            await AsyncStorage.setItem('dados_mensagens', JSON.stringify(this.oDadosApp.dados_mensagens)).then(() => {
                if(callback) {
                    callback();
                }
            });
        } catch (error) {
            console.log('[despertadorapp] salvarDadosMensagensNoDispositivo() Erro ao salvar mensagens no dispositivo: ', error);
            
            Alert.alert('Despertador de Consciência', 'Erro ao salvar mensagens no dispositivo: ' + error);
        }

        console.log('[despertadorapp] salvarDadosMensagensNoDispositivo() ------------ terminou ------------');
    }

    obterDadosMensagens (callback) {
        console.log('[despertadorapp] obterDadosMensagens() ++++++++++++ iniciou ++++++++++++');
        
        try {
            AsyncStorage.getItem('dados_mensagens').then((valor) => {
                
                if(valor) {
                    this.oDadosApp.dados_mensagens = JSON.parse(valor);
                    
                    console.log('[despertadorapp] obterDadosMensagens() this.oDadosApp.dados_mensagens obtidos do dispositivo: ', JSON.stringify(this.oDadosApp.dados_mensagens));
                    
                    if(callback) {
                        callback();
                    }
                } else {
                    if(callback) {
                        callback();
                    }
                }
            });
        } catch (error) {
            console.log('[despertadorapp] obterDadosMensagens() Erro ao ler mensagens do dispositivo: ', error);    
            Alert.alert('Despertador de Consciência', 'Erro ao ler mensagens do dispositivo: ' + error);
        }
        console.log('[despertadorapp] obterDadosMensagens() ------------ terminou ------------');
    }
}
