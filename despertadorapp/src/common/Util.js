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

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    obterDataHoraAleatoria(horaIni, horaFim) {
        let d1 = new Date();
        let d2 = new Date();

        d1.setTime(horaIni.getTime());
        d2.setTime(horaFim.getTime());
                
        let d3 = new Date(this.getRandomInt(d1.getTime(), d2.getTime()))

        return d3;
    }
}