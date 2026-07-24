/* Ligação ao DOM: separadores, formulários e descargas.

   Toda a UI é reconstruída a partir do estado em `App.refresh()`, o que evita
   ter de sincronizar ecrã e dados à mão. */
(function (App) {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var VIEWS = ['result', 'table', 'next', 'champ', 'award', 'carousel'];

  /* ---------- helpers ---------- */
  function teamOptions(sel) {
    return Object.keys(App.TEAMS).map(function (k) {
      return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + App.TEAMS[k].name + '</option>';
    }).join('');
  }
  function teamOptionsBlank(sel) {
    return '<option value=""' + (sel ? '' : ' selected') + '>—</option>' + teamOptions(sel);
  }
  function esc(v) { return String(v || '').replace(/"/g, '&quot;'); }

  function curResult() {
    var s = App.state;
    return s.day === 'sat' ? s.results[s.match] : s.resultsSun[s.matchSun];
  }
  function setResult(v) {
    var s = App.state;
    if (s.day === 'sat') s.results[s.match] = v; else s.resultsSun[s.matchSun] = v;
  }
  function curIdx() {
    return App.state.day === 'sat' ? App.state.match : App.state.matchSun;
  }

  /* ---------- construção dos painéis ---------- */
  function buildMatches() {
    var s = App.state, wrap = $('matches');
    wrap.innerHTML = '';
    var list = s.day === 'sat'
      ? App.MATCHES.map(function (m, i) {
          return { i: i, time: m[0], a: App.TEAMS[m[1]].name, b: App.TEAMS[m[2]].name, r: s.results[i] };
        })
      : App.SUN.map(function (m, i) {
          return { i: i, time: m[0], phase: m[1], a: App.sunLabel(i, 0), b: App.sunLabel(i, 1), r: s.resultsSun[i] };
        });

    list.forEach(function (o) {
      var el = document.createElement('div');
      el.className = 'match' + (o.i === curIdx() ? ' on' : '') + (o.r ? ' done' : '');
      el.innerHTML = '<b>' + o.time + '</b>' +
        (o.phase ? '<span class="phase">' + o.phase + '</span>' : '') +
        '<span>' + o.a + '<br>' + o.b + '</span>' +
        (o.r ? '<i>' + o.r[0] + ' – ' + o.r[1] + '</i>' : '');
      el.onclick = function () {
        if (s.day === 'sat') s.match = o.i; else s.matchSun = o.i;
        App.refresh();
      };
      wrap.appendChild(el);
    });
  }

  /* Só aparece quando um jogo a eliminar acaba empatado. */
  function buildPens() {
    var s = App.state, box = $('pens'), btns = $('pensBtns'), i = s.matchSun;
    var t = s.day === 'sun' ? App.sunTeams(i) : [null, null];
    var show = s.day === 'sun' && App.isDraw(i) && t[0] && t[1];
    box.className = show ? '' : 'hide';
    if (!show) return;
    btns.innerHTML = '';
    [t[0], t[1]].forEach(function (k) {
      var b = document.createElement('button');
      b.className = 'btn ' + (s.pens[i] === k ? 'primary' : 'ghost');
      b.textContent = App.TEAMS[k].name;
      b.onclick = function () {
        s.pens[i] = (s.pens[i] === k) ? null : k;
        App.refresh();
      };
      btns.appendChild(b);
    });
  }

  function buildTables() {
    ['A', 'B'].forEach(function (g) {
      var h = '<table class="mini"><tr><th class="nm">Equipa</th><th>J</th><th>V</th>' +
              '<th>E</th><th>D</th><th>DG</th><th>P</th></tr>';
      App.standings(g).forEach(function (t) {
        h += '<tr><td class="nm">' + App.TEAMS[t.key].name + '</td><td>' + t.J + '</td><td>' + t.V +
             '</td><td>' + t.E + '</td><td>' + t.D + '</td><td>' + (t.DG > 0 ? '+' : '') + t.DG +
             '</td><td class="pts">' + t.P + '</td></tr>';
      });
      $('tbl' + g).innerHTML = h + '</table>';
    });
    $('tblWarn').innerHTML = App.allPlayed() ? '' :
      '<div class="warn">Faltam resultados: a classificação só fica definitiva com os seis jogos preenchidos.</div>';
  }

  function buildFixtures() {
    var s = App.state;
    $('fixHint').textContent = s.fixDay === 'sat'
      ? 'Lista dos seis jogos da fase de grupos, para publicar sábado de manhã.'
      : 'As equipas aparecem assim que os seis jogos de sábado estiverem preenchidos. Os jogos das 18h e 19h dependem das meias-finais.';
    var h = '<table class="mini">';
    App.fixtureRows(s.fixDay).forEach(function (r, i) {
      var sr = s.fixDay === 'sun' ? s.resultsSun[i] : s.results[i];
      h += '<tr><td class="nm">' + r[0] + ' · ' + r[1] + '</td><td class="nm">' + r[2] + ' × ' + r[3] +
           (sr ? ' <b class="pts">' + sr[0] + '–' + sr[1] + '</b>' : '') + '</td></tr>';
    });
    $('fixList').innerHTML = h + '</table>';
  }

  function buildChamp() {
    var p = App.podium();
    var nm = function (k) { return k ? App.TEAMS[k].name : '—'; };
    $('champList').innerHTML =
      '<table class="mini"><tr><td class="nm">1.º</td><td class="nm pts">' + nm(p.first) + '</td></tr>' +
      '<tr><td class="nm">2.º</td><td class="nm">' + nm(p.second) + '</td></tr>' +
      '<tr><td class="nm">3.º</td><td class="nm">' + nm(p.third) + '</td></tr></table>';
  }

  function buildAwards() {
    var a = App.state.awards, v = App.state.awardView, box = $('awardForm'), h = '';

    if (v === 'scorer') {
      a.scorers.forEach(function (p, i) {
        h += '<div class="fld"><span class="pos">' + (i + 1) + '.º</span>' +
             '<input type="text" placeholder="Nome do jogador" data-sc="' + i + '" data-f="n" value="' + esc(p.n) + '">' +
             '<select data-sc="' + i + '" data-f="t">' + teamOptions(p.t) + '</select>' +
             '<input type="number" min="0" max="99" data-sc="' + i + '" data-f="g" value="' + p.g + '"></div>';
      });
      h += '<div class="hint">O 2.º e o 3.º só aparecem no card se tiverem nome preenchido.</div>';
    } else if (v === 'defense') {
      a.defense.forEach(function (p, i) {
        h += '<div class="fld"><span class="pos">' + (i + 1) + '.º</span>' +
             '<select data-df="' + i + '" data-f="t">' +
             (i === 0 ? teamOptions(p.t) : teamOptionsBlank(p.t)) + '</select>' +
             '<input type="number" min="0" max="99" data-df="' + i + '" data-f="g" value="' + p.g + '"></div>';
      });
      h += '<button class="btn ghost" id="autoDef">Sugerir pódio a partir dos grupos</button>' +
           '<div class="hint">Golos sofridos na fase de grupos. Podes editar à mão para incluir domingo.</div>';
    } else {
      a.pinga.list.forEach(function (p, i) {
        h += '<div class="fld"><span class="pos">' + (i + 1) + '.º</span>' +
             '<select data-pg="' + i + '">' +
             (i === 0 ? teamOptions(p.t) : teamOptionsBlank(p.t)) + '</select></div>';
      });
      h += '<div class="fld"><input type="text" placeholder="Legenda" data-cap="1" value="' + esc(a.pinga.c) + '"></div>';
    }
    box.innerHTML = h;

    function bind(sel, fn) {
      Array.prototype.forEach.call(box.querySelectorAll(sel), function (el) {
        el.oninput = function () { fn(el); App.render(); };
        el.onchange = el.oninput;
      });
    }
    bind('[data-sc]', function (el) {
      var i = +el.dataset.sc, f = el.dataset.f;
      a.scorers[i][f] = (f === 'g') ? Math.max(0, Math.min(99, +el.value || 0)) : el.value;
    });
    bind('[data-df]', function (el) {
      var i = +el.dataset.df, f = el.dataset.f;
      a.defense[i][f] = (f === 'g') ? Math.max(0, Math.min(99, +el.value || 0)) : el.value;
    });
    bind('[data-pg]', function (el) { a.pinga.list[+el.dataset.pg].t = el.value; });
    bind('[data-cap]', function (el) { a.pinga.c = el.value; });

    var auto = $('autoDef');
    if (auto) {
      auto.onclick = function () {
        var ga = App.goalsAgainst();
        var order = Object.keys(ga).sort(function (x, y) { return ga[x] - ga[y]; }).slice(0, 3);
        a.defense = order.map(function (k) { return { t: k, g: ga[k] }; });
        buildAwards();
        App.render();
      };
    }
  }

  function buildSlides() {
    var wrap = $('slideTabs');
    wrap.innerHTML = '';
    App.SLIDES.forEach(function (nm, i) {
      var b = document.createElement('button');
      b.className = i === App.state.slide ? 'on' : '';
      b.textContent = (i + 1) + '. ' + nm;
      b.onclick = function () { App.state.slide = i; App.refresh(); };
      wrap.appendChild(b);
    });
  }

  /* ---------- vista ativa ---------- */
  App.applyView = function () {
    var s = App.state;
    function mark(sel, attr, val) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (x) {
        x.className = x.dataset[attr] === val ? 'on' : '';
      });
    }
    mark('.tabs button[data-view]', 'view', s.view);
    mark('#days button', 'day', s.day);
    mark('#fixDays button', 'fix', s.fixDay);
    mark('#awardTabs button', 'aw', s.awardView);
    VIEWS.forEach(function (v) {
      $('panel-' + v).className = s.view === v ? '' : 'hide';
    });
  };

  App.refresh = function () {
    var s = App.state;
    buildMatches();
    buildPens();
    buildTables();
    buildFixtures();
    buildChamp();
    buildAwards();
    buildSlides();

    var na, nb;
    if (s.day === 'sat') {
      var m = App.MATCHES[s.match];
      na = App.TEAMS[m[1]].name;
      nb = App.TEAMS[m[2]].name;
    } else {
      na = App.sunLabel(s.matchSun, 0);
      nb = App.sunLabel(s.matchSun, 1);
    }
    var r = curResult();
    $('n0').textContent = na;
    $('n1').textContent = nb;
    $('v0').textContent = r ? r[0] : 0;
    $('v1').textContent = r ? r[1] : 0;

    App.render();
  };

  /* ---------- descargas ---------- */
  function saveCanvas(name) {
    App.cv.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }, 'image/png');
  }

  /* ---------- eventos ---------- */
  App.bindUI = function () {
    var s = App.state;

    Array.prototype.forEach.call(document.querySelectorAll('.tabs button[data-view]'), function (b) {
      b.onclick = function () { s.view = b.dataset.view; App.applyView(); App.refresh(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#days button'), function (b) {
      b.onclick = function () { s.day = b.dataset.day; s.view = 'result'; App.applyView(); App.refresh(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#fixDays button'), function (b) {
      b.onclick = function () { s.fixDay = b.dataset.fix; App.applyView(); App.refresh(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('#awardTabs button'), function (b) {
      b.onclick = function () { s.awardView = b.dataset.aw; App.applyView(); App.refresh(); };
    });

    Array.prototype.forEach.call(document.querySelectorAll('.stepper button'), function (btn) {
      btn.onclick = function () {
        var side = +btn.dataset.side, delta = +btn.dataset.delta;
        var cur = curResult() || [0, 0];
        cur[side] = Math.max(0, Math.min(99, cur[side] + delta));
        setResult(cur);
        App.refresh();
      };
    });

    $('clear').onclick = function () {
      setResult(null);
      if (s.day === 'sun') s.pens[s.matchSun] = null;
      App.refresh();
    };

    $('dl').onclick = function () { saveCanvas(App.filename()); };

    $('dlAll').onclick = function () {
      var keep = s.slide, i = 0;
      (function next() {
        if (i >= App.SLIDES.length) { s.slide = keep; App.refresh(); return; }
        s.slide = i;
        App.render();
        saveCanvas(App.slideFilename(i));
        i++;
        /* Os browsers bloqueiam descargas em catadupa; 700ms chega. */
        setTimeout(next, 700);
      }());
    };

    $('wipe').onclick = function () {
      if (!window.confirm('Apagar todos os resultados e prémios guardados?')) return;
      App.wipe();
      location.reload();
    };

    App.onStoreError = function () {
      $('saveState').textContent =
        'Não foi possível guardar neste browser (modo privado?). Não feches a página.';
    };
  };
}(window.App = window.App || {}));
