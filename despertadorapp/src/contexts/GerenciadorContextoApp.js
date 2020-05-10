import { DADOS_APP_GERAL } from './DadosAppGeral';
import RegistradorLog from './RegistradorLog';
import { AppState } from 'react-native';

export default class GerenciadorContextoApp {
    
    constructor() {
        this.oDadosReferencia = DADOS_APP_GERAL;

        this.oRegistradorLog = new RegistradorLog();
        this.oDadosReferencia.registros_log = this.oRegistradorLog.registrosLog;
        this._transportarLogServidor = this._transportarLogServidor.bind(this);
        this.atualizarEstadoTela = this.atualizarEstadoTela.bind(this);
        this.atribuirDados = this.atribuirDados.bind(this);
        this.temDados = this.temDados.bind(this);
        this._atribuirDadosObjeto = this._atribuirDadosObjeto.bind(this);
        this._atribuir = this._atribuir.bind(this);
        this._clonarObjeto = this._clonarObjeto.bind(this);
        this._transportarLogServidor = this._transportarLogServidor.bind(this);
        

        AppState.addEventListener('change', this._transportarLogServidor);
    };

    get dadosApp() {
        if(this.oDadosReferencia) {
            return this.oDadosReferencia.dados_app;
        }
        return null;
    };

    get dadosControleApp() {
        return this.oDadosReferencia.dados_app.controle_app;
    };

    get dadosAppGeral() {
        return this.oDadosReferencia;
    };

    get registradorLog() {
        return this.oRegistradorLog;
    }

    get appAtivo() {

        if (AppState.currentState.match(/inactive|background/)) {
            return false;
        }

        return true;
    };

    /*** FUNCOES DE ATRIBUICOES ****/
    atualizarEstadoTela(objetoTela) {
        if(this.oDadosReferencia) {
            objetoTela.setState(this.oDadosReferencia);
        }
    };

    atribuirDados(nomeAtributo, oDadosAtribuir) {
        let oDados = this.oDadosReferencia.dados_app;
        let oArrayDados;
        let oItemArray;
        let oDadosItemModelo;
        let oDadosItem;
        let oArrayAtribuir;                        
        let campoItem;
        let campo;
        let pilhaObjetosContinuar = [];
        let oObjetoPreencher = oDados;
        let oCampoPreencher;
        let camposPreencher;
        let tentarPreencher = false;
        
        this.oRegistradorLog.limpar();
        this.oRegistradorLog.registrar(`GerenciadorContextoApp.atribuirDados => Vai atribuir ${nomeAtributo}: ${JSON.stringify(oDadosAtribuir)}`);
        
        if(oDadosAtribuir) {
            if(oDadosAtribuir instanceof Array) {
                if(oDadosAtribuir.length > 0) {
                    tentarPreencher = true;
                }
            } else if(oDadosAtribuir instanceof Object) {
                let camposDados = Object.keys(oDadosAtribuir);

                if(camposDados && camposDados.length > 0) {
                    tentarPreencher = true;
                }
            }
        }
        
        if(!tentarPreencher){
            return this.oDadosReferencia;
        }

        if(nomeAtributo) {
            oObjetoPreencher = oDados[nomeAtributo];

            if(oObjetoPreencher instanceof Array) {
                let arrayEmpacotado = {};
                arrayEmpacotado[nomeAtributo] = oObjetoPreencher;
                oObjetoPreencher = arrayEmpacotado;

                arrayEmpacotado = {};
                arrayEmpacotado[nomeAtributo] = oDadosAtribuir;
                oDadosAtribuir = arrayEmpacotado;
            }
        }
        camposPreencher = Object.keys(oObjetoPreencher);

        for (let i = 0; i < camposPreencher.length; i ++) {
            campo = camposPreencher[i];
            
            if(!(campo in oDadosAtribuir)) {
                continue;
            }
            
            oCampoPreencher = oObjetoPreencher[campo];

            if(oCampoPreencher instanceof Array) {
                if(oCampoPreencher.length > 0) {
                    oArrayDados = oObjetoPreencher[campo];
                    oItemArray = oArrayDados[0];
                    oDadosItemModelo = {};
                    oArrayAtribuir = oDadosAtribuir[campo];                        
                    campoItem = Object.keys(oItemArray)[0];                    
                    oDadosItemModelo = this._clonarObjeto(oItemArray);
                    oArrayDados.length = 0;

                    for(let i = 0; i < oArrayAtribuir.length; i++) {
                        oDadosItem = {};
                        for(campoNovo in oDadosItemModelo) {
                            oDadosItem[campoNovo] = '';
                        }
                        
                        this._atribuirDadosObjeto(oDadosItem, oArrayAtribuir[i]);
                        oArrayDados.push(oDadosItem);
                    }
                }
            } else if(oCampoPreencher instanceof Object) {  
                // Empilha os dados do objeto atual                  
                pilhaObjetosContinuar.unshift({
                        'objBase': oObjetoPreencher,
                        'objAtribuir': oDadosAtribuir,
                        'camposPreencher': camposPreencher,
                        'indice' : i
                });
                oObjetoPreencher = oCampoPreencher;
                camposPreencher = Object.keys(oObjetoPreencher);
                nomeAtributo = campo;
                i = 0;
                oDadosAtribuir = oDadosAtribuir[campo];
            } else {   
                oObjetoPreencher[campo] = oDadosAtribuir[campo];
            }
            
            if((i + 1) === camposPreencher.length &&
                pilhaObjetosContinuar.length > 0) {

                let objContinuar = pilhaObjetosContinuar.shift();
                oObjetoPreencher = objContinuar.objBase;
                camposPreencher = objContinuar.camposPreencher;
                oDadosAtribuir = objContinuar.objAtribuir;
                i = objContinuar.indice;
            }
        }

        return this.oDadosReferencia;
    };

    temDados() {
        if(this.oDadosReferencia && this.oDadosReferencia.dados_app) {
            let oDadosApp = this.oDadosReferencia.dados_app;
            let campos = Object.keys(oDadosApp);
            let campo;
            let oCampo;
            let oPilhaPendencias = [];

            for(let i = 0; i < campos.length; i++) {
                campo = campos[i];
                oCampo = oDadosApp[campo];
            
                if(oCampo) {
                    if(oCampo instanceof Object) {
                        let oDadosAux = oCampo;

                        oPilhaPendencias.unshift({
                            'objPendente' : oDadosApp,
                            'camposPendentes' : campos,
                            'indice': i
                        });
                        if (oCampo instanceof Array && oCampo.length > 0) {
                            oDadosAux = oCampo[0];
                        }
                        oDadosApp = oDadosAux;
                        campos = Object.keys(oDadosAux);
                        i = 0;
                    } else if (typeof(oCampo) === 'string' && oCampo.trim()) {
                        return true;
                    } else if (typeof(oCampo) === 'number' && oCampo > 0) {
                        return true;
                    }
                }

                if((i + 1) === campos.length && oPilhaPendencias.length > 0) {

                    let objContinuar = oPilhaPendencias.shift();
                    oDadosApp = objContinuar.objPendente;
                    campos = objContinuar.camposPendentes;
                    i = objContinuar.indice;
                }
            }
        }
        return false;
    };

    _atribuirDadosObjeto(oObjetoReceber, oDadosAtribuir) {        
        for(campo in oObjetoReceber) {
            oObjetoReceber[campo] = this._atribuir(campo, oDadosAtribuir);
        }
    };

    _atribuir(nomeAtributo, oDadosAtribuir) {
        for(campo in oDadosAtribuir) {
            if(nomeAtributo === campo) {
                return oDadosAtribuir[nomeAtributo];
            }
        }
    };

    /*** FUNCOES AUXILIARES ****/
    _clonarObjeto(objeto) {
        let novoObjeto = {};

        // Copia o modelo do objeto.
        for(campoNovo in objeto) {
            novoObjeto[campoNovo] = '';
        }
        return novoObjeto;
    };

    _transportarLogServidor() {
        if(!this.appAtivo) {
            this.oRegistradorLog.transportar();
        }
    }
}