import Util from '../common/Util';
import {
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class Mensagem {

    constructor() {
        
        this.sincronizarMensagensComServidor = this.sincronizarMensagensComServidor.bind(this);
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

    // Busca na base de dados as mensagens cadastradas e salva no dispositivo.
    async sincronizarMensagensComServidor() {
        let listaMensagensExibir = await this.lerMensagensExibir();
        
        if(!listaMensagensExibir || (listaMensagensExibir instanceof Array && listaMensagensExibir.length <= 0)) { 
            this.listar(this.tratarBuscarMensagens);//como isso está funcionando? this.oMensagem não está definido..
            //nao deveria ser this.listar(this.tratarBuscarMensagens) ? Porque estava declarado errado antes, onde era usado. Foi declardo de forma global.
        }
    }

    tratarBuscarMensagens(oJsonMensagens) {
        if(oJsonMensagens && oJsonMensagens.length > 0) {
            
            this.salvarMensagensNoDispositivo(oJsonMensagens, []);

            Alert.alert('Despertador de Consciência', oJsonMensagens.length + ' mensagens sincronizadas no seu dispositivo.');
        } else {
            Alert.alert('Despertador de Consciência', 'Cadastrado de mensagens não localizado.');
        }
    }

    listar(funcaoTratamentoRetono) {

        try {
            let url = this.oUtil.getURL('/mensagens');
            
            this.chamarServico(url, {method: 'GET'}, funcaoTratamentoRetono);
        } catch (exc) {
            Alert.alert('Despertador de Consciência', exc);
        }
    }
    
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

    //Faz o sorteio da mensagem a partir da lista salva no dispositivo.
    async obterProximaMensagem() {
        let msg = '';
        let listaMensagensExibir = await this.lerMensagensExibir();

        if (listaMensagensExibir instanceof Array && listaMensagensExibir.length > 0){
            let indiceMensagem = 0;

            if(listaMensagensExibir.length > 1) {
                indiceMensagem = this.oUtil.getRand(listaMensagensExibir.length);
            }
            let oMensagem = listaMensagensExibir[indiceMensagem];
            msg = oMensagem.texto;
            oMensagem.indicadorExibida = true;
            
            listaMensagensExibir.splice(indiceMensagem, 1);

            let listaMensagensExibidas = await this.lerMensagensExibidas();
            listaMensagensExibidas.push(oMensagem);            

            this.salvarMensagensNoDispositivo(listaMensagensExibir, listaMensagensExibidas);
            
        } else {
            Alert.alert('Despertador de Consciência', 'Você não tem novas mensagens. :(');
        }
        return await msg;
    }

    // create a function that saves your data asyncronously
    async salvarMensagensNoDispositivo (listaMensagensExibir, listaMensagensExibidas) {
        try {                   
            let promiseItensExibir = AsyncStorage.setItem('msgExibir', JSON.stringify(listaMensagensExibir));
            let promiseItensExibidos = AsyncStorage.setItem('msgExibidas', JSON.stringify(listaMensagensExibidas));

            await promiseItensExibir;
            await promiseItensExibidos;
        } catch (error) {
            // console.log(error);
            Alert.alert('Despertador de Consciência', 'Erro ao salvar mensagens no dispositivo: ' + error);
        }
    }

    async lerMensagensExibir () {
        try {                   
            let promiseItensExibir = await AsyncStorage.getItem('msgExibir');
            
            if(promiseItensExibir) {
                return JSON.parse(promiseItensExibir);
            }
            return null;
        } catch (error) {
            // console.log(error);
            Alert.alert('Despertador de Consciência', 'Erro ao ler mensagens a exibir: ' + error);
        }
    }

    async lerMensagensExibidas () {
        try {
            let promiseItensExibidas = await AsyncStorage.getItem('msgExibidas');

            return JSON.parse(promiseItensExibidas);
        } catch (error) {
            // console.log(error);
            Alert.alert('Despertador de Consciência', 'Erro ao ler mensagens a exibir: ' + error);
        }
    }
}
