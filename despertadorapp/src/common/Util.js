import { DADOS_BOTAO } from "../contexts/DadosAppGeral";

export default class Util {
    constructor(gerenciadorContexto) {
        
        if(gerenciadorContexto) {
            this.oGerenciadorContextoApp = gerenciadorContexto;
            
            this.oRegistradorLog = this.oGerenciadorContextoApp.registradorLog;                        
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosChaves = this.oDadosApp.chaves;
        }

        this.getURL = this.getURL.bind(this);
        this.getRand = this.getRand.bind(this);
        this.getRandomInt = this.getRandomInt.bind(this);
        this.obterDataHoraAleatoria = this.obterDataHoraAleatoria.bind(this);
        this.definirBotaoMensagem = this.definirBotaoMensagem.bind(this);
        this.exibirMensagem = this.exibirMensagem.bind(this);
        this.fecharMensagem = this.fecharMensagem.bind(this);
    }

    getURL(metodo){
        protocol = 'https://';
        domain = 'despertadorserverapp.herokuapp.com';

        if (__DEV__) {
            protocol = 'https://';
            domain = 'despertadorserverapptestes.herokuapp.com';
            // protocol = 'http://';
            // domain = '192.168.0.105:8000';
        }
        return protocol + domain + metodo;
    }


    getRand(numMax){
        numRand = Math.floor((Math.random() * numMax));
        return numRand;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        
        return Math.floor(Math.random() * (max - min)) + min;
    }

    obterDataHoraAleatoria(horaIni, horaFim) {
        let d1 = new Date();
        let d2 = new Date();

        d1.setTime(horaIni.getTime());
        d2.setTime(horaFim.getTime());
                
        let d3 = new Date(this.getRandomInt(d1.getTime(), d2.getTime()))

        return d3;
    }

    // definirBotaoMensagem (textoBotao, oFuncaoAcao) {
        
    //     let oBotoesModal = this.oDadosControleApp.config_modal.botoes;
    //     let oBotao = clonarObjeto(DADOS_BOTAO);
        
    //     oBotao.texto = textoBotao;
    //     oBotao.funcao = oFuncaoAcao;

    //     oBotoesModal.push(oBotao);
    // }

    // exibirMensagem(textoMensagem, indAlerta, oFuncaoAlerta, indFixarHorizontal) {
        
    //     if(textoMensagem && textoMensagem.trim()) {
    //         if(indAlerta) {

    //             let oBotao = clonarObjeto(DADOS_BOTAO);
            
    //             oBotao.texto = 'OK';
    //             oBotao.funcao = oFuncaoAlerta;

    //             this.oDadosControleApp.config_modal.botoes.push(oBotao);
    //         }

    //         this.oDadosControleApp.config_modal.mensagem = textoMensagem;
    //         this.oDadosControleApp.config_modal.exibir_modal = true;
    //     } else {
    //         this.oDadosControleApp.config_modal = clonarObjeto(DADOS_MENSAGEM_MODAL);    
    //     }

    //     this.oGerenciadorContextoApp.atualizarMensagemModal();
    // }

    // fecharMensagem() {
    //     this.oDadosControleApp.config_modal.mensagem = '';
    //     this.oDadosControleApp.config_modal.exibir_modal = false;

    //     this.oGerenciadorContextoApp.atualizarMensagemModal();
    // }

    definirBotaoMensagem (textoBotao, oFuncaoAcao) {
        
        let oBotoesModal = this.oDadosControleApp.config_modal.botoes;
        let oBotao = clonarObjeto(DADOS_BOTAO);
        
        oBotao.texto = textoBotao;
        oBotao.funcao = oFuncaoAcao;

        oBotoesModal.push(oBotao);
    }

    exibirMensagem(textoMensagem, indAlerta) {
        
        if(indAlerta) {
            this.oDadosControleApp.config_modal.botoes = [];

            let oBotao = clonarObjeto(DADOS_BOTAO);
        
            oBotao.texto = 'OK';

            this.oDadosControleApp.config_modal.botoes.push(oBotao);
        }

        this.oDadosControleApp.config_modal.mensagem = textoMensagem;
        this.oDadosControleApp.config_modal.exibir_modal = true;

        this.oGerenciadorContextoApp.atualizarMensagemModal();
    }

    fecharMensagem() {
        this.oDadosControleApp.config_modal.mensagem = '';
        this.oDadosControleApp.config_modal.exibir_modal = false;

        this.oGerenciadorContextoApp.atualizarMensagemModal();
    }
}

export function clonarObjeto(obj) {
    let objString = JSON.stringify(obj);
    
    return JSON.parse(objString);
}