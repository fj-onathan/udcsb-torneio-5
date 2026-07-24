/* Stories de campeão e de prémios.

   Os três prémios partilham o mesmo desenho: bloco de título, emblema grande com
   nome e legenda, e um bloco de pódio opcional com o 2.º e o 3.º. Quando não há
   pódio, o bloco principal cresce para ocupar o espaço. */
(function (App) {
  'use strict';

  var G = App.G, C = App.C;

  function podiumBlock(rows, y, h) {
    var c = App.ctx;
    App.block(G.MARGIN, y, G.BW, h, C.CREAM);
    App.blockHeader(G.MARGIN, y, G.BW, h, 72);
    App.text(G.W / 2, y + 38, 'PÓDIO', 44, C.YELLOW, 10);
    rows.forEach(function (row, i) {
      var cy = y + 72 + 49 + i * 98;
      App.text(G.MARGIN + 66, cy, row.pos, 44, '#9aa3b5', 0);
      if (row.key) App.disc(row.key, G.MARGIN + 168, cy, 72);
      App.textAt(G.MARGIN + 220, cy, row.name,
                 App.fit(row.name, 44, row.extra ? 460 : 700, 1), C.NAVY, 1);
      if (row.extra) {
        App.text(G.MARGIN + G.BW - 110, cy, row.extra, App.fit(row.extra, 38, 210, 2), C.MUTED, 2);
      }
    });
    void c;
  }

  /* Card genérico: título, destaque e pódio opcional. */
  function bigCard(title, crest, main, line, rows) {
    App.block(G.MARGIN, 400, G.BW, 140, C.YELLOW);
    App.text(G.W / 2, 472, title, App.fit(title, 90, G.BW - 100, 10), C.NAVY, 10);

    var hasRows = rows && rows.length;
    var HM = hasRows ? 500 : 788;
    App.block(G.MARGIN, 560, G.BW, HM, C.CREAM);

    var dia = hasRows ? 290 : 340;
    var cyd = 560 + (hasRows ? 210 : 270);
    App.discOrBlank(crest, G.W / 2, cyd, dia);
    App.text(G.W / 2, cyd + dia / 2 + 60, main, App.fit(main, 72, G.BW - 120, 2), C.NAVY, 2);
    if (line) {
      App.text(G.W / 2, cyd + dia / 2 + 114, line, App.fit(line, 34, G.BW - 140, 4), C.MUTED, 4);
    }

    if (hasRows) podiumBlock(rows, 1080, 268);

    var y = 1368;
    App.sepChecker(y, 96, 48);
    y += 96 + G.GAP;
    return y;
  }

  App.renderChampion = function () {
    App.drawBackground();
    App.header('FINAL · ' + App.EVENT.daySun);

    var p = App.podium(), r = App.state.resultsSun[4];
    var line = '';
    if (r) {
      line = 'FINAL: ' + r[0] + ' – ' + r[1] +
             ((r[0] === r[1] && App.state.pens[4]) ? '  (NOS PENÁLTIS)' : '');
    }
    var rows = [
      { pos: '2.º', key: p.second, name: p.second ? App.TEAMS[p.second].name : 'POR DECIDIR', extra: '' },
      { pos: '3.º', key: p.third, name: p.third ? App.TEAMS[p.third].name : 'POR DECIDIR', extra: '' },
    ];

    var y = bigCard('CAMPEÃO', p.first, p.first ? App.TEAMS[p.first].name : 'AINDA POR DECIDIR', line, rows);
    App.infoRow(y, 170, App.EVENT.org[0], App.EVENT.org[1], 'OBRIGADO', 'A TODOS OS CLUBES');
    y += 170 + G.GAP;
    App.footer(y, y + 76 + 62);
  };

  /* Dados do prémio selecionado, já em maiúsculas e com as legendas montadas. */
  App.awardData = function () {
    var a = App.state.awards, v = App.state.awardView;

    if (v === 'scorer') {
      var lead = a.scorers[0];
      return {
        sub: 'PRÉMIO · MELHOR MARCADOR', title: 'MELHOR MARCADOR',
        crest: lead.n ? lead.t : null,
        main: lead.n ? lead.n.toUpperCase() : 'POR DEFINIR',
        line: lead.n ? App.TEAMS[lead.t].name + '  ·  ' + lead.g + (lead.g === 1 ? ' GOLO' : ' GOLOS') : '',
        rows: a.scorers.slice(1).filter(function (p) { return p.n; }).map(function (p, i) {
          return { pos: (i + 2) + '.º', key: p.t, name: p.n.toUpperCase(),
                   extra: p.g + (p.g === 1 ? ' GOLO' : ' GOLOS') };
        }),
      };
    }

    if (v === 'defense') {
      var d = a.defense[0];
      return {
        sub: 'PRÉMIO · MELHOR DEFESA', title: 'MELHOR DEFESA',
        crest: d.t || null,
        main: d.t ? App.TEAMS[d.t].name : 'POR DEFINIR',
        line: d.t ? d.g + (d.g === 1 ? ' GOLO SOFRIDO' : ' GOLOS SOFRIDOS') : '',
        rows: a.defense.slice(1).filter(function (p) { return p.t; }).map(function (p, i) {
          return { pos: (i + 2) + '.º', key: p.t, name: App.TEAMS[p.t].name,
                   extra: p.g + ' SOFRIDO' + (p.g === 1 ? '' : 'S') };
        }),
      };
    }

    var lead2 = a.pinga.list[0];
    return {
      sub: 'PRÉMIO · TAÇA DA PINGA', title: 'TAÇA DA PINGA',
      crest: lead2.t || null,
      main: lead2.t ? App.TEAMS[lead2.t].name : 'POR DEFINIR',
      line: (a.pinga.c || '').toUpperCase(),
      rows: a.pinga.list.slice(1).filter(function (p) { return p.t; }).map(function (p, i) {
        return { pos: (i + 2) + '.º', key: p.t, name: App.TEAMS[p.t].name, extra: '' };
      }),
    };
  };

  App.renderAward = function () {
    var d = App.awardData();
    App.drawBackground();
    App.header(d.sub);
    var y = bigCard(d.title, d.crest, d.main, d.line, d.rows);
    App.infoRow(y, 170, App.EVENT.org[0], App.EVENT.org[1], 'DOMINGO', '26 DE JULHO');
    y += 170 + G.GAP;
    App.footer(y, y + 76 + 62);
  };

  App.bigCard = bigCard;
  App.podiumBlock = podiumBlock;
}(window.App = window.App || {}));
