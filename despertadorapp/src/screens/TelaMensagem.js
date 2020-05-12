import React, { Component } from 'react';
import Mensagem from './Mensagem';
import Util from '../common/Util';
import {
    StyleSheet,
    View,
    Text,
    ImageBackground,
    Alert,
    TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Image } from 'react-native-elements';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';

export default class TelaMensagem extends Component {
    
    constructor(props, value) {
        super(props);

        if(props && props.navigation) {
            this.oNavegacao = props.navigation;
        }
        
        if(value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;
            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTela = this.oDadosApp.tela_mensagem;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp);
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }

        this.oDadosTela.texto_botao = <Text>P</Text>;
        this.oDadosTela.elemento_botao = <Icon></Icon>;
        this.oDadosTela.msg_num = '1'; //deixei o msgNum como 1 para que os botões sejam renderizados logo que o app é aberto    

        this.exibirProximaMensagem = this.exibirProximaMensagem.bind(this);
        this.contaMsg = this.contaMsg.bind(this);
        //funcMaster é uma função teste que criei para fazer as outras funções async serem executadas em ordem (usando await)
        this.funcMaster = this.funcMaster.bind(this);
        this.configurarEventoMensagemFocoTela = this.configurarEventoMensagemFocoTela.bind(this);
        
        this.oConfiguracao.configurarNotificacao(this, this.oNavegacao, this.oDadosControleApp);
        // this.configurarEventoMensagemFocoTela();
        this.oMensagem = new Mensagem();
        this.oMensagem.sincronizarMensagensComServidor();
    }

    componentDidMount() {
        
        this.funcMaster();
    }

    async funcMaster () {
        //não sei porque o await no this.oMensagem.sincronizarMensagensComServidor não está funcionando.
        //as outras ações estão sendo executadas antes desse await acabar
        //await this.oMensagem.sincronizarMensagensComServidor();
      
        //esse await funciona. consigo fazer o contaMsg esperar o exibirProximaMensagem terminar para ser atualizado
        await this.exibirProximaMensagem();       
        this.contaMsg();
    }

    async exibirProximaMensagem() {
        this.oDadosApp.mensagem.texto = await this.oMensagem.obterProximaMensagem();
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    configurarEventoMensagemFocoTela() {
        this.oNavegacao.addListener('focus', () => {
            
            if(this.oDadosControleApp.exibir_mensagem) {
                this.oDadosControleApp.exibir_mensagem = false;

                this.exibirProximaMensagem();
                this.contaMsg(); //adicionei esse método para ser executado quando voltamos para a tela de mensagens
            }
        });
        // this.oNavegacao.addListener('notificationActionReceived', function(action){
            
        //     console.log ('Notification action received: ' + action);
            
        //     //const info = JSON.parse(action.dataJSON);
        //     if (info.action == 'Accept') {
        //       console.log('Aceitou');
        //     } else if (info.action == 'Reject') {
        //         console.log('Ignorou');
        //     }
        //     // Add all the required actions handlers
        //   });
    }

    //função contaMsg é async para poder usar o await e calcluar o length só depois de ter pego o array com as mensagens
    //FALTA CONSEGUIR FAZER A contaMsg SER EXECUTADA QUANDO TROCA DE TELA E QUANDO AS MENSAGENS SAO ATUALIZADAS DO SERVIDOR
    async contaMsg() {
        let msgArray = [];

        msgArray = await this.oMensagem.lerMensagensExibir();
        this.oDadosTela.msg_num = msgArray.length;


        //esse if define o que vai aparecer no texto do botão
        if (this.oDadosTela.msg_num == 0){
            this.oDadosTela.texto_botao = <Text>Buscar mensagens</Text>;
            this.oDadosTela.elemento_botao = <Icon name="caret-right" size={50} color="#022C18" style={{margin: 10}}  onPress={
                () => {this.oMensagem.sincronizarMensagensComServidor()}
             }/>;
        } else {
            this.oDadosTela.texto_botao = <Text>Próxima mensagem</Text>;
            this.oDadosTela.elemento_botao = <Icon name="caret-right" size={50} color="#022C18" style={{margin: 10}}  onPress={
                () => {this.exibirProximaMensagem().then( () => {this.contaMsg()})}                            
             }/>;
        }

        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }
    
    render() {
        
        return (
            
            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back.png')} style={styles.imgBG} resizeMode='stretch'>
                    <View style={{flex: 0.15, flexDirection:'row', alignSelf:'stretch', justifyContent:'flex-end'}} >
                        <TouchableOpacity onPress={() => this.oNavegacao.navigate('Configuracao')}>
                            <Image source={require('../images/botao_cera.png')} resizeMode='stretch' style={{width:85, height:95, marginRight:40, justifyContent:'center'}} >
                                <Icon name="cog" size={25} color="#4d0000" style={{margin: 23}}/>
                            </Image>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 0.70, margin: 50, flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                        <Text style={styles.formataFrase}>
                            {this.oDadosApp.mensagem.texto}
                        </Text>
                    </View>
                    <View style={{flex: 0.15, marginTop: 20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                      
                        {this.oDadosTela.texto_botao}
                        {this.oDadosTela.elemento_botao}
                        
                        {/*
                        esse render de Text e Icon abaixo é somente para monitorar o que esta acontecendo no msgNum
                        o botão azul serve para atualizar o msgNum para que o render do botão de mensagens funcione corretamente
                        */}
                        <Text> Msgnum é: {this.oDadosTela.msg_num}</Text>
                        <Icon name="caret-right" size={50} color="blue" onPress={this.contaMsg} style={{margin: 10}}/>
                    </View>                    
                </ImageBackground>
            </View>
        );
    }
}

TelaMensagem.contextType = ContextoApp;

const styles = StyleSheet.create({
    
    areaTotal: {
        flex: 1,
        flexDirection:'column',
        alignItems:'stretch',
        justifyContent:'center',
        backgroundColor: '#F9F8E7'
    },

    imgBG: {
        flex: 1,
        alignItems:'center',
        justifyContent:'space-between'
    },

    formataFrase: {
        fontSize: 50,
        textAlign: 'center',
        fontFamily: 'ErisblueScript'
    }
});