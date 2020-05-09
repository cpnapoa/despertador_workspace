import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Alert,
    TouchableOpacity
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';




export default class MasterSlider extends Component {

    static defaultProps = {
        titlePosition: 'top',
        minimumValue: 0,
        maximumValue: 1440,
        step: 1,
        height: 100,
        initialValues: [500, 1000],
    }

    constructor(props) {
        super(props);

        this.state = {
            valorSlider: [this.props.initialValues[0], this.props.initialValues[1]],
            valorHoras: [''], valorHoraGeral: [0, 0, 0, 0]
        };

        this.calculaHoras = this.calculaHoras.bind(this);

    };

    componentDidMount() {
        this.calculaHoras();
    }

    //colocando a prop titlePosition = 'top', vai rendereizar o título abaixo do slider
    titleTop() {
        if (this.props.titlePosition == 'top') {
            const titleView = (
                <View style={{}}>
                    <Text>{this.props.title}</Text>
                </View >
            )
            return titleView;
        }
    }

    //colocando a prop titlePosition = 'bottom', vai rendereizar o título abaixo do slider
    titleBot() {
        if (this.props.titlePosition == 'bottom' || this.props.titlePosition == 'bot') {
            const titleView = (
                <View style={{}}>
                    <Text>{this.props.title}</Text>
                </View >
            )
            return titleView;
        }
    }

    //ajuste fino na esquerda do slider
    numLeft() {
        let i = 0;
        return (
            <View>
                <TouchableOpacity style={styles.indicadores}
                    onPress={() => { this.state.valorSlider[i] = this.state.valorSlider[i] + 1, this.calculaHoras() }}
                >
                    <Text>+1</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.indicadores}
                    onPress={() => { this.state.valorSlider[i] = this.state.valorSlider[i] - 1, this.calculaHoras() }}
                >
                    <Text>-1</Text>
                </TouchableOpacity>
            </View>
        )
    }

    //ajuste fino na direita do slider
    numRight() {
        let i = 1;
        return (
            <View>
                <TouchableOpacity style={styles.indicadores}
                    onPress={() => { this.state.valorSlider[i] = this.state.valorSlider[i] + 1, this.calculaHoras() }}
                >
                    <Text>+1</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.indicadores}
                    onPress={() => { this.state.valorSlider[i] = this.state.valorSlider[i] - 1, this.calculaHoras() }}
                >
                    <Text>-1</Text>
                </TouchableOpacity>
            </View>
        )

    }

    //trasnforma os minutos do contador do slider em horas:minutos para mostrar ao usuário
    calculaHoras() {
        let estado = this.state
        let horas = 0;
        let minutos = 0;

        for (let i = 0; i < 2; i++) {
            horas = 0;
            for (minutos = this.state.valorSlider[i]; minutos >= 60; minutos = minutos - 60) {
                horas = horas + 1;
            }
            estado.valorHoras[i] = horas + 'h' + minutos + 'min';
            estado.valorHoraGeral[i * 2] = horas;
            estado.valorHoraGeral[i * 2 + 1] = minutos;
            this.setState(estado);

        }
        this.props.onTimeChange(estado.valorHoraGeral)
    }


    render() {


        return (

            <View style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 20, margin: 5, paddingBottom: 10 }}>

                {this.titleTop()}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {this.numLeft()}

                    <MultiSlider

                        sliderLength={300}
                        values={[this.props.initialValues[0], this.props.initialValues[1]]}
                        isMarkersSeparated={true}
                        enabledOne={true}
                        enabledTwo={true}
                        min={this.props.minimumValue}
                        max={this.props.maximumValue}
                        step={this.props.step}
                        onValuesChangeStart={this.props.disableScroll}
                        onValuesChangeFinish={this.props.enableScroll}
                        onValuesChange={
                            (valor) => { this.state.valorSlider = valor; this.calculaHoras() }
                        }

                    />

                    {this.numRight()}
                </View>

                <Text style={{ margin: 5 }}>
                    Horário escolhido: das {this.state.valorHoras[0]} até as {this.state.valorHoras[1]}</Text>
                {this.titleBot()}

            </View>

        )
    }
}

const styles = StyleSheet.create({

    indicadores: {
        margin: 1,
        paddingLeft: 5,
        paddingRight: 5,
        //backgroundColor: 'red'
    }

})