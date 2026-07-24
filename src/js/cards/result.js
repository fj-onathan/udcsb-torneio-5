/* Story de resultado de um jogo (sábado ou domingo). */
(function (App) {
  'use strict';

  var G = App.G, C = App.C;

  /* Descreve o jogo selecionado, seja da fase de grupos ou das eliminatórias. */
  App.currentCard = function () {
    var s = App.state;
    if (s.day === 'sat') {
      var m = App.MATCHES[s.match];
      return {
        time: m[0], sub: 'FASE DE GRUPOS · GRUPO ' + m[3],
        a: m[1], b: m[2],
        na: App.TEAMS[m[1]].name, nb: App.TEAMS[m[2]].name,
        score: s.results[s.match], date: App.EVENT.daySat, note: 'RESULTADO FINAL',
      };
    }
    var i = s.matchSun, t = App.sunTeams(i);
    return {
      time: App.SUN[i][0], sub: 'ELIMINATÓRIAS · ' + App.SUN[i][1],
      a: t[0], b: t[1],
      na: App.sunLabel(i, 0), nb: App.sunLabel(i, 1),
      score: s.resultsSun[i], date: App.EVENT.daySun,
      note: (App.isDraw(i) && s.pens[i]) ? 'DECIDIDO NOS PENÁLTIS' : 'RESULTADO FINAL',
    };
  };

  App.renderResult = function () {
    var d = App.currentCard(), g = App.RESULT_GEO, c = App.ctx;

    App.drawBackground();
    App.block(G.MARGIN, g.Y_TIME, G.BW, g.H_TIME, C.YELLOW);
    App.block(G.MARGIN, g.Y_MATCH, G.BW, g.H_MATCH, C.CREAM);
    App.block(G.MARGIN, g.Y_RES, G.BW, g.H_RES, C.NAVY);
    App.sepChecker(g.Y_SEP1, g.H_SEP1, 48);
    App.infoRow(g.Y_ROW, g.H_ROW, d.date, App.EVENT.venue, App.EVENT.bar[0], App.EVENT.bar[1]);
    App.sepStripes(g.Y_SEP2, 76);

    App.header(d.sub);
    App.text(G.W / 2, g.Y_TIME + g.H_TIME / 2 + 4, d.time, 112, C.NAVY, 2);

    var cy = g.Y_MATCH + 250;
    App.discOrBlank(d.a, G.MARGIN + 190, cy, 230);
    App.discOrBlank(d.b, G.MARGIN + G.BW - 190, cy, 230);

    var bw = 116, bh = 150, gap = 16;
    [G.W / 2 - bw / 2 - gap / 2, G.W / 2 + bw / 2 + gap / 2].forEach(function (cxb, i) {
      c.fillStyle = C.NAVY;
      App.roundRect(c, cxb - bw / 2, cy - bh / 2, bw, bh, 16);
      c.fill();
      App.text(cxb, cy + 6, d.score ? String(d.score[i]) : '–', 96,
               d.score ? C.WHITE : '#788cb0', 0);
    });

    [[G.MARGIN + 190, d.na], [G.MARGIN + G.BW - 190, d.nb]].forEach(function (p) {
      App.text(p[0], g.Y_MATCH + 450, p[1], App.fit(p[1], 44, 360, 1), C.NAVY, 1);
    });

    App.text(G.W / 2, g.Y_RES + g.H_RES / 2 + 2, d.note,
             App.fit(d.note, 52, G.BW - 80, 10), C.YELLOW, 10);
    App.text(G.W / 2, 1800, App.EVENT.handle, 36, C.HANDLE, 8);
  };
}(window.App = window.App || {}));
