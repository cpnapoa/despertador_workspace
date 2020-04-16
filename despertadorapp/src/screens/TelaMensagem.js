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

        this.state = {textoMensagem: ''};        
        this.exibirProximaMensagem = this.exibirProximaMensagem.bind(this);
        this.obterProximaMensagem = this.obterProximaMensagem.bind(this);
        
        objMensagem = new Mensagem();
        objUtil = new Util();
        objMensagem.sincronizarMensagensComServidor();
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
    
        if(navigation && navigation.getParam('exibirMensagem') === 'S') {    
            navigation.setParams({ 'exibirMensagem': 'N' });
            this.exibirProximaMensagem();
        }
    }
    
    render() {

        return (
            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back.png')} style={{ flex: 1, height: '100%', width: '100%', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                        <Text style={styles.formataFrase}>
                            {this.state.textoMensagem}
                        </Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                        <Icon name="caret-right" size={30} color="#022C18" onPress={this.voltar} style={{margin: 10}}  onPress={this.exibirProximaMensagem}/>
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

    formataFrase: {
        fontFamily: 'AutumnMoon',
        fontWeight: 'bold',
        fontSize: 30,
        width: '80%',
        //backgroundColor: 'yellow',
        textAlign: 'center',
    }
});