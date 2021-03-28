import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import {
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Configuracao from './Configuracao';

export function TabBarConfiguracao ({state, descriptors, navigation, position, gerenciador}) {
    var oNavegacao = navigation;
    var oGerenciadorContextoApp = gerenciador;
    var oConfiguracao = new Configuracao(oGerenciadorContextoApp, oNavegacao);
    var oDadosApp = oGerenciadorContextoApp.dadosApp;
    var oDadosTela = oDadosApp.tela_configuracao;

    function verDetalhes() {
        
        oDadosTela.ver_detalhes = !oDadosTela.ver_detalhes;
        
        oGerenciadorContextoApp.atualizarEstadoTela(oDadosTela.objeto_tela);
    }

    function voltar() {
        oConfiguracao.salvarConfiguracoes(true);
        navigation.goBack();
    }

    function montarIcone(nomeIcone, descricao, oFuncaoOnPress, oFuncaoOnLongPress, habilitado) {
        let corIcone = '#009999';

        if(!habilitado) {
            corIcone = '#e0ebeb';
        }
        if(descricao) {
            return (
                <TouchableOpacity onPress={oFuncaoOnPress} >
                    <View style={{flexDirection:'column', width:60, marginRight:10, marginLeft:10, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={25} color={corIcone} />
                        <Text style={{color:corIcone}}>{descricao}</Text>
                    </View>
                </TouchableOpacity>
            )
        } else {
            return(
                <TouchableOpacity onPress={oFuncaoOnPress} onLongPress={oFuncaoOnLongPress}>
                    <View style={{flexDirection:'column', width:50, alignItems:'center', justifyContent:'center'}}>
                        <Icon name={nomeIcone} size={25} color={corIcone} />
                    </View>
                </TouchableOpacity>
            )
        }
    }
    const areaTotal= {
        flex: .2,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: '#faf9eb'
    };
    return (
        
        <View style={areaTotal}>
            <View style={{flex: .8, borderBottomWidth:1,  borderColor:'#e0ebeb', flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'space-between'}} >
                <View style={{alignSelf:'center', width:50, alignItems:'center', marginLeft:10, justifyContent:'flex-end'}}>
                    <TouchableOpacity onPress={voltar} style={{alignItems:'stretch'}}>
                        <Icon name="arrow-left" size={35} color="#009999" />
                    </TouchableOpacity>
                </View>
                <View style={{alignSelf:'center', alignItems:'center', justifyContent:'center'}}>
                    <Text style={{fontSize: 24}}>Configurações</Text>
                </View>
                <View style={{alignSelf:'center', width:50, flexDirection:'row', marginRight:20, alignItems:'center', justifyContent:'flex-start'}}>                   
                    {montarIcone('information-variant', '', () => { oNavegacao.navigate('Instrucao')}, () => {verDetalhes()}, true)}
                </View>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: 'gray', height:30, alignItems: 'stretch', justifyContent:'space-around'}}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                    ? options.title
                    : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    const event = navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };
                // modify inputRange for custom behavior
                // const inputRange = state.routes.map((_, i) => i);
                // const opacity = Animated.interpolate(position, {
                // inputRange,
                // outputRange: inputRange.map(i => (i === index ? 1 : 0)),
                // });
                let estiloAba = {
                    backgroundColor: 'white',
                    justifyContent:'center',
                    width:'50%'
                }
                let estiloTexto = {
                    fontSize:21, 
                    textAlign:'center',
                    color:'grey'
                }
                if(isFocused) {
                    estiloAba = {
                        //backgroundColor: 'white',
                        backgroundColor: '#faf9eb',
                        justifyContent:'center',
                        borderBottomWidth:1,
                        borderColor:'#e0ebeb',
                        width:'50%'
                    };
                    estiloTexto = {
                        fontSize:24, 
                        textAlign:'center',
                        color:'black',
                        color:'#009999'
                    };
                }

                return (
                    <TouchableOpacity
                        key = {route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        //testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={ estiloAba }
                    >
                        <Text style={estiloTexto}>{label}</Text>
                    </TouchableOpacity>
                );
            })}
            </View>
        </View>
    );
}
