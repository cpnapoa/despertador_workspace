import { clonarObjeto } from "../common/Util";

export const DADOS_MENSAGEM_MODAL = {
    exibir_modal : false,
    mensagem : '',
    botoes : []
}

export const DADOS_BOTAO = {
    texto: '',
    funcao: null
}

export const DADOS_MENSAGENS = {
    mensagem_atual: '',
    mensagem_proxima: '',
    lista_mensagens_exibir: [],
    lista_mensagens_exibidas: [],
    qtd_total_mensagens: 0,
    qtd_mensagens_exibidas: 0
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
    data_proximo_dia_mes: null,
    ind_data_dia_hoje: false,
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
    forma_agendamento: '',
}

export const FORMAS_AGENDAMENTO = {
    em_segundo_plano_sistema: 'Em segundo plano pelo sistema, pois notificação foi ignorada.',
    em_segundo_plano_ok: 'Em segundo plano pelo botão OK.',
    ao_abrir_notificacao_com_app_aberto: 'Ao tocar na area da notificação, com o aplicativo aberto.',
    ao_abrir_notificacao: 'Ao iniciar o aplicativo, pela notificação.',
    ao_abrir_aplicativo: 'Ao iniciar o aplicativo. Notificação foi ignorada.',
    ao_abrir_aplicativo_primeira_vez: 'Ao iniciar o aplicativo. Primeira vez.',
    ao_abrir_aplicativo_sem_data_hora: 'Ao iniciar o aplicativo. Não havia data-hora agendada.',
    ao_alterar_agenda: 'Ao alterar agenda.',
    ao_fechar_aplicativo: 'Ao fechar aplicativo, após alterar agenda.',
    ao_fechar_aplicativo_sem_prox_msg: 'Ao fechar aplicativo, após alterar agenda, sem próxima mensagem.',
}
export const DADOS_TELA_CONFIGURACAO = {
    
    dh1: '',
    dh2: '',
    hora_notificacao: '',
    agenda_notificacoes: clonarObjeto(AGENDA),
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
    todos_dias_semana: false,
    todos_dias_fim_semana: false,
    atribuir_padrao: true,
    h1: '',
    m1: '',
    h2: '',
    m2: '',
    num_hora_escolher: 0,
};

export const DADOS_CONTROLE_APP = {
    exibir_mensagem: false,    
    alterou_agenda: false,
    fazendo_requisicao: false,
    salvando_agenda_alterada: false,
    em_edicao_agenda: false,
    app_estava_fechado: false,
    todos_intervalos_selecionados: false,
    config_modal: { DADOS_MENSAGEM_MODAL },
    primeira_vez: false,
    em_segundo_plano: false,
    inicializando: false,
    abrindo_por_notificacao: false,
};

export const DADOS_APP_GERAL = {
    dados_app: {
        dados_mensagens: clonarObjeto(DADOS_MENSAGENS),
        controle_app: DADOS_CONTROLE_APP,
        tela_mensagem: DADOS_TELA_MENSAGEM,
        tela_configuracao: DADOS_TELA_CONFIGURACAO,
        tela_configuracao_modal: DADOS_TELA_CONFIGURACAO_MODAL,
    },
    registros_log: null,
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