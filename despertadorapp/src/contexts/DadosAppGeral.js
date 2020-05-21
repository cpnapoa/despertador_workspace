import { clonarObjeto } from "../common/Util";

export const DADOS_MENSAGEM = {
    'texto': ''
};

export const DADOS_TELA_MENSAGEM = {
    'texto_botao': '',
    'elemento_botao': '',
    'msg_num': '',
};

export const AGENDA = {
    agenda_intervalos_dias: [],
    ultima_hora_agendada: '',
}

export const DADOS_DIA_SEMANA = {
    dia_semana: 0,
    qtd_mensagens_dia: 0,
    intervalos: [],
}

export const HORA_MENSAGEM = {
    hora: 0,
    minuto: 0,
}

export const DADOS_INTERVALO = {
    dia_semana: 0,
    hora_inicial: clonarObjeto(HORA_MENSAGEM),
    hora_final: clonarObjeto(HORA_MENSAGEM),
    qtd_mensagens_intervalo: 0,
    horas_exibicao: [],
    novo: true,
}

export const DADOS_TELA_CONFIGURACAO = {
    h1: '',
    m1: '',
    h2: '',
    m2: '',
    dh1: '',
    dh2: '',
    hora_notificacao: '',
    agenda_notificacoes: clonarObjeto(AGENDA),
    qtd_mensagens_exibir: 0,
    qtd_mensagens_exibidas: 0,
    scroll_enabled: true,
    var_teste: [0, 0],
    var_teste2: ['', ''],
    hora_geral: [0, 0, 0, 0]
};

export const DADOS_CONTROLE_APP = {
    'exibir_mensagem': false,
};

export const DADOS_APP_GERAL = {
    'dados_app': {
        'mensagem': DADOS_MENSAGEM,
        'controle_app': DADOS_CONTROLE_APP,
        'tela_mensagem': DADOS_TELA_MENSAGEM,
        'tela_configuracao': DADOS_TELA_CONFIGURACAO,
    },
    'registros_log': null,
};

export const DIAS_SEMANA = [
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sab'
];