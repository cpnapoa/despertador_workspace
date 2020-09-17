import { clonarObjeto } from "../common/Util";

export const DADOS_MENSAGENS = {
    mensagem_atual: '',
    mensagem_proxima: '',
    lista_mensagens_exibir: [],
    lista_mensagens_exibidas: [],
};

export const DADOS_TELA_MENSAGEM = {
    objeto_tela: null
};

export const AGENDA = {
    agenda_intervalos_dias: [],
    ultima_data_hora_agendada: DADOS_DATA_HORA_AGENDAMENTO,
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
    indice_lista: -1,
    selecionado: false,
    ativado: true
}

export const DADOS_DATA_HORA_AGENDAMENTO = {
    data_hora_agenda: '',
    dia_semana: -1,
    indice_intervalo: -1,
    indice_hora: -1,
    em_segundo_plano: false,
}

export const DADOS_TELA_CONFIGURACAO = {
    
    dh1: '',
    dh2: '',
    hora_notificacao: '',
    agenda_notificacoes: clonarObjeto(AGENDA),
    qtd_mensagens_exibir: 0,
    qtd_mensagens_exibidas: 0,
    scroll_enabled: true,
    ver_detalhes: false,
};

export const DADOS_TELA_CONFIGURACAO_MODAL = {
    dom: false,
    seg: false,
    ter: false,
    qua: false,
    qui: false,
    sex: false,
    sab: false,
    h1: '',
    m1: '',
    h2: '',
    m2: '',
    num_hora_escolher: 0,
};

export const DADOS_CONTROLE_APP = {
    exibir_mensagem: false,
    em_segundo_plano: false,
    alterou_agenda: false,
};

export const DADOS_APP_GERAL = {
    dados_app: {
        dados_mensagens: clonarObjeto(DADOS_MENSAGENS),
        controle_app: DADOS_CONTROLE_APP,
        tela_mensagem: DADOS_TELA_MENSAGEM,
        tela_configuracao: DADOS_TELA_CONFIGURACAO,
        tela_configuracao_modal: DADOS_TELA_CONFIGURACAO_MODAL,
    },
    'registros_log': null,
};

export const DIAS_SEMANA = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
];