/* Xouty · mesas.js — a planta do local e as suas mesas: desenho, preço de cada mesa, quem ocupa e as que estão em espera.
   Um só estoque para o anúncio, os promoters e os concierges (R100–R102). O dono desenha a planta no portal (planta-editor.js);
   este ficheiro guarda o modelo e desenha-a em SVG para o portal e para a página da Mesa VIP. No protótipo vive neste aparelho. */
(function(){
'use strict';
const CONC = {'lara-v':['Lara V.', 'cocktail'], 'ricardo-p':['Ricardo P.', 'pribeira'], 'beatriz-c':['Beatriz C.', 'pfoz']};
const NOITES0 = [{id:'n1', nome:'Noite X', dia:'sex 31 out', ev:'l4', lista:'a', ocup:{A3:'direta', A6:'direta', B1:'promoter', B4:'direta'}},
                {id:'n2', nome:'Lux Sessions', dia:'sáb 1 nov', ev:'l11', lista:'ls', ocup:{A2:'direta', B5:'promoter', B6:'direta'}}];
/* noites publicadas pela casa em evento-novo.html com mesas: entram no mesmo stock, com o preço da noite e só as mesas escolhidas (R100).
   Um evento do catálogo editado pela casa (Noite X, Lux Sessions) só muda os preços e as mesas da sua noite. */
const NOITES = NOITES0.slice();
try {
  const SEM0 = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'], MES0 = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'], hoje0 = new Date().toISOString().slice(0, 10);
  const pub = e => e.estado === 'publicado' || (e.estado === 'agendado' && e.pubEm && new Date(e.pubEm) <= new Date());
  (JSON.parse(localStorage.getItem('streetfy:eventos-casa') || '[]') || []).filter(e => pub(e) && e.mesas && e.mesas.on && e.mesas.sel && Object.keys(e.mesas.sel).length && (!e.casa || e.casa.k === 'lisboa/lux fragil') && e.data && e.data >= hoje0)
    .sort((a, b) => a.data.localeCompare(b.data)).forEach(e => {
      const n0 = NOITES.find(n => n.ev === e.id); if (n0) { n0.precos = e.mesas.sel; n0.so = Object.keys(e.mesas.sel); return; }
      const d = new Date(e.data + 'T12:00');
      NOITES.push({id:'ev-' + e.id, nome:e.titulo, dia:SEM0[d.getDay()] + ' ' + d.getDate() + ' ' + MES0[d.getMonth()], ev:e.id, lista:'ev-' + e.id, ocup:{}, precos:e.mesas.sel, so:Object.keys(e.mesas.sel), data:e.data});
    });
} catch (e) {}
/* mesa que a casa não pôs à venda nessa noite */
const foraDaNoite = (nid, m) => { const n = NOITES.find(x => x.id === nid); return !!(n && n.so && !n.so.includes(m)); };
const HOLD = 30 * 60 * 1000;
const LG = 'streetfy:concierge-ligacao';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* ---------- modelo da planta ----------
   planta = {w, h, zonas:[{id, nome, cor}], el:[{id, t, x, y, w, h, r, nome, zona, forma, lugares, preco, reservavel}]}
   t: mesa (forma redonda | quadrada | retangular | sofa | alta), palco, cabine, pista, bar, area, entrada, wc, escada, coluna, parede, texto */
const PRECOS_PADRAO = {A1:550, A2:600, A3:700, A4:700, A5:600, A6:550, B1:400, B2:450, B3:500, B4:500, B5:450, B6:400};
const TIPOS = {mesa:'Mesa', palco:'Palco', cabine:'Cabine DJ', pista:'Pista', bar:'Bar', area:'Área de zona', entrada:'Entrada', wc:'WC', escada:'Escada', coluna:'Coluna', parede:'Parede', texto:'Texto'};
const FORMAS = {redonda:'Redonda', quadrada:'Quadrada', retangular:'Comprida', sofa:'Sofá · lounge', alta:'Mesa alta'};
let seq = 0;
const novoId = () => 'e' + Date.now().toString(36) + (seq++).toString(36);
function plantaPadrao(){
  const el = [{t:'area', x:40, y:420, w:850, h:150, zona:'B', nome:'Varanda'}, {t:'cabine', x:430, y:24, w:180, h:44, nome:'Cabine DJ'}, {t:'pista', x:180, y:84, w:680, h:170, nome:'Pista'},
    {t:'bar', x:910, y:84, w:90, h:330, nome:'Bar'}, {t:'entrada', x:40, y:596, w:150, h:34, nome:'Entrada'}, {t:'wc', x:900, y:596, w:100, h:34, nome:'WC'}, {t:'coluna', x:150, y:384, w:22, h:22}];
  for (let i = 0; i < 6; i++) el.push({t:'mesa', forma:'redonda', x:70 + i * 140, y:290, w:72, h:72, nome:'A' + (i + 1), zona:'A', lugares:8, preco:PRECOS_PADRAO['A' + (i + 1)], reservavel:true});
  for (let i = 0; i < 6; i++) el.push({t:'mesa', forma:'sofa', x:62 + i * 140, y:462, w:96, h:60, nome:'B' + (i + 1), zona:'B', lugares:8, preco:PRECOS_PADRAO['B' + (i + 1)], reservavel:true});
  return {w:1040, h:650, zonas:[{id:'A', nome:'junto à pista', cor:'#ff2e6e'}, {id:'B', nome:'varanda', cor:'#7a4dd8'}], el:el.map((e, i) => Object.assign({id:'p' + i, r:0}, e))};
}
const LIG_PADRAO = () => ({cfg:{mesas:true, quem:'aprovados', confirma:'aprovar', comissao:8, lista:true, cota:10, maxPedidos:2, planta:plantaPadrao()}, reservas:[
  {id:'r1', conc:'lara-v', cliente:'Aniversário da Joana · 30 anos', pessoas:8, noite:'n1', mesa:'A1', chega:'0h30', nota:'bolo à meia-noite, sem velas na pista', taxa:60, motorista:true, estado:'confirmada', t:Date.now() - 864e5},
  {id:'r2', conc:'beatriz-c', cliente:'Despedida do Miguel', pessoas:7, noite:'n2', mesa:'B2', chega:'1h00', nota:'', taxa:45, motorista:false, estado:'pendente', t:Date.now() - 36e5, pedidos:1},
  {id:'r3', conc:'beatriz-c', cliente:'Equipa da Farfetch', pessoas:8, noite:'n1', mesa:'A5', chega:'0h00', nota:'fatura em nome da empresa', taxa:80, motorista:true, estado:'confirmada', t:Date.now() - 1728e5}]});
const ler = () => { const p = LIG_PADRAO(); try { const g = JSON.parse(localStorage.getItem(LG) || 'null'); if (g && g.cfg && g.reservas) { g.cfg = Object.assign(p.cfg, g.cfg); if (!g.cfg.planta || !g.cfg.planta.el) g.cfg.planta = p.cfg.planta; return g; } } catch (e) {} return p; };
const gravar = lig => { try { localStorage.setItem(LG, JSON.stringify(lig)); } catch (e) {} };
const plantaDe = lig => lig.cfg.planta || plantaPadrao();
const mesasDe = lig => plantaDe(lig).el.filter(e => e.t === 'mesa' && e.reservavel !== false && e.nome);
const mesaDe = (lig, nome) => plantaDe(lig).el.find(e => e.t === 'mesa' && e.nome === nome);
const zonaDe = (lig, nome) => { const m = mesaDe(lig, nome), p = plantaDe(lig); return (m && p.zonas.find(z => z.id === m.zona)) || {id:'', nome:'sem zona', cor:'#888'}; };
const noiteDe = id => NOITES.find(n => n.id === id) || NOITES[0];
const estadoR = r => r.estado === 'segura' && Date.now() > r.t + HOLD ? 'expirou' : r.estado;
const ativa = r => ['segura', 'pendente', 'confirmada'].includes(estadoR(r));
const precoMesa = (lig, m, nid) => { const n = nid ? NOITES.find(x => x.id === nid) : null; if (n && n.precos && n.precos[m] != null) return +n.precos[m]; const e = mesaDe(lig, m); return e && e.preco != null ? +e.preco : +((lig.cfg.precos || {})[m] || PRECOS_PADRAO[m] || 0); };
function ocupacao(lig, nid){
  const n = noiteDe(nid), o = {}, existe = new Set(mesasDe(lig).map(m => m.nome));
  Object.entries(n.ocup).forEach(([m, t]) => { if (existe.has(m)) o[m] = {t}; });
  lig.reservas.filter(r => r.noite === nid && ativa(r)).forEach(r => { o[r.mesa] = {t:'concierge', r}; });
  return o;
}

/* ---------- desenho em SVG ---------- */
const cadeiras = e => {
  if (e.t !== 'mesa' || e.forma === 'sofa' || !e.lugares) return '';
  const n = Math.min(14, e.lugares), cx = e.x + e.w / 2, cy = e.y + e.h / 2, out = [];
  if (e.forma === 'redonda' || e.forma === 'alta') for (let i = 0; i < n; i++) { const a = i / n * 2 * Math.PI - Math.PI / 2; out.push([cx + Math.cos(a) * (e.w / 2 + 9), cy + Math.sin(a) * (e.h / 2 + 9)]); }
  else { const lados = e.forma === 'quadrada' && n <= 4 ? [[0, -1], [1, 0], [0, 1], [-1, 0]].slice(0, n) : null;
    if (lados) lados.forEach(([dx, dy]) => out.push([cx + dx * (e.w / 2 + 9), cy + dy * (e.h / 2 + 9)]));
    else { const cima = Math.ceil(n / 2), baixo = n - cima; for (let i = 0; i < cima; i++) out.push([e.x + (i + .5) * e.w / cima, e.y - 9]); for (let i = 0; i < baixo; i++) out.push([e.x + (i + .5) * e.w / baixo, e.y + e.h + 9]); } }
  return out.map(([x, y]) => '<circle class="pl-cad" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6"/>').join('');
};
function forma(e, cls){
  const {x, y, w, h} = e, c = cls ? ' class="' + cls + '"' : '';
  if (e.t === 'mesa') {
    if (e.forma === 'redonda' || e.forma === 'alta') return '<ellipse' + c + ' cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" rx="' + w / 2 + '" ry="' + h / 2 + '"/>' + (e.forma === 'alta' ? '<ellipse class="pl-alta" cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" rx="' + (w / 2 - 6) + '" ry="' + (h / 2 - 6) + '"/>' : '');
    if (e.forma === 'sofa') return '<rect' + c + ' x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="14"/><path class="pl-enc" d="M' + (x + 6) + ' ' + (y + 9) + 'H' + (x + w - 6) + '"/>';
    return '<rect' + c + ' x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"/>';
  }
  if (e.t === 'coluna') return '<circle class="pl-s pl-coluna" cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" r="' + Math.min(w, h) / 2 + '"/>';
  if (e.t === 'texto') return '<rect class="pl-s pl-texto" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>';
  return '<rect class="pl-s pl-' + e.t + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (e.t === 'parede' ? 2 : e.t === 'pista' ? 18 : 8) + '"/>';
}
const ROT = {palco:'PALCO', cabine:'CABINE DJ', pista:'PISTA', bar:'BAR', entrada:'ENTRADA', wc:'WC', escada:'ESCADA'};
function rotulo(e, p){
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (e.t === 'area') { const z = p.zonas.find(z => z.id === e.zona); return '<text class="pl-area-t" x="' + (e.x + 12) + '" y="' + (e.y + 20) + '" fill="' + esc(z ? z.cor : '#888') + '">' + esc(((z ? 'Zona ' + z.id + ' · ' : '') + (e.nome || (z ? z.nome : ''))).toUpperCase()) + '</text>'; }
  if (e.t === 'coluna' || e.t === 'parede') return '';
  const t = e.t === 'texto' ? (e.nome || 'Texto') : (e.nome && e.nome !== TIPOS[e.t] ? e.nome.toUpperCase() : ROT[e.t] || '');
  return t ? '<text class="pl-st pl-st-' + e.t + '" x="' + cx + '" y="' + cy + '" dominant-baseline="central" text-anchor="middle">' + esc(t) + '</text>' : '';
}
const rodar = (e, s) => e.r ? '<g transform="rotate(' + e.r + ' ' + (e.x + e.w / 2) + ' ' + (e.y + e.h / 2) + ')">' + s + '</g>' : s;
const DEFS = '<defs><pattern id="pl-xadrez" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#f3f0f6"/><rect width="10" height="10" fill="#e8e3ee"/><rect x="10" y="10" width="10" height="10" fill="#e8e3ee"/></pattern>'
  + '<pattern id="pl-degraus" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#ececec"/><rect width="12" height="4" fill="#cfcfcf"/></pattern></defs>';
/* estado(nome) → {cls, sub, titulo, clicavel, sel, fim}; attr = atributo que leva o nome da mesa clicável */
function desenhaPlanta(lig, estado, attr, extra){
  const p = plantaDe(lig), ordem = p.el.slice().sort((a, b) => (a.t === 'area' ? 0 : 1) - (b.t === 'area' ? 0 : 1));
  return '<svg class="pl-svg" viewBox="0 0 ' + p.w + ' ' + p.h + '" role="group" aria-label="Planta do local">' + DEFS + '<rect class="pl-chao" width="' + p.w + '" height="' + p.h + '" rx="16"/>'
    + ordem.map(e => {
      if (e.t === 'area') { const z = p.zonas.find(z => z.id === e.zona), cor = z ? z.cor : '#999'; return rodar(e, '<rect class="pl-area" x="' + e.x + '" y="' + e.y + '" width="' + e.w + '" height="' + e.h + '" rx="14" fill="' + esc(cor) + '" stroke="' + esc(cor) + '"/>') + rotulo(e, p); }
      if (e.t !== 'mesa' || e.reservavel === false || !e.nome) return rodar(e, cadeiras(e) + forma(e)) + rotulo(e, p);
      const s = estado ? estado(e.nome, e) : {cls:'livre', sub:'€' + (e.preco || 0)}, cx = e.x + e.w / 2, cy = e.y + e.h / 2;
      const ab = s.clicavel ? ' ' + attr + '="' + esc(e.nome) + '" role="button" tabindex="0" aria-pressed="' + !!s.sel + '"' : '';
      return '<g class="pl-m ' + (s.cls || '') + (s.sel ? ' sel' : '') + (s.clicavel ? ' clic' : '') + '"' + ab + ' aria-label="' + esc(s.titulo || e.nome) + '"><title>' + esc(s.titulo || e.nome) + '</title>'
        + rodar(e, cadeiras(e) + forma(e, 'pl-f')) + '<text class="pl-n" x="' + cx + '" y="' + (cy - (s.sub ? 7 : 0)) + '" dominant-baseline="central" text-anchor="middle">' + esc(e.nome) + '</text>'
        + (s.sub ? '<text class="pl-sub" x="' + cx + '" y="' + (cy + 10) + '" dominant-baseline="central" text-anchor="middle">' + esc(s.sub) + '</text>' : '')
        + (s.fim ? '<text class="pl-crono" data-fim="' + s.fim + '" x="' + cx + '" y="' + (e.y + e.h + 22) + '" text-anchor="middle">' + mmss(s.fim - Date.now()) + '</text>' : '') + '</g>';
    }).join('') + (extra || '') + '</svg>';
}
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
/* legenda e lista de zonas para por baixo da planta */
const legenda = itens => '<p class="lg-leg">' + itens.map(([c, t]) => '<span class="' + c + '">' + t + '</span>').join('') + '</p>';
/* Enter e espaço numa mesa clicável fazem o mesmo que o clique */
document.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('g.pl-m.clic')) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent('click', {bubbles:true})); } });
/* cronómetros de todas as plantas na página */
setInterval(() => document.querySelectorAll('.pl-crono[data-fim]').forEach(t => { const r = +t.dataset.fim - Date.now(); t.textContent = mmss(r); if (r <= 0) document.dispatchEvent(new CustomEvent('streetfy-planta-expirou')); }), 1000);

window.STREETFY_MESAS = {CONC, NOITES, NOITES0, foraDaNoite, HOLD, LG, PRECOS_PADRAO, TIPOS, FORMAS, LIG_PADRAO, plantaPadrao, novoId, ler, gravar, plantaDe, mesasDe, mesaDe, zonaDe, noiteDe, estadoR, ativa, precoMesa, ocupacao, desenhaPlanta, forma, cadeiras, rotulo, rodar, DEFS, legenda, mmss, esc};

/* ---------- página pública da Mesa VIP: a planta do dono, preço por mesa e cronómetro nas mesas em espera ---------- */
const el = document.querySelector('[data-mesas]'); if (!el) return;
const bx = document.querySelector('.book'), proxy = document.getElementById('mesa-proxy');
let lig = ler(), noite = 'n1', mesa = '';
function escolheLivre(){ const o = ocupacao(lig, noite), ms = mesasDe(lig); if (!mesa || o[mesa] || foraDaNoite(noite, mesa) || !ms.some(m => m.nome === mesa)) mesa = (ms.find(m => !o[m.nome] && !foraDaNoite(noite, m.nome)) || {}).nome || ''; }
function aplicaCaixa(){
  const z = mesa ? zonaDe(lig, mesa) : null, m = mesa ? mesaDe(lig, mesa) : null;
  const i = bx && bx.querySelector('#mesa-esc'); if (i) i.textContent = mesa ? 'mesa ' + mesa + ' · ' + z.nome + (m && m.lugares ? ' · até ' + m.lugares : '') + ' · garantida' : 'sem mesas livres nesta noite';
  if (proxy && mesa) { proxy.dataset.price = precoMesa(lig, mesa, noite); proxy.click(); }
  const b = bx && bx.querySelector('.pr b'); if (b && mesa) b.textContent = '€' + precoMesa(lig, mesa, noite);
}
function desenha(){
  escolheLivre();
  const o = ocupacao(lig, noite);
  const estado = (nome, e) => {
    const x = o[nome];
    if (foraDaNoite(noite, nome)) return {cls:'ocupada', sub:'não nesta noite', titulo:'Mesa ' + nome + ' não está à venda nesta noite'};
    if (!x) return {cls:'livre', sub:'€' + precoMesa(lig, nome, noite), clicavel:true, sel:nome === mesa, titulo:'Mesa ' + nome + ', livre, €' + precoMesa(lig, nome, noite) + (e.lugares ? ', até ' + e.lugares + ' pessoas' : '')};
    if (x.r && estadoR(x.r) === 'segura') return {cls:'espera', sub:'em espera', fim:x.r.t + HOLD, titulo:'Mesa ' + nome + ' em espera: alguém está a fechar a reserva. Se não pagar, volta a ficar livre.'};
    return {cls:'ocupada', sub:'reservada', titulo:'Mesa ' + nome + ' já reservada'};
  };
  el.innerHTML = '<div class="pl-wrap pub">' + desenhaPlanta(lig, estado, 'data-mesa') + '</div>'
    + legenda([['livre', 'livre'], ['sel', 'a tua escolha'], ['espera', 'em espera · cronómetro'], ['ocupada', 'reservada']])
    + '<p class="lg-nota">Uma mesa <b>em espera</b> está a ser reservada agora por outra pessoa, que tem 30 minutos para pagar. Se o tempo acabar sem pagamento, a mesa volta a ficar livre aqui.</p>';
  aplicaCaixa();
}
el.addEventListener('click', ev => { const b = ev.target.closest('[data-mesa]'); if (!b) return; mesa = b.getAttribute('data-mesa'); desenha(); });
/* as noites à venda: as duas fixas da demonstração mais as que a casa publicou com mesas */
function montaNoites(){
  if (!bx) return; const b0 = bx.querySelector('[data-noite]'); if (!b0) return; const slots = b0.parentElement, n = noiteDe(noite);
  slots.innerHTML = NOITES.map(x => '<button type="button" class="' + (x.id === noite ? 'on' : '') + '" data-noite="' + esc(x.id) + '">' + esc(x.dia.split(' ').slice(0, 2).join(' ')) + '<small>' + esc(x.nome) + '</small></button>').join('');
  slots.style.gridTemplateColumns = 'repeat(' + Math.min(3, NOITES.length) + ',1fr)';
  const lbl = slots.previousElementSibling && slots.previousElementSibling.querySelector('i'); if (lbl) lbl.textContent = n.dia + ' · ' + n.nome;
}
if (bx) bx.addEventListener('click', ev => { const b = ev.target.closest('[data-noite]'); if (!b) return; noite = b.dataset.noite; mesa = ''; montaNoites(); desenha(); });
montaNoites();
document.addEventListener('streetfy-planta-expirou', () => desenha());
window.addEventListener('storage', ev => { if (ev.key === LG) { lig = ler(); desenha(); } });
desenha();
})();
