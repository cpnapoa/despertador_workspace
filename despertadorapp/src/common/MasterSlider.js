import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Button,
    Text,
    TextInput,
    Alert
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';




export default class MasterSlider extends Component {

    static defaultProps = {
        minimumValue: 0,
        maximumValue: 100,
        initialValues: [20, 80],
    }

    constructor(props) {
        super(props);

        this.state = { valorSlider: [this.props.initialValues[0], this.props.initialValues[1]], valorHoras: [''] };

        this.calculaHoras = this.calculaHoras.bind(this);
        
    };

    componentDidMount() {
        this.calculaHoras();
    }

    //colocando a prop titePosition = 'top', vai rendereizar o título abaixo do slider
    titleTop() {
        if (this.props.titlePosition == 'top') {
            const titleView = (
                <View style={{ backgroundColor: 'red' }}>
                    <Text>Título top: {this.props.title}</Text>
                </View >
            )
            return titleView;
        }
    }

    //colocando a prop titePosition = 'bottom', vai rendereizar o título abaixo do slider
    titleBot() {
        if (this.props.titlePosition == 'bottom' || this.props.titlePosition == 'bot') {
            const titleView = (
                <View style={{ backgroundColor: 'red' }}>
                    <Text>Título bot: {this.props.title}</Text>
                </View >
            )
            return titleView;
        }
    }

    //colocandp a prop numPosition = 'left' vai renderizar o contador na direita do slider
    numLeft() {
        if (this.props.numPosition == 'left' || this.props.numPosition == 'l') {
            return <Text style={{ margin: 10, backgroundColor: 'pink' }}>{this.state.valorSlider[0]}:{this.state.valorSlider[1]}</Text>
        }
    }

    //colocandp a prop numPosition = 'right' vai renderizar o contador na direita do slider
    numRight() {
        if (this.props.numPosition == 'right' || this.props.numPosition == 'r') {
            return <Text style={{ margin: 10, backgroundColor: 'pink' }}>{this.state.valorSlider[0]}:{this.state.valorSlider[1]}</Text>
        }
    }


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
            this.setState(estado);
        }
    }

    render() {


        return (

            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'yellow' }}>

                {this.titleTop()}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'blue' }}>
                    {this.numLeft()}

                    <MultiSlider

                        sliderLength= {270}
                        values={[this.props.initialValues[0], this.props.initialValues[1]]}
                        isMarkersSeparated={true}
                        enabledOne={true}
                        enabledTwo={true}
                        min={this.props.minimumValue}
                        max={this.props.maximumValue}
                        step={this.props.step}
                        onValuesChange={
                            (valor) => { this.state.valorSlider = valor; this.calculaHoras() }
                        }
                    ></MultiSlider>

                    {this.numRight()}
                </View>
                <Text style={{ marginTop: 5, backgroundColor: 'pink' }}>
                    valorSlider[0]: {this.state.valorSlider[0]} | valorSlider[1]: {this.state.valorSlider[1]}</Text>
                <Text style={{ margin: 5, backgroundColor: 'pink' }}>
                    valorHoras[0]: {this.state.valorHoras[0]} | valorHoras[1]: {this.state.valorHoras[1]}</Text>
                {this.titleBot()}

            </View>




        )
    }
}