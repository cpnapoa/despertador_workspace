import React, { Component } from 'react';
import Mensagem from './Mensagem';
import {
    StyleSheet,
    View,
    Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Util from '../common/Util';

export default class TelaInstrucaoModal extends Component {
    
    constructor(props, value) {
        super();

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
            this.oMensagem = new Mensagem(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);
            
            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }
        
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        
    }

    voltar() {
        
        this.oNavegacao.goBack();
    }

    render() {

        return (
            <View style={styles.areaTotal}>
                <View style={{flex: 0.1, borderBottomWidth:1, marginBottom: 10,  borderColor:'#e0ebeb', flexDirection:'row', alignItems: 'center', alignSelf:'stretch', justifyContent:'space-between'}} >
                    <View style={{alignSelf:'center', width:50, alignItems:'center', justifyContent:'flex-end'}}>
                        <TouchableOpacity onPress={this.voltar} style={{alignItems:'stretch'}}>
                            <Icon name="arrow-left" size={35} color="#009999" />
                        </TouchableOpacity>
                    </View>
                    <View style={{alignSelf:'center', alignItems:'center', justifyContent:'center'}}>
                        <Text style={{fontSize: 24}}>Instruções</Text>
                    </View>
                    <View style={{alignSelf:'center', width:50, alignItems:'center', justifyContent:'flex-end'}}>                        
                    </View>
                </View>
                <View style={styles.areaIntervaloDefinicao}>
                    <ScrollView>
                        <View>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={styles.titulos}>
                                    Parabéns!{'\n'} Você foi selecionado para testar o Despertador de Consciência!
                                </Text>
                            </View>

                            <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                <Text style={styles.subTitulos}>
                                    Aqui passaremos algumas instruções sobre como utilizar, e qual comportamento esperar do aplicativo.
                                </Text>
                            </View>
                        </View>

                        <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                            <Text style={styles.textos}>
                                {'\t\t'} A ideia do aplicativo é surpreender o usuário, fazendo o celular desepertar
                                em um horário aleatório para apresentar uma frase filosófica.
                                É um 'despertador' que eleva sua 'consciência', portanto um DESPERTADOR DE CONSCIÊNCIA!
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'} Ele funciona da seguinte maneira: você seleciona intervalos,
                                que vamos chamar de 'horários ativos', ao longo do dia
                                nos quais poderia receber uma mensagem filosófica.
                                O aplicativo então vai sortear uma hora e mensagem
                                aleatórias dentro desse intervalo para te surpreender com muita sabedoria!
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'} Por exemplo: O meu horário ativo é das 7:30 até as 11:00 pela manhã,
                                e das 12:30 até as 21:00 no período da tarde e da noite.
                                Isso quer dizer que o aplicativo pode despertar com mensagens filosóficas
                                em qualquer horário que esteja dentro desses intervalos.{'\n\t\t'}
                                Posso escolher para receber até 5 mensagens em um único dia, que serão
                                apresentadas em horários aleatórios dentro dos intervalos definidos.{'\n\t\t'}
                                Obviamente que eu nao criei nenhum intervalo durante a madrugada porque
                                não quero ter o sono perturbado por uma notificação no celular!
                                Também retirei do horário ativo o meu intervalo de almoço, pois não dou
                                atenção ao celular nesse período.
                            </Text>

                            <Text style={styles.subTitulos}>
                                Como utilizar:
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'}Primeiramente é necessário definir os horários ativos.{'\n\t\t'}
                                Nós já colocamos alguns intervalos que julgamos ser bons para você,
                                mas sinta-se livre para alterá-los!{'\n\t\t'}
                                Na tela de configurações, procure
                                pelo ícone de adicionar novo horário. Defina um horário inicial e um horário final para o seu intervalo.
                                Para o bom funcionamento do aplicativo, recomendamos que o tamanho mínimo de um intervalo seja de
                                30 minutos, e o tempo mínimo entre um intervalo e
                                outro também seja de 30 minutos!{'\n\t\t'}
                                Em seguida, marque os dias da semana que gostaria de implementar esse intervalo. Clique no ok.
                                Parabéns, voce acabou de adicionar novos intervalos!{'\n\t\t'}
                                Para excluí-los, basta clicar no ícone 'editar', selecionar os intervalos que deseja excluir,
                                e selecionar 'excluir'.
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'}O próximo passo é definir quantas mensagens deseja receber ao longo do dia.{'\n\t\t'}
                                Junto da tabela que apresenta os horários de cada dia da semana existe um contador que
                                indica quantas mensagens serão sorteadas por dia.{'\n\t\t'}
                                Lembre-se que o número máximo de mensagens em um dia é 5!
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'}E está pronto! Agora é só aguardar que uma mensagem será sorteada durante um horário
                                que você definiu como ativo!
                            </Text>


                            <Text style={styles.subTitulos}>
                                Algumas dicas:
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'}Se voce definir intervalos muito pequenos e selecionar uma quantidade de mensagens muito grande
                                por dia, vai acabar recebendo as mensagens com intervalos muito curtos entre elas.
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'}Se você definir muitos intervalos em um só dia (mais de 5), é possível que alguns desses intervalos
                                fiquem sem nenhuma mensagem pois o limite máximo de mensagens por dia é 5. Então não se assuste se
                                não receber sua frase filosófica em algum intervalo, ok?
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'}Quando as suas mensagens acabarem, não se preocupe! Elas serão automaticamente sincronizadas
                                com as mensagens do servidor assim que o acesso à internet estiver disponível.
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'}As configurações de gerenciamento de energia de alguns celualres podem afetar o agendamento de
                                notificações. Isso acontece principalmente no casos de 'cancelamento' das notificações
                                (notificações dispensadas, 'arrastadas para o lado').
                                Prefira sempre apertar o botão 'ok' presente junto da notificação ao invés de dispensá-la arrastando para o lado,
                                para ajudar a manter o bom funcionamento do aplicativo.
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'}Qualquer dúvida ou sugestão, basta entrar em contato com Vladimir ou Gustavo ;)
                            </Text>
                        </View>
                    </ScrollView>
                </View>
                <View style={{ flex: .17, margin: 3, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    
                </View>
            </View>
        );
    }
}

TelaInstrucaoModal.contextType = ContextoApp;

const styles = StyleSheet.create({
    areaTotal: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: '#faf9eb'
    },
    header: {
        flex: 0.1,
        borderBottomWidth: 1,
        marginBottom: 10,
        borderColor: '#e0ebeb',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'space-between'
    },
    areaIntervaloDefinicao: {
        flex: .90,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        alignContent: 'stretch',
        padding: 10,
        marginBottom: 20,
        //backgroundColor: 'blue',
    },
    titulos: {
        fontSize: 30,
        textAlign: 'center',
    },
    subTitulos: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    textos: {
        fontSize: 15,
        textAlign: 'justify',
        marginBottom: 10,
    }
});