'use strict';
/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    ActivityIndicator
} from 'react-native';
import Util from '../common/Util';
import { ContextoApp } from '../contexts/ContextoApp';

export default class MensagemModal extends Component {

    constructor(props, contexto) {
        super();

        if(props && props.navigation) {
          this.oNavegacao = props.navigation;
        }

        if(contexto && contexto.gerenciador) {
          // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
          this.oGerenciadorContextoApp = contexto.gerenciador;
          this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
          this.oGerenciadorContextoApp.componenteMensagemModal = this;
          this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
          this.oDadosTela = this.oDadosApp.tela_mensagem;
          this.oDadosTelaConfiguracao = this.oDadosApp.tela_configuracao;
          this.oUtil = new Util();
          this.state = this.oGerenciadorContextoApp.dadosAppGeral;
      }

        this.montarBotoes = this.montarBotoes.bind(this);
        this.realizarAcaoBotao = this.realizarAcaoBotao.bind(this);
        this.fechar = this.fechar.bind(this);
    }

    componentDidMount() {
      console.log('[despertadorapp] MensagemModal.componentDidMount() ++++++++++++ iniciou ++++++++++++');

      console.log('[despertadorapp] MensagemModal.componentDidMount() ------------ terminou ------------');
  }

    montarBotoes() {
        let oElementosBotoes = [];
        let oListaBotoes = [];
        let oConfigBotao;
        let exibir;

        if(this.oDadosControleApp) {
          oListaBotoes = this.oDadosControleApp.config_modal.botoes;
          exibir = this.oDadosControleApp.config_modal.exibir_modal;
        }

        if(exibir && oListaBotoes && oListaBotoes.length > 0) {
        
            for(let i = 0; i < oListaBotoes.length; i++) {
        
                oConfigBotao = oListaBotoes[i];
                console.log('Botao em lista ... ', JSON.stringify(oConfigBotao));

                oElementosBotoes.push(
                    <TouchableHighlight key={i}
                      style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                      onPress={() => {
                        this.realizarAcaoBotao(oListaBotoes[i]);
                      }}
                    >
                        <Text style={styles.textStyle}>{oConfigBotao.texto}</Text>
                    </TouchableHighlight>
                );
            }
        }
        return (oElementosBotoes)
    }

    fechar() {
        this.oDadosControleApp.config_modal.exibir_modal = false;
        this.oDadosControleApp.config_modal.botoes = [];
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    realizarAcaoBotao(oConfigBotao) {
      
        console.log('Configuracao botao   .... ', JSON.stringify(oConfigBotao));
        if(oConfigBotao.funcao) {
          oConfigBotao.funcao();
        }
        this.fechar();      
    }

    render() {
        let exibir = false;
        let mensagem = '';

        if(this.oDadosControleApp) {
          exibir = this.oDadosControleApp.config_modal.exibir_modal;
          mensagem = this.oDadosControleApp.config_modal.mensagem;
          console.log('Configuracao Mensagem Modal ... ', this.oDadosControleApp.config_modal);
        }
        return (
          <Modal
            animationType="none"
            transparent={true}
            visible={exibir}
            onRequestClose={() => {

            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <ActivityIndicator color='#2196F3' size='large'/>
                <Text style={styles.modalText}>{mensagem}</Text>            
                <View style={{flexDirection:'row'}}> 
                {this.montarBotoes()}
                </View>
              </View>
            </View>
          </Modal>
        )
    }
}
MensagemModal.contextType = ContextoApp;

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    modalView: {
      flexDirection:'column',
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    openButton: {
      backgroundColor: "#F194FF",
      borderRadius: 20,
      padding: 10,
      elevation: 2
    },
    textStyle: {
      color: "black",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center"
    }
  });