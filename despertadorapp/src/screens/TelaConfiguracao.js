/**
 * Componente de tela para dados de cliente
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import Configuracao from './Configuracao';
import {
    StyleSheet,
    View,
    Button,
    Text,
    TextInput
} from 'react-native';
// import { Input} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import Util from '../common/Util';

export default class ConfiguracaoComponente extends Component {

    static navigationOptions = {
        title: 'ConfiguracaoComponente'
    }

    constructor(props) {
        super(props);
        this.state = {h1: '', m1: '', h2: '', m2: ''};
        this.exibirEstatisticas = this.exibirEstatisticas.bind(this);
        this.gerarHoraAleatoria = this.gerarHoraAleatoria.bind(this);

        // objConfiguracao = new Configuracao();
        objUtil = new Util();
        this.exibirEstatisticas();
    }

    async exibirEstatisticas() {
        let estado = this.state;
        let mensagensExibir;
        let mensagensExibidas;

        let promiseItensExibir = await AsyncStorage.getItem('msgExibir');
            
        if(promiseItensExibir) {
            mensagensExibir = JSON.parse(promiseItensExibir);
        }

        let promiseItensExibidas = await AsyncStorage.getItem('msgExibidas');
            
        if(promiseItensExibidas) {
            mensagensExibidas = JSON.parse(promiseItensExibidas);
        }
        
        estado.qtdMensagensExibir = 0;
        estado.qtdMensagensExibidas = 0;

        if(mensagensExibir instanceof Array) {
            estado.qtdMensagensExibir = mensagensExibir.length;
        }
        if(mensagensExibidas instanceof Array) {
            estado.qtdMensagensExibidas = mensagensExibidas.length;
        }        
        
        this.setState(estado);
    }

    gerarHoraAleatoria() {
        let estado = this.state;
        let dh1 = new Date();
        let dh2 = new Date(Date.now() + 120000);
        
        dh1.setHours(parseInt(estado.h1), parseInt(estado.m1), 0, 0);
        dh2.setHours(parseInt(estado.h2), parseInt(estado.m2), 59, 999);
        
        let horaNotificacao = objUtil.obterDataHoraAleatoria(dh1, dh2);
        estado.horaNotificacao = horaNotificacao.toLocaleTimeString();
        
        estado.dh1 = dh1.toLocaleTimeString();
        estado.dh2 = dh2.toLocaleTimeString();

        this.setState(estado);
    }

    render() {
        let estado = this.state;

        return (
            <View style={styles.areaTotal}>
                <View style={styles.areaConfiguracao}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <TextInput placeholder="Hora inicial" size={10} value={estado.h1} onChangeText={(valor) => { estado.h1 = valor;this.setState(estado);}}></TextInput>
                        <TextInput placeholder="Min. inicial" size={10} value={estado.m1} onChangeText={(valor) => { estado.m1 = valor;this.setState(estado);}}></TextInput>
                    </View>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <TextInput placeholder="Hora final" size={10} value={estado.h2} onChangeText={(valor) => { estado.h2 = valor;this.setState(estado);}}></TextInput>
                        <TextInput placeholder="Min. final" size={10} value={estado.m2} onChangeText={(valor) => { estado.m2 = valor;this.setState(estado);}}></TextInput>
                    </View>
                    
                    <Text>Hora aletoria entre {this.state.dh1} e {this.state.dh2} => {this.state.horaNotificacao}</Text>
                    <Button title='Testar hora aleatória' onPress={this.gerarHoraAleatoria} ></Button>

                    <Text>Mensagens exibidas: {this.state.qtdMensagensExibidas}</Text>
                    <Text>Mensagens a exibir: {this.state.qtdMensagensExibir}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    areaTotal: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
    },
    areaConfiguracao: {
        flex: 10,
        alignSelf: 'stretch'
    },
    areaMenu: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: '#5FC594',
        width: '100%'
    },
    areaBotao: {
        flex: 1
    }
});