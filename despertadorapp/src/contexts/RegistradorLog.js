import { DADOS_LOG_GERAL } from './DadosAppLog';
import {
    Alert
} from 'react-native';
import Util from '../common/Util';

export default class RegistradorLog {
    
    constructor() {
        this.oDadosLog = DADOS_LOG_GERAL;
        this.oRegistrosLogs = this.oDadosLog.registros_log;
        this.oUtil = new Util();

        this.registrar = this.registrar.bind(this);
        this.transportar = this.transportar.bind(this);
        this.limpar = this.limpar.bind(this);
        this._obterJsonResposta = this._obterJsonResposta.bind(this);
        this.enviando = false;
    }

    get registrosLog() {
        return this.oRegistrosLogs;
    }

    registrar(registroLog) {
        let oDH = new Date();
        let oMensagemLog = {
            'data_hora': oDH.toLocaleString(),
            'mensagem_log' : registroLog,
        }
        this.oRegistrosLogs.push(oMensagemLog);
    }

    transportar() {
        try {
            if(!this.enviando && this.oRegistrosLogs.length > 0) {
                this.enviando = true;

                let url = this.oUtil.getURL('/gerenciadorlogs/registrar_do_cliente/');

                let oMensagensLog = {
                    'registros_log' : this.oRegistrosLogs,
                }

                let dadosParametros = JSON.stringify(oMensagensLog);
                
                fetch(url, {
                        method: 'POST',
                        headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        },
                        body: dadosParametros,
                    })
                    .then(this._obterJsonResposta);
            }
        } catch (exc) {
            Alert.alert('Despertador de Consciência', exc);
        }
    };

    limpar() {
        this.oRegistrosLogs.length = 0;
    }

    _obterJsonResposta(oRespostaHTTP) {
        this.enviando = false;
        this.limpar();

        if(oRespostaHTTP) {

            if(!oRespostaHTTP.ok) {

                if(oRespostaHTTP.status && oRespostaHTTP.url) {
                    
                    Alert.alert('Despertador de Consciência', "Erro HTTP status: " + oRespostaHTTP.status + 
                    ". URL: " + oRespostaHTTP.url);
                } else if (oRespostaHTTP instanceof Error) {
                    
                    Alert.alert('Despertador de Consciência', oRespostaHTTP.message);
                }
            }
        }
        return null;
    };
}