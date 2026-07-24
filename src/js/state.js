/* Estado da aplicação e persistência.

   Tudo o que o utilizador introduz vive aqui e é gravado no localStorage a cada
   alteração, para que um refresh a meio do torneio não perca nada. O carregamento
   valida o que vem do armazenamento: dados corrompidos são descartados campo a
   campo em vez de rebentarem a aplicação. */
(function (App) {
  'use strict';

  var KEY = 'udcsb_torneio_v1';

  App.state = {
    view: 'result',        // result | table | next | champ | award | carousel
    day: 'sat',            // dia em edição no separador de resultados
    fixDay: 'sat',         // dia mostrado no separador de jogos
    awardView: 'scorer',   // scorer | defense | pinga
    match: 0,
    matchSun: 0,
    slide: 0,
    results: [null, null, null, null, null, null],   // sábado: [casa, fora]
    resultsSun: [null, null, null, null, null],      // domingo
    pens: [null, null, null, null, null],            // vencedor por penáltis, se empate
    awards: {
      scorers: [{ n: '', t: 'udcsb', g: 0 }, { n: '', t: 'udcsb', g: 0 }, { n: '', t: 'udcsb', g: 0 }],
      defense: [{ t: 'udcsb', g: 0 }, { t: '', g: 0 }, { t: '', g: 0 }],
      pinga: { c: 'A EQUIPA MAIS ANIMADA', list: [{ t: 'udcsb' }, { t: '' }, { t: '' }] },
    },
  };

  App.storeOk = true;

  App.save = function () {
    if (!App.storeOk) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(App.state));
    } catch (e) {
      App.storeOk = false;
      if (App.onStoreError) App.onStoreError();
    }
  };

  function validTeam(k) {
    return k && Object.prototype.hasOwnProperty.call(App.TEAMS, k) ? k : null;
  }
  function pair(v) {
    return Array.isArray(v) && v.length === 2 && isFinite(v[0]) && isFinite(v[1]) ? [+v[0], +v[1]] : null;
  }
  function len(v, n) { return Array.isArray(v) && v.length === n; }

  App.load = function () {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
    if (!saved || typeof saved !== 'object') return false;

    var s = App.state;
    ['view', 'day', 'fixDay', 'awardView', 'match', 'matchSun', 'slide'].forEach(function (k) {
      if (saved[k] !== undefined && saved[k] !== null) s[k] = saved[k];
    });
    if (len(saved.results, 6)) s.results = saved.results.map(pair);
    if (len(saved.resultsSun, 5)) s.resultsSun = saved.resultsSun.map(pair);
    if (len(saved.pens, 5)) s.pens = saved.pens.map(validTeam);

    var a = saved.awards;
    if (a) {
      if (len(a.scorers, 3)) {
        s.awards.scorers = a.scorers.map(function (p) {
          return { n: String((p && p.n) || ''), t: validTeam(p && p.t) || 'udcsb', g: +((p && p.g)) || 0 };
        });
      }
      if (len(a.defense, 3)) {
        s.awards.defense = a.defense.map(function (p, i) {
          return { t: validTeam(p && p.t) || (i === 0 ? 'udcsb' : ''), g: +((p && p.g)) || 0 };
        });
      }
      if (a.pinga && len(a.pinga.list, 3)) {
        s.awards.pinga = {
          c: String(a.pinga.c || ''),
          list: a.pinga.list.map(function (p, i) {
            return { t: validTeam(p && p.t) || (i === 0 ? 'udcsb' : '') };
          }),
        };
      }
    }
    return true;
  };

  App.wipe = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignorado */ }
  };
}(window.App = window.App || {}));
