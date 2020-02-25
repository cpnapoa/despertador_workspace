import { createStackNavigator } from 'react-navigation-stack';
import TelaMensagem from '../screens/TelaMensagem';
import TelaConfiguracao from '../screens/TelaConfiguracao';

const NavegadorPrincipal = createStackNavigator({
    TelaMensagem: {
        screen: TelaMensagem,        
    },
    TelaConfiguracao: {
        screen: TelaConfiguracao,
    }
},
{
    defaultNavigationOptions:{
        headerLeftContainerStyle:{
            margin: 10
        },
        headerRightContainerStyle:{
            margin: 10
        }
    }
});

export default NavegadorPrincipal;