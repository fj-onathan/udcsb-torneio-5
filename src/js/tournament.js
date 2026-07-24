/* Lógica do torneio: classificação, apuramentos e pódio.

   Nada aqui desenha; todas as funções são puras em relação ao estado, o que as
   torna fáceis de testar. */
(function (App) {
  'use strict';

  /* Classificação de um grupo, só com os jogos já introduzidos.
     Critérios: pontos, diferença de golos, golos marcados, confronto direto. */
  App.standings = function (g) {
    var s = App.state, rows = {};
    App.GROUPS[g].forEach(function (k) {
      rows[k] = { key: k, J: 0, V: 0, E: 0, D: 0, GM: 0, GS: 0, P: 0 };
    });
    App.MATCHES.forEach(function (m, i) {
      if (m[3] !== g) return;
      var r = s.results[i];
      if (!r) return;
      var A = rows[m[1]], B = rows[m[2]];
      A.J++; B.J++;
      A.GM += r[0]; A.GS += r[1];
      B.GM += r[1]; B.GS += r[0];
      if (r[0] > r[1]) { A.V++; B.D++; A.P += 3; }
      else if (r[0] < r[1]) { B.V++; A.D++; B.P += 3; }
      else { A.E++; B.E++; A.P++; B.P++; }
    });
    var list = Object.keys(rows).map(function (k) { return rows[k]; });
    list.forEach(function (t) { t.DG = t.GM - t.GS; });
    list.sort(function (a, b) {
      if (b.P !== a.P) return b.P - a.P;
      if (b.DG !== a.DG) return b.DG - a.DG;
      if (b.GM !== a.GM) return b.GM - a.GM;
      var h = App.headToHead(a.key, b.key);
      if (h !== 0) return h;
      return App.TEAMS[a.key].name.localeCompare(App.TEAMS[b.key].name);
    });
    return list;
  };

  App.headToHead = function (k1, k2) {
    var s = App.state;
    for (var i = 0; i < App.MATCHES.length; i++) {
      var m = App.MATCHES[i], r = s.results[i];
      if (!r) continue;
      if (m[1] === k1 && m[2] === k2) return r[1] - r[0];
      if (m[1] === k2 && m[2] === k1) return r[0] - r[1];
    }
    return 0;
  };

  App.allPlayed = function () {
    return App.state.results.every(function (r) { return r !== null; });
  };

  /* Equipas de cada jogo de domingo: [chaveA, chaveB, rótuloA, rótuloB].
     As chaves ficam a null enquanto o apuramento não estiver decidido. */
  App.sunTeams = function (i) {
    var A = App.standings('A'), B = App.standings('B'), ok = App.allPlayed();
    if (i === 0) return [ok ? A[0].key : null, ok ? B[1].key : null, '1.º GRUPO A', '2.º GRUPO B'];
    if (i === 1) return [ok ? B[0].key : null, ok ? A[1].key : null, '1.º GRUPO B', '2.º GRUPO A'];
    if (i === 2) return [ok ? A[2].key : null, ok ? B[2].key : null, '3.º GRUPO A', '3.º GRUPO B'];
    if (i === 3) return [App.decide(0, false), App.decide(1, false), 'PERDEDOR MF1', 'PERDEDOR MF2'];
    return [App.decide(0, true), App.decide(1, true), 'VENCEDOR MF1', 'VENCEDOR MF2'];
  };

  /* Vencedor (ou perdedor) de um jogo de domingo. Empate exige escolha manual
     de quem passou nos penáltis. */
  App.decide = function (i, wantWinner) {
    var s = App.state, r = s.resultsSun[i], t = App.sunTeams(i);
    if (!r || !t[0] || !t[1]) return null;
    if (r[0] === r[1]) {
      var w = s.pens[i];
      if (!w) return null;
      return wantWinner ? w : (w === t[0] ? t[1] : t[0]);
    }
    return ((r[0] > r[1]) === wantWinner) ? t[0] : t[1];
  };

  App.sunLabel = function (i, side) {
    var t = App.sunTeams(i);
    return t[side] ? App.TEAMS[t[side]].name : t[side + 2];
  };

  App.isDraw = function (i) {
    var r = App.state.resultsSun[i];
    return !!r && r[0] === r[1];
  };

  App.podium = function () {
    return { first: App.decide(4, true), second: App.decide(4, false), third: App.decide(3, true) };
  };

  /* Golos sofridos na fase de grupos — serve para sugerir o prémio de defesa. */
  App.goalsAgainst = function () {
    var s = App.state, ga = {};
    Object.keys(App.TEAMS).forEach(function (k) { ga[k] = 0; });
    App.MATCHES.forEach(function (m, i) {
      var r = s.results[i];
      if (!r) return;
      ga[m[1]] += r[1];
      ga[m[2]] += r[0];
    });
    return ga;
  };

  App.fixtureRows = function (day) {
    if (day === 'sat') {
      return App.MATCHES.map(function (m) {
        return [m[0], 'GRUPO ' + m[3], App.TEAMS[m[1]].name, App.TEAMS[m[2]].name, m[1], m[2], false];
      });
    }
    return App.SUN.map(function (m, i) {
      var t = App.sunTeams(i);
      return [m[0], m[1], App.sunLabel(i, 0), App.sunLabel(i, 1), t[0], t[1], m[1] === 'FINAL'];
    });
  };
}(window.App = window.App || {}));
