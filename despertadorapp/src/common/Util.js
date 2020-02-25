export default class Util {
    
    getURL(metodo){
        protocol = 'https://';
        domain = 'despertadorserverapp.herokuapp.com';

        // if (__DEV__) {
        //     protocol = 'http://';
        //     domain = '192.168.2.151:8000';
        //     domain = '192.168.0.3:8000';
        // }
        return protocol + domain + metodo;
    }


    getRand(numMax){
        numRand = Math.floor((Math.random() * numMax));
        return numRand;
    }
}