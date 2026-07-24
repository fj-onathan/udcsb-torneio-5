/* Carrossel final, em 1080x1350 (4:5).

   Mesmo sistema visual das stories, com cabeçalho, separador e rodapé encolhidos
   para o formato mais baixo. */
(function (App) {
  'use strict';

  var G = App.G, C = App.C;

  function slideHeader(sub) {
    var meta = App.LOGOS.udcsb, ch = 104, cw = meta.w * ch / meta.h;
    App.ctx.drawImage(App.images.udcsb, G.W / 2 - cw / 2, 64, cw, ch);
    App.text(G.W / 2, 210, App.EVENT.title, 32, C.WHITE, 3);
    App.text(G.W / 2, 252, sub, 30, C.YELLOW, 6);
  }

  function slideTitle(t) {
    App.block(G.MARGIN, 300, G.BW, 118, C.YELLOW);
    App.text(G.W / 2, 361, t, App.fit(t, 78, G.BW - 100, 8), C.NAVY, 8);
  }

  function slideFooter() {
    App.sepChecker(1078, 76, 38);
    App.block(G.MARGIN, 1174, G.BW, 100, C.AZURE);
    var line = App.EVENT.dates + ' · ' + App.EVENT.venue;
    App.text(G.W / 2, 1224, line, App.fit(line, 44, G.BW - 60, 3), C.WHITE, 3);
    App.text(G.W / 2, 1312, App.EVENT.handle, 30, C.HANDLE, 8);
  }

  /* Slide 1: as seis equipas, agrupadas — o mesmo padrão da classificação. */
  function slideTeams() {
    var c = App.ctx;
    slideHeader(App.EVENT.edition + ' · ' + App.EVENT.dates.replace('E', 'E') + ' DE JULHO');
    slideTitle('AS EQUIPAS');
    ['A', 'B'].forEach(function (g, gi) {
      var y = 438 + gi * 320, BH = 300;
      App.block(G.MARGIN, y, G.BW, BH, C.CREAM);
      App.blockHeader(G.MARGIN, y, G.BW, BH, 62);
      App.text(G.W / 2, y + 33, 'GRUPO ' + g, 38, C.YELLOW, 10);
      App.GROUPS[g].forEach(function (k, i) {
        var cy = y + 62 + 40 + i * 79;
        if (i % 2 === 1) {
          c.save();
          c.globalAlpha = 0.05;
          c.fillStyle = C.NAVY;
          c.fillRect(G.MARGIN + 6, cy - 39, G.BW - 12, 78);
          c.restore();
        }
        App.disc(k, G.MARGIN + 96, cy, 62);
        var nm = App.TEAMS[k].name;
        App.textAt(G.MARGIN + 150, cy, nm, App.fit(nm, 42, 720, 1), C.NAVY, 1);
      });
    });
    slideFooter();
  }

  /* Slides 2 a 5: campeão e prémios, com pódio opcional. */
  function slideAward(title, crest, main, line, rows) {
    var c = App.ctx;
    slideTitle(title);
    var hasRows = rows && rows.length;
    var HM = hasRows ? 370 : 620;
    App.block(G.MARGIN, 438, G.BW, HM, C.CREAM);

    var dia = hasRows ? 200 : 280;
    var cyd = 438 + (hasRows ? 130 : 190);
    App.discOrBlank(crest, G.W / 2, cyd, dia);
    App.text(G.W / 2, cyd + dia / 2 + 66, main, App.fit(main, 62, G.BW - 120, 2), C.NAVY, 2);
    if (line) {
      App.text(G.W / 2, cyd + dia / 2 + 122, line, App.fit(line, 32, G.BW - 140, 4), C.MUTED, 4);
    }

    if (hasRows) {
      var YP = 828, HP = 230;
      App.block(G.MARGIN, YP, G.BW, HP, C.CREAM);
      App.blockHeader(G.MARGIN, YP, G.BW, HP, 60);
      App.text(G.W / 2, YP + 32, 'PÓDIO', 38, C.YELLOW, 10);
      rows.forEach(function (row, i) {
        var cy = YP + 60 + 43 + i * 85;
        App.text(G.MARGIN + 60, cy, row.pos, 38, '#9aa3b5', 0);
        if (row.key) App.disc(row.key, G.MARGIN + 152, cy, 62);
        App.textAt(G.MARGIN + 198, cy, row.name,
                   App.fit(row.name, 38, row.extra ? 440 : 660, 1), C.NAVY, 1);
        if (row.extra) {
          App.text(G.MARGIN + G.BW - 100, cy, row.extra, App.fit(row.extra, 32, 190, 2), C.MUTED, 2);
        }
      });
    }
    void c;
    slideFooter();
  }

  /* Slide 6: agradecimentos. */
  function slideThanks() {
    slideHeader('ATÉ PARA O ANO');
    slideTitle('OBRIGADO');
    App.block(G.MARGIN, 438, G.BW, 620, C.CREAM);
    var t1 = 'A TODAS AS EQUIPAS PRESENTES';
    App.text(G.W / 2, 530, t1, App.fit(t1, 52, G.BW - 120, 2), C.NAVY, 2);
    var body = 'E A TODOS OS QUE PASSARAM PELO CAMPO NESTES DOIS DIAS — ADEPTOS, ' +
               'SIMPATIZANTES E AMIGOS DO CLUBE. SEM VOCÊS NÃO HAVIA TORNEIO.';
    App.wrap(body, 38, G.BW - 160, 2).forEach(function (ln, i) {
      App.text(G.W / 2, 640 + i * 58, ln, 38, '#5b6478', 2);
    });
    App.text(G.W / 2, 1000, 'ATÉ À 6.ª EDIÇÃO', App.fit('ATÉ À 6.ª EDIÇÃO', 46, G.BW - 160, 4), C.AZURE, 4);
    slideFooter();
  }

  App.renderCarousel = function () {
    var s = App.state, i = s.slide;
    App.drawBackground();

    if (i === 0) return slideTeams();
    if (i === 5) return slideThanks();

    if (i === 1) {
      var p = App.podium(), r = s.resultsSun[4];
      var line = r ? 'FINAL: ' + r[0] + ' – ' + r[1] +
                     ((r[0] === r[1] && s.pens[4]) ? '  (NOS PENÁLTIS)' : '') : '';
      var rows = [];
      if (p.second) rows.push({ pos: '2.º', key: p.second, name: App.TEAMS[p.second].name, extra: '' });
      if (p.third) rows.push({ pos: '3.º', key: p.third, name: App.TEAMS[p.third].name, extra: '' });
      slideHeader('O VENCEDOR');
      return slideAward('CAMPEÃO', p.first, p.first ? App.TEAMS[p.first].name : 'POR DEFINIR', line, rows);
    }

    /* Reaproveita awardData() sem perder o prémio que está aberto no formulário. */
    var keep = s.awardView;
    s.awardView = (i === 2) ? 'pinga' : (i === 3) ? 'scorer' : 'defense';
    var d = App.awardData();
    s.awardView = keep;
    slideHeader(d.sub.replace('PRÉMIO · ', ''));
    return slideAward(d.title, d.crest, d.main, d.line, d.rows);
  };
}(window.App = window.App || {}));
