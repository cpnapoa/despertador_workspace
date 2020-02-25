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
    Text,
    Button
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class ConfiguracaoComponente extends Component {

    static navigationOptions = {
        title: 'ConfiguracaoComponente'
    }

    constructor(props) {
        super(props);
        this.state = {};
        this.exibirEstatisticas = this.exibirEstatisticas.bind(this);

        objConfiguracao = new Configuracao();
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

    render() {
        return (
            <View style={styles.areaTotal}>
                <View style={styles.areaConfiguracao}>
                    <Text>Campo config 1...</Text>
                    <Text>Campo config 2...</Text>
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