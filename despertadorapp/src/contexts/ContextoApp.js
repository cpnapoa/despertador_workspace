import React, { Component } from 'react';
import GerenciadorContextoApp from './GerenciadorContextoApp';

export const ContextoApp = React.createContext();

export class ContextoAppProvider extends Component {
    dados = {gerenciador : null}
    constructor(props) {
        super(props);
        this.dados.gerenciador = new GerenciadorContextoApp();
    }
    render() {
        return (
        <ContextoApp.Provider value={{...this.dados}}>                    
            {this.props.children}            
        </ContextoApp.Provider>
        );
    }
}