/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import Util from '../common/Util';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    Alert,
    View,
    Image,
    Text,
    Console,
    StatusBar,
    TextInput,
    Button
} from 'react-native';

export default class Mensagem {

    constructor() {
        this.listar = this.listar.bind(this);
        this.salvarMensagensNoDispositivo = this.salvarMensagensNoDispositivo.bind(this);
        objUtil = new Util();
    }

    // sortearMensagem(funcaoTratamentoRetono) {
    //     this.listar(funcaoTratamentoRetono);
    // }

    sincronizarMensagensComServidor() {
        let oJsonLista = this.listar();

        this.salvarMensagensNoDispositivo(oJsonLista);
    }

    listar(funcaoTratamentoRetono) {

        try {
            let url = objUtil.getURL('/mensagens');
            
            this.chamarServico(url, {method: 'GET'}, funcaoTratamentoRetono);
        } catch (exc) {
            Alert.alert(exc);
        }
    }

    salvarMensagensNoDispositivo(oJsonLista) {
        
    }
    
    chamarServico(url, parametrosHTTP, funcaoTratamentoRetono) {
        fetch(url, parametrosHTTP)
        .then(this.tratarRespostaHTTP)
        .then((oJsonDadosRetorno) => {
            funcaoTratamentoRetono(oJsonDadosRetorno);
        })
        .catch(function (erro) {
            Alert.alert(erro.message);
            throw erro;
        });
    }
    
    tratarRespostaHTTP(oRespostaHTTP) {
        if (oRespostaHTTP.ok) {
            return oRespostaHTTP.json();
        } else {
            Alert.alert("Erro: " + oRespostaHTTP.status);
        }
    }
}
