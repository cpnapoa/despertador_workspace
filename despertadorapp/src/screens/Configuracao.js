/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */
import Util from '../common/Util';
import {
    Alert
} from 'react-native';

export default class Configuracao {

    constructor() {
        objUtil = new Util();
    }
    
    // Implementar a seguir as funcoes para configurar o aplicativo.

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
