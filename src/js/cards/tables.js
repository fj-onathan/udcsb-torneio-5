/* Stories de classificação e de lista de jogos. */
(function (App) {
  'use strict';

  var G = App.G, C = App.C;

  /* Tabela de um grupo. Devolve o y onde termina, para encadear blocos. */
  function groupBlock(title, rows, y) {
    var c = App.ctx;
    var H_HEAD = 82, H_COLS = 58, H_ROW = 110;
    var BH = H_HEAD + H_COLS + 3 * H_ROW;

    App.block(G.MARGIN, y, G.BW, BH, C.CREAM);
    App.blockHeader(G.MARGIN, y, G.BW, BH, H_HEAD);
    App.text(G.W / 2, y + H_HEAD / 2 + 2, title, 50, C.YELLOW, 8);

    var cols = [['J', 640], ['V', 700], ['E', 760], ['D', 820], ['DG', 890], ['P', 962]];
    cols.forEach(function (col) {
      App.text(col[1], y + H_HEAD + H_COLS / 2, col[0], 30, C.MUTED, 2);
    });

    rows.forEach(function (t, i) {
      var cy = y + H_HEAD + H_COLS + i * H_ROW + H_ROW / 2;
      if (i % 2 === 1) {
        c.save();
        c.globalAlpha = 0.05;
        c.fillStyle = C.NAVY;
        c.fillRect(G.MARGIN + 6, cy - H_ROW / 2, G.BW - 12, H_ROW);
        c.restore();
      }
      App.text(G.MARGIN + 52, cy, String(i + 1), 44, '#9aa3b5', 0);
      App.disc(t.key, G.MARGIN + 150, cy, 78);
      var nm = App.TEAMS[t.key].name;
      App.textAt(G.MARGIN + 202, cy, nm, App.fit(nm, 42, 360, 1), C.NAVY, 1);
      [t.J, t.V, t.E, t.D].forEach(function (v, j) {
        App.text(cols[j][1], cy, String(v), 40, '#38414f', 0);
      });
      App.text(890, cy, (t.DG > 0 ? '+' : '') + t.DG, 40, '#38414f', 0);
      c.fillStyle = C.YELLOW;
      App.roundRect(c, 962 - 38, cy - 30, 76, 60, 14);
      c.fill();
      App.text(962, cy + 2, String(t.P), 44, C.NAVY, 0);
    });
    return y + BH;
  }

  App.renderStandings = function () {
    App.drawBackground();
    App.header('CLASSIFICAÇÃO · FASE DE GRUPOS');

    var y = groupBlock('GRUPO A', App.standings('A'), 400);
    y = groupBlock('GRUPO B', App.standings('B'), y + G.GAP) + G.GAP;

    App.sepChecker(y, 96, 48);
    y += 96 + G.GAP;

    App.block(G.MARGIN, y, G.BW, 150, C.AZURE);
    App.text(G.W / 2, y + 52, 'AMANHÃ · ' + App.EVENT.daySun, 34, C.MUTED_LIGHT, 3);
    App.text(G.W / 2, y + 108, 'ELIMINATÓRIAS A PARTIR DAS 15H', 46, C.WHITE, 2);
    y += 150 + G.GAP;

    App.footer(y, y + 76 + 62);
  };

  /* Lista de jogos de um dia. A altura das linhas ajusta-se ao número de jogos
     para que os dois dias ocupem a mesma mancha. */
  App.renderFixtures = function (day) {
    var c = App.ctx;
    App.drawBackground();
    App.header(day === 'sat' ? App.EVENT.satHeader : App.EVENT.sunHeader);

    var rows = App.fixtureRows(day);
    var TOP = 410, BOTTOM = 1272, GAP = 14, n = rows.length;
    var HR = (BOTTOM - TOP - (n - 1) * GAP) / n;
    var y = TOP;

    rows.forEach(function (r) {
      var gold = r[6], cy = y + HR / 2;
      App.block(G.MARGIN, y, G.BW, HR, gold ? C.YELLOW : C.CREAM);

      c.fillStyle = gold ? C.NAVY : C.AZURE;
      App.roundRect(c, G.MARGIN + 20, cy - HR / 2 + 18, 142, HR - 36, 16);
      c.fill();
      App.text(G.MARGIN + 91, cy + 2, r[0], 46, C.WHITE, 1);

      App.textAt(G.MARGIN + 186, cy - 28, r[1], 28, gold ? '#6b5a1c' : C.MUTED, 4);

      var x = G.MARGIN + 186, dia = Math.min(56, HR - 76);
      if (r[4]) { App.disc(r[4], x + dia / 2, cy + 26, dia); x += dia + 10; }
      var size = App.fit(r[2], 38, 290, 1);
      App.textAt(x, cy + 26, r[2], size, C.NAVY, 1);
      x += App.textW(r[2], size, 1) + 14;
      App.textAt(x, cy + 26, 'X', 32, '#9aa3b5', 0);
      x += 32;
      if (r[5]) { App.disc(r[5], x + dia / 2, cy + 26, dia); x += dia + 10; }
      App.textAt(x, cy + 26, r[3], App.fit(r[3], 38, 290, 1), C.NAVY, 1);

      y += HR + GAP;
    });

    y = 1292;
    App.sepChecker(y, 96, 48);
    y += 96 + G.GAP;
    App.infoRow(y, 170, day === 'sat' ? App.EVENT.daySat : App.EVENT.daySun,
                App.EVENT.venue, App.EVENT.bar[0], App.EVENT.bar[1]);
    y += 170 + G.GAP;
    App.footer(y, y + 76 + 62);
  };
}(window.App = window.App || {}));
