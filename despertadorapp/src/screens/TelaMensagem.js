import React, { Component } from 'react';
import Mensagem from './Mensagem';
import Util from '../common/Util';
import {
    StyleSheet,
    View,
    Text,
    ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class TelaMensagem extends Component {

    constructor(props) {
        super(props);

        this.state = {textoMensagem: '', textoBotao: <Text></Text>, botao: <Icon></Icon>, msgNum: ''};     

        this.exibirProximaMensagem = this.exibirProximaMensagem.bind(this);
        this.obterProximaMensagem = this.obterProximaMensagem.bind(this);
        this.contaMsg = this.contaMsg.bind(this);
        

        objMensagem = new Mensagem();
        objUtil = new Util();

        objMensagem.sincronizarMensagensComServidor();

        //funcMaster é uma função teste que criei para fazer as outras funções async serem executadas em ordem (usando await)
        this.funcMaster = this.funcMaster.bind(this);
        this.funcMaster();
    }

    async funcMaster () {
        //não sei porque o await no objMensagem.sincronizarMensagensComServidor não está funcionando.
        //as outras ações estão sendo executadas antes desse await acabar
        //await objMensagem.sincronizarMensagensComServidor();
      
        //esse await funciona. consigo fazer o contaMsg esperar o exibirProximaMensagem terminar para ser atualizado
        await this.exibirProximaMensagem();       
        this.contaMsg();
    }


    async obterProximaMensagem() {
        return await objMensagem.obterProximaMensagem();
    }

    async exibirProximaMensagem() {
        let estado = this.state;
         
        estado.textoMensagem = await objMensagem.obterProximaMensagem();
        
        this.setState(estado);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let { navigation } = this.props;
    
        //acho que isso deveria mostrar uma mensagem quando voltamos da tela de config para a telaMensagem mas parece nao estar funcionando
        if(navigation && navigation.getParam('exibirMensagem') === 'S') {    
            navigation.setParams({ 'exibirMensagem': 'N' });
            this.exibirProximaMensagem();
            this.contaMsg(); //adicionei esse método para ser executado quando voltamos para a tela de mensagens
        }
    }

    //função contaMsg é async para poder usar o await e calcluar o length só depois de ter pego o array com as mensagens
    //FALTA CONSEGUIR FAZER A contaMsg SER EXECUTADA QUANDO TROCA DE TELA E QUANDO AS MENSAGENS SAO ATUALIZADAS DO SERVIDOR
    async contaMsg() {
        let estado = this.state;
        let msgArray = [];
        
        msgArray = await objMensagem.lerMensagensExibir();
        estado.msgNum = msgArray.length


        //esse if define o que vai aparecer no texto do botão
        if (estado.msgNum == 0){
            estado.textoBotao = <Text>Buscar mensagens</Text>;
            estado.botao = <Icon name="caret-right" size={50} color="#022C18" style={{margin: 10}}  onPress={
                () => {objMensagem.sincronizarMensagensComServidor()}                            
             }/>;
        } else {
            estado.textoBotao = <Text>Próxima mensagem</Text>;
            estado.botao = <Icon name="caret-right" size={50} color="#022C18" style={{margin: 10}}  onPress={
                () => {this.exibirProximaMensagem().then( () => {this.contaMsg()})}                            
             }/>;
        }

        this.setState(estado);
    }

        
    
    render() {
        
        return (
            
            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back.png')} style={styles.imgBG}>
                    <View style={{flex: 1, flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                        <Text style={styles.formataFrase}>
                            {this.state.textoMensagem}
                        </Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', height: 50, marginBottom: 15}}>
                      
                        {this.state.textoBotao}
                        {this.state.botao}
                        
                        {/*
                        esse render de Text e Icon abaixo é somente para monitorar o que esta acontecendo no msgNum
                        o botão azul serve para atualizar o msgNum para que o render do botão de mensagens funcione corretamente
                        */}
                        <Text> Msgnum é: {this.state.msgNum}</Text>
                        <Icon name="caret-right" size={50} color="blue" onPress={this.contaMsg} style={{margin: 10}}/>
                    </View>                    
                </ImageBackground>
            </View>
        );
    }
}


TelaMensagem.navigationOptions = ({navigation}) => {
    return {
        headerTitle: 'Mensagem',        
        headerRight: () => <Icon name="bars" size={30} color="#022C18" onPress={() => navigation.navigate('TelaConfiguracao')} />,
    }
};

const styles = StyleSheet.create({
    
    areaTotal: {
        flex: 1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
    },

    imgBG: {
        flex: 1,
        height: '100%',
        width: '100%',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'flex-end'
    },

    formataFrase: {
        fontSize: 50,
        width: '80%',
        marginTop: 60,
        textAlign: 'center',
        fontFamily: 'ErisblueScript'
    }
});