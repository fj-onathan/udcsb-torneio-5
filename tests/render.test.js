/* Testes de renderização.
 *
 * Corre o JavaScript do build dentro de um DOM mínimo e de um canvas de Node,
 * desenha todos os cards e verifica a geometria por amostragem de píxeis.
 * É o mais próximo que se consegue de abrir a app no telemóvel sem browser.
 *
 *   npm install && npm test
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { createCanvas, Image, registerFont } = require('canvas');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'index.html');
const OUT = path.join(ROOT, 'tests', 'output');

registerFont(path.join(ROOT, 'src/assets/fonts/BebasNeue-Regular.ttf'), { family: 'BebasEmbed' });

/* ---------- ambiente mínimo ---------- */
const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};

const canvas = createCanvas(1080, 1920);
const stubEl = () => ({
  textContent: '', innerHTML: '', className: '', style: {}, dataset: {},
  appendChild() {}, removeChild() {}, querySelectorAll: () => [], onclick: null,
});
global.document = {
  getElementById: (id) => (id === 'cv' ? canvas : stubEl()),
  querySelectorAll: () => [],
  createElement: (t) => (t === 'canvas' ? createCanvas(160, 160) : stubEl()),
  addEventListener() {},
  readyState: 'complete',
  fonts: { add() {} },
  body: { appendChild() {}, removeChild() {} },
};
global.Image = Image;
global.FontFace = function () { this.load = () => Promise.resolve(this); };
global.window = global;
global.App = { NO_AUTOSTART: true };

/* ---------- carregar a app ---------- */
const html = fs.readFileSync(DIST, 'utf8');
const bundle = html.split('<script>')[1].split('</script>')[0];
eval(bundle);
const App = global.App;

/* ---------- utilitários ---------- */
function pixels() {
  const { data, width, height } = App.ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data, width, height, at(x, y) {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  } };
}
function isLight(px) { return px[0] + px[1] + px[2] > 560; }

function contentBounds() {
  const p = pixels();
  let top = -1, bottom = -1;
  for (let y = 0; y < p.height; y++) {
    for (let x = 0; x < p.width; x += 4) {
      if (isLight(p.at(x, y))) { if (top < 0) top = y; bottom = y; break; }
    }
  }
  return { top, bottom };
}

function snapshot(name) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name + '.png'), canvas.toBuffer('image/png'));
}

const results = [];
function test(name, fn) {
  try { fn(); results.push(['ok', name]); }
  catch (e) { results.push(['FALHOU', name + ' — ' + e.message]); }
}

/* ---------- suite ---------- */
(async function () {
  App.cv = canvas;
  App.ctx = canvas.getContext('2d');
  for (const key of Object.keys(App.LOGOS)) {
    const img = new Image();
    img.src = App.LOGOS[key].src;
    App.images[key] = img;
  }

  const S = App.state;

  /* Torneio simulado. Chamado antes de cada bloco de testes, porque alguns
     mexem no estado de propósito (persistência, dados corrompidos). */
  function seed() {
    S.results = [[3, 1], [2, 0], [2, 2], [1, 1], [1, 2], [0, 3]];
    S.resultsSun = [[2, 1], [1, 1], [3, 2], [0, 2], [1, 0]];
    S.pens = [null, 'udcsb', null, null, null];
    S.awards.scorers = [
      { n: 'Jonathan Franco', t: 'udcsb', g: 7 },
      { n: 'Rui Alves', t: 'bolhos', g: 5 },
      { n: 'Miguel Santos', t: 'sce', g: 4 },
    ];
    S.awards.defense = [{ t: 'sce', g: 1 }, { t: 'udcsb', g: 3 }, { t: 'bolhos', g: 3 }];
    S.awards.pinga = { c: 'a equipa mais animada', list: [{ t: 'kopkopos' }, { t: 'carm' }, { t: '' }] };
  }
  seed();

  /* --- lógica --- */
  test('classificação ordena por pontos e diferença de golos', () => {
    const a = App.standings('A').map((t) => t.key);
    assert.deepStrictEqual(a, ['bolhos', 'udcsb', 'acg']);
    const b = App.standings('B').map((t) => t.key);
    assert.deepStrictEqual(b, ['sce', 'kopkopos', 'carm']);
  });

  test('meias-finais cruzam 1.º de um grupo com 2.º do outro', () => {
    assert.deepStrictEqual(App.sunTeams(0).slice(0, 2), ['bolhos', 'kopkopos']);
    assert.deepStrictEqual(App.sunTeams(1).slice(0, 2), ['sce', 'udcsb']);
  });

  test('empate na meia-final resolve-se pelos penáltis escolhidos', () => {
    assert.strictEqual(App.decide(1, true), 'udcsb');
    assert.strictEqual(App.decide(1, false), 'sce');
  });

  test('pódio sai da final e do jogo do 3.º lugar', () => {
    const p = App.podium();
    assert.strictEqual(p.first, 'bolhos');
    assert.strictEqual(p.second, 'udcsb');
    assert.strictEqual(p.third, 'sce');
  });

  test('golos sofridos contam os dois lados de cada jogo', () => {
    const ga = App.goalsAgainst();
    assert.strictEqual(ga.sce, 1);
    assert.strictEqual(ga.acg, 5);
  });

  test('sem resultados não há apuramentos', () => {
    const keep = S.results;
    S.results = [null, null, null, null, null, null];
    assert.strictEqual(App.sunTeams(0)[0], null);
    assert.strictEqual(App.podium().first, null);
    S.results = keep;
  });

  /* --- persistência --- */
  test('estado sobrevive a uma recarga', () => {
    App.save();
    const before = JSON.stringify(App.state.results);
    App.state.results = [null, null, null, null, null, null];
    App.load();
    assert.strictEqual(JSON.stringify(App.state.results), before);
  });

  test('estado corrompido é saneado sem rebentar', () => {
    /* deixa o armazenamento sujo de propósito; o seed() a seguir repõe tudo */
    store.udcsb_torneio_v1 = JSON.stringify({
      results: 'lixo',
      pens: ['equipa_inexistente', null, null, null, null],
      awards: { scorers: [{ n: 5, t: 'xpto', g: 'abc' }, {}, {}] },
    });
    App.load();
    assert.strictEqual(App.state.pens[0], null);
    assert.strictEqual(App.state.awards.scorers[0].t, 'udcsb');
    assert.strictEqual(App.state.awards.scorers[0].g, 0);
  });

  /* --- desenho --- */
  seed();
  App.save();

  const views = [
    ['result', () => { S.day = 'sat'; S.match = 0; }, 'resultado_sabado'],
    ['result', () => { S.day = 'sun'; S.matchSun = 4; }, 'resultado_final'],
    ['table', () => {}, 'classificacao'],
    ['next', () => { S.fixDay = 'sat'; }, 'jogos_sabado'],
    ['next', () => { S.fixDay = 'sun'; }, 'jogos_domingo'],
    ['champ', () => {}, 'campeao'],
    ['award', () => { S.awardView = 'scorer'; }, 'premio_marcador'],
    ['award', () => { S.awardView = 'defense'; }, 'premio_defesa'],
    ['award', () => { S.awardView = 'pinga'; }, 'premio_pinga'],
  ];

  views.forEach(([view, setup, name]) => {
    test('story desenha e cabe no formato: ' + name, () => {
      S.view = view;
      setup();
      App.render();
      assert.strictEqual(canvas.height, 1920, 'altura de story');
      const b = contentBounds();
      assert.ok(b.top > 60 && b.top < 300, 'conteúdo começa dentro da margem (' + b.top + ')');
      assert.ok(b.bottom < 1870, 'conteúdo não encosta ao fundo (' + b.bottom + ')');
      snapshot(name);
    });
  });

  test('carrossel usa 1080x1350 nos seis slides', () => {
    S.view = 'carousel';
    for (let i = 0; i < App.SLIDES.length; i++) {
      S.slide = i;
      App.render();
      assert.strictEqual(canvas.height, 1350, 'slide ' + (i + 1));
      const b = contentBounds();
      assert.ok(b.bottom < 1340, 'slide ' + (i + 1) + ' não transborda');
      snapshot('slide_' + (i + 1));
    }
  });

  test('voltar do carrossel repõe a altura de story', () => {
    S.view = 'champ';
    App.render();
    assert.strictEqual(canvas.height, 1920);
  });

  test('nomes dos ficheiros mudam com a vista', () => {
    S.view = 'table';
    assert.strictEqual(App.filename(), 'classificacao_grupos.png');
    S.view = 'result'; S.day = 'sat'; S.match = 2;
    assert.strictEqual(App.filename(), 'resultado_sab_17h00.png');
  });

  /* --- relatório --- */
  const failed = results.filter((r) => r[0] !== 'ok');
  results.forEach((r) => console.log((r[0] === 'ok' ? '  ✓ ' : '  ✗ ') + r[1]));
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' testes passaram');
  console.log('Imagens em tests/output/');
  process.exit(failed.length ? 1 : 0);
}());
