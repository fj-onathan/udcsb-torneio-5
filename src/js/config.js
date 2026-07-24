/* Configuração do torneio e do sistema visual.
   Alterar aqui é o suficiente para reaproveitar isto noutra edição. */
(function (App) {
  'use strict';

  App.EVENT = {
    title: '5.º TORNEIO DE FUTEBOL 7 INTERASSOCIAÇÕES',
    edition: '5.ª EDIÇÃO',
    venue: 'CAMPO DA UDCSB',
    dates: '25 E 26 JULHO',
    daySat: 'SÁBADO · 25 JULHO',
    daySun: 'DOMINGO · 26 JULHO',
    satHeader: 'FASE DE GRUPOS · SÁBADO 25 JULHO',
    sunHeader: 'ELIMINATÓRIAS · DOMINGO 26 JULHO',
    org: ['5.º TORNEIO', 'INTERASSOCIAÇÕES'],
    handle: '@UDCSBERNARDINO',
    bar: ['BAR ABERTO', 'IMPERIAL + BIFANAS'],
  };

  App.TEAMS = {
    udcsb: { name: 'SÃO BERNARDINO' },
    acg: { name: 'A.C. GERALDES' },
    bolhos: { name: 'BOTAFOGO BÔLHOS' },
    carm: { name: 'CASAIS DO JÚLIO' },
    kopkopos: { name: 'KOPKOPOS' },
    sce: { name: 'S.C. ESTRADA' },
  };

  /* Ordem A1/A2/A3 e B1/B2/B3 conforme a folha do torneio. */
  App.GROUPS = { A: ['udcsb', 'bolhos', 'acg'], B: ['kopkopos', 'sce', 'carm'] };

  /* Sábado: [hora, casa, fora, grupo] */
  App.MATCHES = [
    ['15:00', 'udcsb', 'acg', 'A'],
    ['16:00', 'kopkopos', 'carm', 'B'],
    ['17:00', 'bolhos', 'acg', 'A'],
    ['18:00', 'sce', 'carm', 'B'],
    ['19:00', 'udcsb', 'bolhos', 'A'],
    ['20:00', 'kopkopos', 'sce', 'B'],
  ];

  /* Domingo: [hora, fase]. As equipas saem da classificação e das meias. */
  App.SUN = [
    ['15:00', 'MEIA-FINAL 1'],
    ['16:00', 'MEIA-FINAL 2'],
    ['17:00', '5.º E 6.º LUGAR'],
    ['18:00', '3.º E 4.º LUGAR'],
    ['19:00', 'FINAL'],
  ];

  App.SLIDES = ['Equipas', 'Campeão', 'Taça da Pinga', 'Marcador', 'Defesa', 'Obrigado'];

  /* ---- sistema visual ---- */
  App.C = {
    BLUE: '#0b3a8c',
    BLUE_DARK: 'rgba(6,36,96,0.65)',
    BLUE_LITE: 'rgba(30,92,198,0.65)',
    AZURE: '#2172e0',
    NAVY: '#051636',
    YELLOW: '#f2b818',
    CREAM: '#f7f3e9',
    WHITE: '#ffffff',
    MUTED: '#8b93a6',
    MUTED_LIGHT: '#cde4ff',
    HANDLE: '#bed6fa',
  };

  App.G = {
    W: 1080,
    H_STORY: 1920,
    H_POST: 1350,
    MARGIN: 60,
    RAD: 24,
    SEP_RAD: 22,
    GAP: 20,
    ALPHA: 0.8,          // blocos ligeiramente translúcidos
    FONT: 'BebasEmbed',
  };
  App.G.BW = App.G.W - 2 * App.G.MARGIN;

  /* Geometria do card de resultado (1080x1920). */
  App.RESULT_GEO = (function (G) {
    var g = { Y_TIME: 406, H_TIME: 160, H_MATCH: 560, H_RES: 118, H_SEP1: 96, H_ROW: 190 };
    g.Y_MATCH = g.Y_TIME + g.H_TIME + G.GAP;
    g.Y_RES = g.Y_MATCH + g.H_MATCH + G.GAP;
    g.Y_SEP1 = g.Y_RES + g.H_RES + G.GAP;
    g.Y_ROW = g.Y_SEP1 + g.H_SEP1 + G.GAP;
    g.Y_SEP2 = g.Y_ROW + g.H_ROW + G.GAP;
    return g;
  }(App.G));
}(window.App = window.App || {}));
