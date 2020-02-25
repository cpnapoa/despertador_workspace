/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import Mensagem from './Mensagem';
import Util from '../common/Util';
import {
    StyleSheet,
    Alert,
    View,
    Text,
    Button,
    ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class TelaMensagem extends Component {

    constructor(props) {
        super(props);
        
        this.state = {textoMensagem: ''};
        this.buscarMensagens = this.buscarMensagens.bind(this);
        this.tratarBuscarMensagens = this.tratarBuscarMensagens.bind(this);
        this.exibirProximaMensagem = this.exibirProximaMensagem.bind(this);
        this.persistirMensagens = this.persistirMensagens.bind(this);
        this.lerMensagensExibir = this.lerMensagensExibir.bind(this);
        this.lerMensagensExibidas = this.lerMensagensExibidas.bind(this);
        // this.abrirConfiguracoes = this.abrirConfiguracoes.bind(this);
        
        objMensagem = new Mensagem();
        objUtil = new Util();
        // var PushNotification = require("react-native-push-notification");
        // PushNotification.localNotificationSchedule({
        //     //... You can use all the options from localNotifications
        //     message: "Notificado!!!", // (required)
        //     date: new Date(Date.now() + 5000) // in 5 secs
        //   });

        this.buscarMensagens();        
    }
    
    render() {
        return (
            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back.png')} style={{height: '100%', width: '100%', justifyContent:'space-evenly'}}>
                    <Icon name="caret-left" size={30} color="#022C18" onPress={this.voltar} style={{margin: 10}}/>
                    <Text style={{flexWrap:'wrap', fontFamily: 'serif', alignSelf:'center'}}>
                        {this.state.textoMensagem}
                    </Text>
                    <Icon name="caret-right" size={30} color="#022C18" onPress={this.voltar} style={{margin: 10}}  onPress={this.exibirProximaMensagem}/>
                </ImageBackground>
            </View>
        );
    }
    // Busca na base de dados as mensagens cadastradas e salva no dispositivo.
    async buscarMensagens() {
        let listaMensagensExibir = await this.lerMensagensExibir();
        
        if(!listaMensagensExibir || (listaMensagensExibir instanceof Array && listaMensagensExibir.length <= 0)) { 
            objMensagem.listar(this.tratarBuscarMensagens);
        }
    }

    tratarBuscarMensagens(oJsonMensagens) {
        if(oJsonMensagens && oJsonMensagens.length > 0) {
            
            this.persistirMensagens(oJsonMensagens, []);

            Alert.alert(oJsonMensagens.length + ' mensagens sincronizadas no seu dispositivo.');
        } else {
            Alert.alert('Cadastrado de mensagens não localizado.');
        }
    }

    //Faz o sorteio da mensagem a partir da lista salva no dispositivo.
    async exibirProximaMensagem() {
        
        let estado = this.state;
        let listaMensagensExibir = await this.lerMensagensExibir();
        let listaMensagensExibidas = await this.lerMensagensExibidas();

        // Este if ainda nao esta pronto. Comecamos a mexer em 03/10.
        if (listaMensagensExibir.length > 0){
            let indiceMensagem = 0;

            if(listaMensagensExibir.length > 1) {
                indiceMensagem = objUtil.getRand(listaMensagensExibir.length);
            }
            let oMensagem = listaMensagensExibir[indiceMensagem];
            
            estado.textoMensagem = oMensagem.texto;
            this.setState(estado);
            oMensagem.indicadorExibida = true;
            listaMensagensExibidas.push(oMensagem);
            listaMensagensExibir.splice(indiceMensagem, 1);

            this.persistirMensagens(listaMensagensExibir, listaMensagensExibidas);
        } else {
            Alert.alert('Você não tem novas mensagens. :(');
        }
    }

    // create a function that saves your data asyncronously
    async persistirMensagens (listaMensagensExibir, listaMensagensExibidas) {
        try {                   
            let promiseItensExibir = AsyncStorage.setItem('msgExibir', JSON.stringify(listaMensagensExibir));
            let promiseItensExibidos = AsyncStorage.setItem('msgExibidas', JSON.stringify(listaMensagensExibidas));

            await promiseItensExibir;
            await promiseItensExibidos;
        } catch (error) {
            console.log(error);
            Alert.alert('Erro ao salvar mensagens no dispositivo: ' + error);
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
            console.log(error);
            Alert.alert('Erro ao ler mensagens a exibir: ' + error);
        }
    }

    async lerMensagensExibidas () {
        try {
            let promiseItensExibidas = await AsyncStorage.getItem('msgExibidas');

            return JSON.parse(promiseItensExibidas);
        } catch (error) {
            console.log(error);
            Alert.alert('Erro ao ler mensagens a exibir: ' + error);
        }
    }

    // abrirConfiguracoes() {
    //     const { navigation } = this.props;

    //     navigation.navigate('ConfiguracaoComponente');
    // }
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
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
    }
});