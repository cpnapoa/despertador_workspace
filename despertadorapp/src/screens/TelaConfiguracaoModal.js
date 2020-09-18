import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    Button,
    Text,
    Alert,
} from 'react-native';
import Util, { clonarObjeto } from '../common/Util';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { Divider, Card } from 'react-native-elements';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class TelaConfiguracaoModal extends Component {
    
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
            this.oDadosTela = this.oDadosApp.tela_configuracao_modal;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.atribuirDataHora = this.atribuirDataHora.bind(this);
        this.montarDiasSemana = this.montarDiasSemana.bind(this);
        this.exibirTimePicker = this.exibirTimePicker.bind(this);
        this.montarTimePicker = this.montarTimePicker.bind(this);
        this.adicionarIntervalo = this.adicionarIntervalo.bind(this);
        this.selecionarTodosDias = this.selecionarTodosDias.bind(this);
        this.voltar = this.voltar.bind(this);

        this.oMensagem = new Mensagem();
        this.oUtil = new Util();
        
        this.oDadosTela.h1 = 0;
        this.oDadosTela.m1 = 0;
        this.oDadosTela.h2 = 0;
        this.oDadosTela.m2 = 0;
    }

    componentDidMount() {
        this.oDadosTela.atribuir_padrao = true;
    }

    voltar() {
        
        this.oNavegacao.goBack();
        this.oGerenciadorContextoApp.atualizarEstadoTela(this.oDadosApp.tela_configuracao.objeto_tela);
    }

    adicionarIntervalo() {
        if(this.oConfiguracao.adicionarIntervalo()) {
            this.voltar();
        }
    }

    atribuirDataHora(num, valor) {
        
        if(valor) {
                 
            if(num == 1) {
                this.oDadosTela.h1 = valor.getHours();
                this.oDadosTela.m1 = valor.getMinutes();
            } else if(num == 2) {
                this.oDadosTela.h2 = valor.getHours();
                this.oDadosTela.m2 = valor.getMinutes();
            }
        }
    }

    selecionarTodosDias(indFimSemana) {
        let indSelecionado = false;
        
        if(indFimSemana) {
            indSelecionado = !this.oDadosTela.todos_dias_fim_semana;
            this.oDadosTela.todos_dias_fim_semana = indSelecionado;
            this.oDadosTela.sab = indSelecionado;
            this.oDadosTela.dom = indSelecionado;
        } else {
            indSelecionado = !this.oDadosTela.todos_dias_semana
            this.oDadosTela.todos_dias_semana = indSelecionado;
            this.oDadosTela.seg = indSelecionado;
            this.oDadosTela.ter = indSelecionado;
            this.oDadosTela.qua = indSelecionado;
            this.oDadosTela.qui = indSelecionado;
            this.oDadosTela.sex = indSelecionado;
        }
        
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    montarDiasSemana(indFimSemana) {
        
        if(indFimSemana) {
            return(
                <View style={{ flexDirection:'column', alignItems:'flex-start'}}>
                    <TouchableOpacity onPress={() => {this.selecionarTodosDias(true);}}
                        style={{flexDirection:'row', margin: 10, alignItems:'center', justifyContent:'flex-start'}}>
                        <CheckBox value={this.oDadosTela.todos_dias_fim_semana} />
                        <Text style={{fontSize:16}}>Fim de semana</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection:'row', alignItems:'center', marginHorizontal: 10}}>
                        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center'}}
                            onPress = {() => {this.oDadosTela.sab = !this.oDadosTela.sab; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}>
                            <CheckBox value={this.oDadosTela.sab} />
                            <Text>Sab</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center'}}
                            onPress = {() => {this.oDadosTela.dom = !this.oDadosTela.dom; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}>
                            <CheckBox value={this.oDadosTela.dom}/>
                            <Text>Dom</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        } else {
            return(
                <View style={{ flexDirection:'column', alignItems:'flex-start'}}>
                    <TouchableOpacity onPress={() => {this.selecionarTodosDias(false);}}
                        style={{flexDirection:'row', margin: 10, alignItems:'center', justifyContent:'flex-start'}}>
                        <CheckBox value={this.oDadosTela.todos_dias_semana} />
                        <Text style={{fontSize:16}}>Dias de semana</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection:'row', alignItems:'center', marginHorizontal: 10}}>
                        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center'}}
                            onPress = {() => {this.oDadosTela.seg = !this.oDadosTela.seg; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}>
                            <CheckBox value={this.oDadosTela.seg} />
                            <Text>Seg</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center'}}
                            onPress = {() => {this.oDadosTela.ter = !this.oDadosTela.ter; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}>
                            <CheckBox value={this.oDadosTela.ter} />
                            <Text>Ter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center'}}
                            onPress = {() => {this.oDadosTela.qua = !this.oDadosTela.qua; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}>
                            <CheckBox value={this.oDadosTela.qua} />
                            <Text>Qua</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center'}}
                            onPress = {() => {this.oDadosTela.qui = !this.oDadosTela.qui; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}>
                            <CheckBox value={this.oDadosTela.qui} />
                            <Text>Qui</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center'}}
                            onPress = {() => {this.oDadosTela.sex = !this.oDadosTela.sex; this.oGerenciadorContextoApp.atualizarEstadoTela(this);}}>
                            <CheckBox value={this.oDadosTela.sex} />
                            <Text>Sex</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    exibirTimePicker(numHora) {
        this.oDadosTela.num_hora_escolher = numHora;
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    montarTimePicker(numHora) {
        if(numHora) {
            return(
            <DateTimePicker
            testID="dateTimePicker"
            timeZoneOffsetInMinutes={0}
            value={new Date().getTime()}
            mode='time'
            is24Hour={true}
            display="clock"
            onChange={(event, valor) => {
                this.atribuirDataHora(numHora, valor);
                this.oDadosTela.num_hora_escolher = 0;
                this.oDadosTela.atribuir_padrao = false
                this.oGerenciadorContextoApp.atualizarEstadoTela(this);
            }}
            />
            )
        }
    }

    render() {
        if(__DEV__ && this.oDadosTela.atribuir_padrao) {
            let oTime = new Date();
            
            this.atribuirDataHora(1, oTime);
            this.atribuirDataHora(2, oTime);
        }

        let h1 = `${this.oDadosTela.h1}`.padStart(2, '0');
        let m1 = `${this.oDadosTela.m1}`.padStart(2, '0');

        let h2 = `${this.oDadosTela.h2}`.padStart(2, '0');
        let m2 = `${this.oDadosTela.m2}`.padStart(2, '0');
        
        return (
            <View style={styles.areaTotal}>
                <View style={{flex: 0.1, borderBottomWidth:1, marginBottom: 10,  borderColor:'#e0ebeb', flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'space-between'}} >
                    <View style={{alignSelf:'center', width:50, alignItems:'center', marginLeft:10,  justifyContent:'flex-end'}}>
                        <TouchableOpacity onPress={this.voltar} style={{alignItems:'stretch'}}>
                            <Icon name="arrow-left" size={40} color="#009999" />
                        </TouchableOpacity>
                    </View>
                    <View style={{alignSelf:'center', alignItems:'center', justifyContent:'center'}}>
                        <Text style={{fontSize: 24}}>Novo Intervalo</Text>
                    </View>
                    <View style={{alignSelf:'center', width:50, alignItems:'center', justifyContent:'flex-end'}}>                        
                    </View>
                </View>
                <View style={styles.areaIntervaloDefinicao}>
                    <Card containerStyle={{ alignItems:'center', marginTop:10, backgroundColor: '#f0f5f5', borderWidth: 1, borderRadius:5}} >
                        <View style={{ flexDirection: 'row', margin: 20, justifyContent: 'space-evenly', alignItems:'flex-end' }}>
                            <TouchableOpacity onPress={() => this.exibirTimePicker(1)} 
                                                style={{flexDirection:'column', alignItems:'center' }}>
                                <Text style={{marginBottom:5, fontSize:20}}>Hora inicial</Text>
                                <Text style={{fontSize:24, borderStyle:'solid', borderRadius:5, borderWidth: 1, padding:5, paddingLeft:10, paddingRight:10}}>{h1}:{m1}</Text>
                            </TouchableOpacity>
                            <Text style={{margin:10, fontSize:20}}>às</Text>
                            <TouchableOpacity onPress={() => this.exibirTimePicker(2)} 
                                                style={{flexDirection:'column', alignItems:'center'}}>
                                <Text style={{marginBottom:5, fontSize:20}}>Hora final</Text>
                                <Text style={{fontSize:24, borderStyle:'solid', borderRadius:5, borderWidth: 1, padding:5, paddingLeft:10, paddingRight:10}}>{h2}:{m2}</Text>
                            </TouchableOpacity>
                        </View>
                        <Divider style={{marginTop:10}}></Divider>
                        {this.montarDiasSemana(false)}
                        <Divider style={{margin:10}}></Divider>
                        {this.montarDiasSemana(true)}
                    </Card>
                    {this.montarTimePicker(this.oDadosTela.num_hora_escolher)}
                </View>
                <View style={{ flex: .17, margin: 3, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Button title='Adicionar' onPress={this.adicionarIntervalo} color={'#009999'}></Button>
                </View>
            </View>
        );
    }
}

TelaConfiguracaoModal.contextType = ContextoApp;

const styles = StyleSheet.create({
    areaTotal: {
        flex: 1,
        flexDirection:'column',
        alignItems:'stretch',
        justifyContent:'space-between',
        backgroundColor: '#faf9eb'
    },
    areaIntervaloDefinicao: {
        flex: .70,
        flexDirection:'column', 
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignContent: 'stretch',
    },
});