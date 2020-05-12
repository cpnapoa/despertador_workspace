import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    ScrollView,
    Button,
    ImageBackground,
    Text,
    TextInput,
    Alert,
} from 'react-native';
import Util, { clonarObjeto } from '../common/Util';
import Slider from '@react-native-community/slider';
import MasterSlider from '../common/MasterSlider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { DADOS_INTERVALO } from '../contexts/DadosAppGeral';

export default class TelaConfiguracao extends Component {

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
            this.oDadosTela = this.oDadosApp.tela_configuracao;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.exibirEstatisticas = this.exibirEstatisticas.bind(this);
        this.adicionarIntervalo = this.adicionarIntervalo.bind(this);
        this.salvarConfiguracoes = this.salvarConfiguracoes.bind(this);
        this.atribuirListaIntervalosNoDispositivo = this.atribuirListaIntervalosNoDispositivo.bind(this);

        this.oMensagem = new Mensagem();
        this.oUtil = new Util();

        // this.oConfiguracao.configurarNotificacao(this.oNavegacao, this.oDadosControleApp);
        this.atribuirListaIntervalosNoDispositivo();
        this.exibirEstatisticas();
    }

    async atribuirListaIntervalosNoDispositivo() {
        let oListaIntervalos = await this.oConfiguracao.obterListaIntervalosNoDispositivo();
        
        if(oListaIntervalos) {
            this.oDadosTela.intervalos_dias_semana = oListaIntervalos;
        }
    }
    async exibirEstatisticas() {
        
        let mensagensExibir = [];
        let mensagensExibidas = [];

        mensagensExibir = await this.oMensagem.lerMensagensExibir();
        mensagensExibidas = await this.oMensagem.lerMensagensExibidas();

        if (mensagensExibir instanceof Array) {
            this.oDadosTela.qtd_mensagens_exibir = mensagensExibir.length;
        }
        if (mensagensExibidas instanceof Array) {
            this.oDadosTela.qtd_mensagens_exibidas = mensagensExibidas.length;
        }

        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    adicionarIntervalo() {
        let oNovoIntervalo = clonarObjeto(DADOS_INTERVALO);
        
        oNovoIntervalo.hora_inicial.hora = this.oDadosTela.h1;
        oNovoIntervalo.hora_inicial.minuto = this.oDadosTela.m1;
        oNovoIntervalo.hora_final.hora = this.oDadosTela.h2;
        oNovoIntervalo.hora_final.minuto = this.oDadosTela.m2;
        oNovoIntervalo.qtd_mensagens = 1;
        
        this.oConfiguracao.adicionarIntervaloDiaSemana(1, oNovoIntervalo);
        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    salvarConfiguracoes() {
        this.oConfiguracao.salvarIntervalosNoDispositivo();        
        this.oConfiguracao.agendarNotificacao();
        this.oNavegacao.goBack();
    }

    //esses métodos servem para fixar o scrollview enquanto selecionamos um valor no slider
    enableScroll = () => {this.oDadosTela.scroll_enabled = true;this.oGerenciadorContextoApp.atualizarEstadoTela(this);};
    disableScroll = () => {this.oDadosTela.scroll_enabled = false;this.oGerenciadorContextoApp.atualizarEstadoTela(this);};

    setHoraGeral() {

        this.oDadosTela.h1 = this.oDadosTela.hora_geral[0]+'';
        this.oDadosTela.m1 = this.oDadosTela.hora_geral[1]+'';
        this.oDadosTela.h2 = this.oDadosTela.hora_geral[2]+'';
        this.oDadosTela.m2 = this.oDadosTela.hora_geral[3]+'';

        this.oGerenciadorContextoApp.atualizarEstadoTela(this);
    }

    listarHoras() {
        let oDiaSemana = this.oConfiguracao.obterDiaSemana(1);
        let oListaIntervalos;
        
        let oIntervalo;
        let oHoras;
        let oListaExibicao = [];
        if(oDiaSemana) {
            oListaIntervalos = oDiaSemana.intervalos;
        
            for(let i = 0; i < oListaIntervalos.length; i++) {
                oIntervalo = oListaIntervalos[i];
                if(oIntervalo) {
                    oHoras = oIntervalo.horas_exibicao;
                    if(oHoras) {
                        
                        for(let t = 0; t < oHoras.length; t++) {
                            oListaExibicao.push(<Text>Intervalo {oIntervalo.hora_inicial.hora}:{oIntervalo.hora_inicial.minuto} as : 
                            {oIntervalo.hora_inicial.hora}:{oIntervalo.hora_inicial.minuto} = {oHoras[t]}</Text>);
                        }
                    }
                }
            }
        }
        return oListaExibicao;
    }

    render() {

        return (
            <View style={styles.areaTotal}>
                <ImageBackground source={require('../images/parchment_back_edge.png')} style={styles.imgBG} resizeMode='stretch'>
                    <View style={{flex: 0.10, flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'flex-start'}} >
                        <Icon name="caret-left" size={40} color="#022C18" style={{marginLeft: 55}}  onPress={this.salvarConfiguracoes} />
                    </View>
                
                    {/* <View style={styles.areaConfiguracao}> */}
                        <View style={styles.areaIntervaloDefinicao}>
                            <Text>Hora inicial</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Slider
                                    style={{ width: '35%', height: 20 }}
                                    minimumValue={1}
                                    maximumValue={24}
                                    step={1}
                                    onValueChange={(valor) => { this.oDadosTela.h1 = valor.toString(); this.oGerenciadorContextoApp.atualizarEstadoTela(this);; }}
                                />
                                <TextInput textAlign='right' placeholder="HH" size={10} value={this.oDadosTela.h1} onChangeText={(valor) => { this.oDadosTela.h1 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                                <Text>h </Text>
                                <TextInput textAlign='right' placeholder="mm" size={10} value={this.oDadosTela.m1} onChangeText={(valor) => { this.oDadosTela.m1 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                                <Text>min</Text>
                                <Slider
                                    style={{ width: '35%', height: 20 }}
                                    minimumValue={1}
                                    maximumValue={60}
                                    step={1}
                                    onValueChange={(valor) => { this.oDadosTela.m1 = valor.toString(); this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}
                                />
                            </View>

                            <Text>Hora final: </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Slider
                                    style={{ width: '35%', height: 20 }}
                                    minimumValue={1}
                                    maximumValue={24}
                                    step={1}
                                    onValueChange={(valor) => { this.oDadosTela.h2 = valor.toString(); this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}
                                />
                                <TextInput textAlign='right' placeholder="HH" size={10} value={this.oDadosTela.h2} onChangeText={(valor) => { this.oDadosTela.h2 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                                <Text>h </Text>
                                <TextInput textAlign='right' placeholder="mm" size={10} value={this.oDadosTela.m2} onChangeText={(valor) => { this.oDadosTela.m2 = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}></TextInput>
                                <Text>min</Text>
                                <Slider
                                    style={{ width: '35%', height: 20 }}
                                    minimumValue={1}
                                    maximumValue={60}
                                    step={1}
                                    onValueChange={(valor) => { this.oDadosTela.m2 = valor.toString(); this.oGerenciadorContextoApp.atualizarEstadoTela(this); }}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            {/* <Text>Hora aletoria entre {this.oDadosTela.dh1} e {this.oDadosTela.dh2} => {this.oDadosTela.hora_notificacao}</Text> */}
                            <Button title='Testar hora aleatória' onPress={this.oConfiguracao.agendarNotificacao} ></Button>
                            <Button title='Testar adicionar intervalo' onPress={this.adicionarIntervalo} ></Button>
                        </View>
                        <View >
                            <Text>Mensagens exibidas: {this.oDadosTela.qtd_mensagens_exibidas}</Text>
                            <Text>Mensagens a exibir: {this.oDadosTela.qtd_mensagens_exibir}</Text>
                            {this.listarHoras()}
                        </View>
                        <View style={{flex: 0.15, marginTop: 20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                      
                        </View>
                        
{/* 
                        <View style={{ padding: 5 }}>
                            <Button
                                onPress={this.oMensagem.sincronizarMensagensComServidor}
                                title="Buscar novas mensagens no servidor"
                                color="#0000ff"
                            />
                            <Button
                                onPress={this.exibirEstatisticas}
                                title="Atualizar contadores"
                                color="#ff0000"
                            />
                            <Button
                                onPress={
                                    //o .then não está funcionando. this.exibirEstatisticas nao espera o outro método acabar para ser executado
                                    () => {
                                        this.oMensagem.sincronizarMensagensComServidor().then(() => { this.exibirEstatisticas() })
                                    }
                                }
                                title="Fazer os dois"
                                color="#ff00ff"
                            />

                        </View> */}
                    {/* </View> */}
{/* 
                    <Text>horaGeral[0,1]:{this.oDadosTela.hora_geral[0]}:{this.oDadosTela.hora_geral[1]} | horaGeral[2,3]:{this.oDadosTela.hora_geral[2]}:{this.oDadosTela.hora_geral[3]}</Text>

                    <View style={styles.areaHoras} >
                        <ScrollView scrollEnabled={this.oDadosTela.scroll_enabled}>

                            <MasterSlider
                                title='componente MasterSilder!'
                                titlePosition='top'
                                height={100}
                                step={1}
                                initialValues={[500, 1000]} //poderia inicializar o slider com o horário atual
                                minimumValue={0}
                                maximumValue={1440}
                                disableScroll={this.disableScroll}
                                enableScroll={this.enableScroll}

                                onTimeChange={(valor) => { this.oDadosTela.var_teste2 = valor; this.oDadosTela.hora_geral = valor; this.oGerenciadorContextoApp.atualizarEstadoTela(this); this.setHoraGeral(); }}
                            ></MasterSlider>

                        </ScrollView>
                    </View> */}
                </ImageBackground>
            </View>
        );
    }
}

TelaConfiguracao.contextType = ContextoApp;

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
    // areaConfiguracao: {
    //     flex: .50,
    //     flexDirection:'column', 
    //     alignItems:'center', 
    //     justifyContent:'center',
    //     backgroundColor: 'blue'
    // },
    areaIntervaloDefinicao: {
        flex: .3,
        flexDirection:'column', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        backgroundColor: 'yellow'
    },
    areaEstatisticas: {

    },
    areaBotao: {

    },
    areaHoras: {
        flex: .38,
        
        padding: 5,
        backgroundColor: 'black'
    }
});