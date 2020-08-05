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
import Icon from 'react-native-vector-icons/FontAwesome';
import { ContextoApp } from '../contexts/ContextoApp';
import Configuracao from './Configuracao';
import { DADOS_INTERVALO, DIAS_SEMANA } from '../contexts/DadosAppGeral';
import { Divider, Card } from 'react-native-elements';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';

export default class TelaInstrucoesModal extends Component {

    constructor(props, value) {
        super(props);

        if (props && props.navigation) {
            this.oNavegacao = props.navigation;
        }

        if (value && value.gerenciador) {
            // Atribui o gerenciador de contexto, recebido da raiz de contexto do aplicativo (ContextoApp).
            this.oGerenciadorContextoApp = value.gerenciador;

            this.oDadosApp = this.oGerenciadorContextoApp.dadosApp;
            this.oDadosControleApp = this.oGerenciadorContextoApp.dadosControleApp;
            this.oDadosTela = this.oDadosApp.tela_configuracao_modal;
            this.oDadosTelaConfiguracao = this.oDadosApp.tela_configuracao;
            this.oUtil = new Util(this.oGerenciadorContextoApp);
            this.oConfiguracao = new Configuracao(this.oGerenciadorContextoApp, this.oNavegacao);

            this.state = this.oGerenciadorContextoApp.dadosAppGeral;
        }

        this.voltar = this.voltar.bind(this);
        this.obterConfiguracoesNoDispositivo = this.obterConfiguracoesNoDispositivo.bind(this);

        this.oMensagem = new Mensagem();
        this.oUtil = new Util();

        // configurarNotificacao(this.oNavegacao, this.oDadosControleApp);
    }

    async obterConfiguracoesNoDispositivo() {
        let oListaIntervalos = await this.oConfiguracao.obterAgendaNotificacoesDoDispositivo();

        if (oListaIntervalos) {
            this.oDadosTelaConfiguracao.agenda_notificacoes = oListaIntervalos;
        }
    }


    voltar() {

        this.oNavegacao.goBack();
        this.oGerenciadorContextoApp.atualizarEstadoTela(this.oDadosApp.tela_configuracao.objeto_tela);
    }



    render() {


        return (
            <View style={styles.areaTotal}>
                <View style={styles.header} >
                    <View style={{ alignSelf: 'center', width: 50, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <TouchableOpacity onPress={this.voltar} style={{ alignItems: 'stretch' }}>
                            <Icon name="caret-left" size={40} color="#009999" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>Tela de instruções</Text>
                    </View>
                    <View style={{ alignSelf: 'center', width: 50, alignItems: 'center', justifyContent: 'flex-end' }}>
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
                                Tenha em mente que o tamanho mínimo de um intervalo é 30 minutos, e o tempo mínimo entre um intervalo e
                                outro também é de 30 minutos!{'\n\t\t'}
                                Em seguida, marque os dias da semana que gostaria de implementar esse intervalo. Clique no ok.
                                Parabéns, voce acabou de adicionar intervalos!{'\n\t\t'}
                                Para excluí-los, basta clicar no ícone de 'lixeira' ao lado do intervalo.
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
                                com as mensagens do servidor assim que o aplicativo for aberto e o
                                acesso à internet estiver disponível.
                            </Text>
                            <Text style={styles.textos}>
                                {'\t\t'}Qualquer dúvida ou sugestão, basta entrar em contato com Vladimir ou Gustavo ;)
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}

TelaInstrucoesModal.contextType = ContextoApp;

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