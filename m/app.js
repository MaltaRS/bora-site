(function(){
'use strict';
/* Xouty · app v2 funcional (m/app.js) · 28/10/2026
   App web a ecrã inteiro, no estilo V5 dos mockups, que reutiliza os módulos e o estado do site (os mesmos streetfy:* no localStorage):
   o que fazes no portal web aparece aqui, e o que fazes aqui aparece lá. Abas: Início · Eventos · Pessoas · Agenda · Perfil.
   Pagamentos simulados; nada de cartão. Tu és a Mariana Costa, como no site. */
const C = window.STREETFY_CATALOGO, F = window.BORA_FILTROS, EN = window.STREETFY_ENTRADAS, OF = window.STREETFY_OFERTAS, DJ = window.STREETFY_DJS, PR = window.STREETFY_PROMOTERS || {lista:[], festasDe:() => []},
  G = window.STREETFY_GAMI, ME = window.STREETFY_MESAS, EV = window.STREETFY_EUVOU, FU = window.STREETFY_FUNC, GO = window.STREETFY_GOSTOS;
const app = document.getElementById('app'), tabs = document.getElementById('tabs');
const EU = 'Mariana Costa', EU_ID = 'mari-costa';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const ls = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const raw = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
const rawSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const eur = n => '€' + (Math.round(n * 100) / 100).toFixed(2).replace('.', ',').replace(/,00$/, '');
const fmt = n => Math.round(n).toLocaleString('pt-PT');
const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'], MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const hoje = () => new Date().toISOString().slice(0, 10);
const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const dataTxt = s => { if (!s) return ''; const d = new Date(s + 'T12:00'); return SEM[d.getDay()] + ' ' + d.getDate() + ' ' + MES[d.getMonth()]; };
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const IMG = n => !n ? '../img/lux.jpg' : /^(https?:|data:)/.test(n) ? n : n.startsWith('img/') ? '../' + n : '../img/' + n + '.jpg';
const PES = id => '../img/pessoas/' + id + '.jpg';

/* ---------- peças (as mesmas classes dos mockups) ---------- */
const ico = (n, cls) => '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
const bar = (back, t, sub, right) => '<div class="bar">' + (back ? '<button type="button" class="ico" data-back aria-label="Voltar">' + ico('back') + '</button>' : '') + '<div class="ttl">' + t + (sub ? '<small>' + sub + '</small>' : '') + '</div>' + (right || '') + '</div>';
const icob = (n, go, cls, label) => '<button type="button" class="ico ' + (cls || '') + '" data-go="' + esc(go || '') + '" aria-label="' + esc(label || n) + '">' + ico(n) + '</button>';
const lbl = (t, s) => '<div class="lbl"><span>' + t + '</span>' + (s ? '<small>' + s + '</small>' : '') + '</div>';
const note = t => '<p class="note">' + t + '</p>';
const chips = (arr, attr, wrap) => '<div class="chips' + (wrap ? ' wrap' : '') + '">' + arr.map(c => '<button type="button" class="' + (c.on ? 'on' : '') + '" ' + attr + '="' + esc(c.v) + '">' + c.t + '</button>').join('') + '</div>';
const seg = (arr, attr) => '<div class="seg">' + arr.map(c => '<button type="button" class="' + (c.on ? 'on' : '') + '" ' + attr + '="' + esc(c.v) + '">' + c.t + '</button>').join('') + '</div>';
const seg3 = (on, attr) => '<span class="seg3">' + [['pub', 'Público'], ['seg', 'Seguidores'], ['eu', 'Só eu']].map(([v, t]) => '<button type="button" class="' + (v === on ? 'on' : '') + '" ' + attr + ' data-v="' + v + '">' + t + '</button>').join('') + '</span>';
const swt = (on, attr) => '<button type="button" class="swt' + (on ? ' on' : '') + '" ' + attr + ' role="switch" aria-checked="' + !!on + '"></button>';
const kv = rows => '<div class="kv">' + rows.map(r => '<div' + (r[2] ? ' class="tot"' : '') + '><span>' + r[0] + '</span><span>' + r[1] + '</span></div>').join('') + '</div>';
const row = (img, t, s, end, attr, cls) => '<button type="button" class="row lk ' + (cls || '') + '" ' + (attr || '') + '>' + (img ? '<span class="th" style="background-image:url(' + esc(img) + ')"></span>' : '') + '<div><div class="t">' + t + '</div>' + (s ? '<div class="s">' + s + '</div>' : '') + '</div>' + (end ? '<span class="end ' + (end[1] || '') + '">' + end[0] + '</span>' : '') + '</button>';
const who = (img, n, s, right) => '<div class="who"><span class="av" style="background-image:url(' + esc(img) + ')"></span><div><div class="nm">' + n + '</div><div class="st">' + s + '</div></div>' + (right || '') + '</div>';
const act = (t, attr, cls) => '<button type="button" class="act ' + (cls || '') + '" ' + attr + '>' + t + '</button>';
const btn = (t, cls, attr, sub) => '<button type="button" class="btn ' + (cls || '') + '" ' + (attr || '') + '>' + t + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
const tag = (t, cls) => '<span class="tag ' + (cls || '') + '">' + t + '</span>';
const oc = (hd, right, it, ac, cls) => '<div class="ocard"><div class="hd3"><b>' + hd + '</b><span>' + (right || '') + '</span></div>' + (it ? '<div class="it">' + it + '</div>' : '') + (ac ? '<div class="ac ' + (cls || '') + '">' + ac + '</div>' : '') + '</div>';
const field = (l, v) => '<div class="field"><small>' + l + '</small><b>' + v + '</b></div>';
const steps = arr => '<div class="steps">' + arr.map(([t, s]) => '<div class="' + (s || 'mu') + '"><i>' + (s === 'ok' ? '✓' : s === 'agora' ? '●' : '') + '</i><span>' + t + '</span></div>').join('') + '</div>';
const pc = (img, inner, attr, h) => '<a class="pc" href="#" ' + (attr || '') + '><div class="im duo" style="background-image:url(' + esc(img) + ');height:' + (h || 170) + 'px"></div><div class="ov">' + inner + '</div></a>';
const barra = p => '<div class="barra"><i style="width:' + Math.max(0, Math.min(100, p)) + '%"></i></div>';
let toastT = 0; const toast = t => { let el = document.querySelector('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); } el.textContent = t; clearTimeout(toastT); toastT = setTimeout(() => el.remove(), 2600); };

/* ---------- catálogo ---------- */
const porId = id => C.itens.find(i => String(i.id) === String(id));
const chave = i => C.lugarKey(i);
const quando = i => { if (!i) return ''; const ks = (i._ks || []).slice().sort((a, b) => a - b); if (!ks.length && i.data) return dataTxt(i.data); if (!ks.length) return 'esta semana'; if (ks[0] === 0) return 'hoje'; if (ks[0] === 1) return 'amanhã'; const d = new Date(); d.setDate(d.getDate() + ks[0]); return SEM[d.getDay()] + ' ' + d.getDate(); };
const horaDe = i => String(i.hora || '').replace(/^\D+\s/, '');
const precoDe = i => i.preco === 0 ? 'Entrada livre' : typeof i.preco === 'number' ? '€' + i.preco : (i.preco || '');
const precoNum = i => { const l = (i.lotes || []).find(x => !x.ate || x.ate >= hoje()) || (i.lotes || [])[0]; return l ? +l.preco : (typeof i.preco === 'number' ? i.preco : 0); };
const loteAtivo = i => (i.lotes || []).find(x => !x.ate || x.ate >= hoje());
const assumido = i => i.origem !== 'bot';
const segue = k => raw('segue:' + k, '') === '1';
const seguirLugar = (k, on) => rawSet('segue:' + k, on ? '1' : '0');
const cidadeDe = id => (F.PAISES[0].cidades.find(c => c.id === id) || F.PAISES[0].cidades[0]);
const estadoF = o => Object.assign({}, F.lerUrl(), {pais:'pt', cidade:ls('streetfy:app-cidade', 'lisboa'), tipo:'tudo', quando:'hoje', estilo:'todos', bairro:'', q:'', preco:'', hora:'', extra:''}, o || {});
const eventosDe = (o, n) => F.filtrar(estadoF(o)).slice(0, n || 400);
const hrefSite = p => '../' + p;

/* ---------- gente (fictícia, como no site) ---------- */
const AMIGOS = [
  {id:'leonor-s', nome:'Leonor S.', k:'lisboa/lux fragil', st:'la', min:25, prox:true}, {id:'hugo-m', nome:'Hugo M.', k:'lisboa/b leza', st:'la', min:10, prox:true},
  {id:'bruna-t', nome:'Bruna T.', k:'lisboa/time out market', st:'la', min:95, prox:true}, {id:'sara-d', nome:'Sara D.', k:'lisboa/park bar', st:'vai', min:20, prox:true},
  {id:'kiko-r', nome:'Kiko R.', k:'lisboa/ministerium club', st:'vai', min:35, prox:false}, {id:'tomas-f', nome:'Tomás F.', k:'lisboa/pensao amor', st:'la', min:40, prox:false}];
const CONC = [{id:'lara-v', nome:'Lara V.', foto:'cocktail', sub:'Lisboa · noite · mesas no Lux e no Ministerium'}, {id:'ricardo-p', nome:'Ricardo P.', foto:'pribeira', sub:'Porto · grupos de empresa'}, {id:'beatriz-c', nome:'Beatriz C.', foto:'pfoz', sub:'Lisboa e Cascais · aniversários'}];
const JA_FUI = [['Lux Frágil', 'lisboa/lux fragil', 'Noite X · sex 17 out', true], ['B.Leza', 'lisboa/b leza', 'Baile do B.Leza · sáb 18 out', true], ['Park Bar', 'lisboa/park bar', 'Pôr do sol · dom 19 out', false], ['Hot Clube de Portugal', 'lisboa/hot clube de portugal', 'Sessão de jazz · qui 16 out', true]];
const localDe = k => { const its = C.itens.filter(i => chave(i) === k), g = its.find(i => i.lat && i.lng) || its[0]; return g ? {k, nome:g.lugar || g.titulo, bairro:g.bairro || '', lat:g.lat, lng:g.lng} : {k, nome:k.split('/')[1] || k, bairro:'', lat:38.712, lng:-9.14}; };
const perfil = () => Object.assign({nome:EU, user:'mari.costa', cidade:'Lisboa', foto:'retrato', bio:'Techno às sextas, kizomba aos sábados, petiscos ao domingo.', vis:{}}, ls('streetfy:perfil-user', {}) || {});
const visDe = k => { const v = perfil().vis || {}; const d = {aSeguir:'seg', jaFui:'seg', fotos:'pub', aval:'pub', gostos:'pub', seguindo:'seg', listas:'eu', presenca:'eu', conquistas:'eu'}; return v[k] || d[k] || 'eu'; };
const setVis = (k, v) => { const p = ls('streetfy:perfil-user', {}) || {}; p.vis = Object.assign({}, p.vis || {}, {[k]:v}); sv('streetfy:perfil-user', p); };
const VIS_T = {pub:'público', seg:'seguidores', eu:'só eu'};

/* ---------- estado do app ---------- */
const BK = 'streetfy:bilhetes-app', RK = 'streetfy:app-reservas', PK = 'streetfy:pedidos-lista';
const bilhetes = () => ls(BK, []); const reservas = () => ls(RK, []); const pedidos = () => ls(PK, {});
/* a semente das ofertas tem hora de fim: se tudo já expirou e ninguém aceitou nada, volta a semear para a demonstração */
const ofertasFrescas = () => { if (!OF) return; OF.carrega(); const S = OF.estado(); if (S.ofertas.length && S.ofertas.every(o => !OF.ativa(o)) && !Object.keys(S.vouchers || {}).length) { localStorage.removeItem('streetfy:ofertas'); OF.carrega(); } };
const locAtual = () => { const n = raw('streetfy:app-loc', 'Bairro Alto'), s = (OF ? OF.SIM : []).find(x => x[0] === n) || (OF ? OF.SIM[0] : ['', 38.7128, -9.1446]); return [s[1], s[2]]; };
let qtdMem = {}, ui = {noite:'n1', mesa:'', estilos:new Set(['techno', 'house']), tab:'amigos', busca:'', metodo:'apple', mais:30, porta:[], pontos:0};

/* ---------- ecrãs ---------- */
const V = {};
V.inicio = () => {
  const cid = ls('streetfy:app-cidade', 'lisboa'), cidade = cidadeDe(cid), qd = ls('streetfy:app-quando', 'hoje');
  const todos = eventosDe({quando:qd}), lista = todos.slice(0, 8), loc = locAtual();
  let ofertas = []; if (OF) { ofertasFrescas(); ofertas = OF.estado().ofertas.filter(o => OF.ativa(o) && OF.dentro(o.zona, loc)); }
  const amigosLa = AMIGOS.filter(a => a.st === 'la').slice(0, 3);
  return {tab:0, html:
    '<div class="bar"><button type="button" class="ttl" data-go="cidade" style="background:none;border:0;padding:0;text-align:left;cursor:pointer">' + esc(cidade.nome) + ' ▾<small>O teu ● de encontro</small></button>' + icob('bell', 'site?p=notificacoes.html', '', 'Avisos') + '</div>'
    + chips([['hoje', 'Hoje'], ['amanha', 'Amanhã'], ['fds', 'Fim de semana'], ['todas', 'Todas as datas']].map(([v, t]) => ({v, t, on:qd === v})), 'data-quando')
    + lbl('Ofertas perto de ti', 'a posição fica no telemóvel · <button type="button" class="lk" data-go="ofertas" style="background:none;border:0;padding:0;color:var(--ac);font-weight:800;cursor:pointer">ver</button>')
    + (ofertas.length ? ofertas.slice(0, 2).map(o => oc(esc(OF.oQue(o)), esc(o.casa.nome) + ' · ' + esc(OF.estadoTxt(o)), esc(OF.PUB[o.publico]) + (o.alcool ? ' · 18+ · 1 com álcool por noite' : ''), ofBotao(o), 'um')).join('') : note('Nenhuma oferta na zona onde estás agora (' + esc(raw('streetfy:app-loc', 'Bairro Alto')) + '). Muda a zona em Ofertas.'))
    + lbl('Amigos lá agora', 'só quem partilha contigo') + '<button type="button" class="avs" data-go="pessoas/mapa" style="background:none;border:0;padding:4px 0;cursor:pointer">' + amigosLa.map(a => '<i style="background-image:url(' + PES(a.id) + ')"></i>').join('') + '<b>' + esc(amigosLa.map(a => a.nome.split(' ')[0]).join(', ')) + ' · ' + esc(localDe(amigosLa[0].k).nome) + ' e mais · ir ter ›</b></button>'
    + titulo(qd === 'hoje' ? 'Hoje' : qd === 'amanha' ? 'Amanhã' : qd === 'fds' ? 'Fim de semana' : 'Todas as datas', 'Sair em <em>' + esc(cidade.nome) + '</em>')
    + fres(todos.length, cidade.nome, todos)
    + cards(lista)
    + btn('Ver todos os eventos', 'ghost', 'data-go="eventos"')
    + lbl('Experiências', 'céu, água, noite VIP, à tua porta') + '<a class="pc" href="' + hrefSite('experiencias.html') + '"><div class="im duo" style="background-image:url(../img/heli.jpg);height:96px"></div><div class="ov"><span class="poster-t" style="font-size:20px">Céu · Água · Noite VIP · À tua porta</span><span style="font-size:11px">abre o site das experiências</span></div></a>'};
};
/* cartões iguais aos do site: 'cartoes' = card-l (cartaoLista), 'lista' = linha (cartaoLinha); preferência partilhada com o site em streetfy:vista */
const VISTA_K = 'streetfy:vista';
const vista = () => raw(VISTA_K, 'cartoes') === 'lista' ? 'lista' : 'cartoes';
const ICO_GRADE = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor"/></svg>',
  ICO_LISTA = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="3" y="4" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="17" width="18" height="3" rx="1.5" fill="currentColor"/></svg>';
const cards = (lista, forca) => {
  const v = forca || vista(), t = F.T(), f = v === 'lista' ? F.cartoes.linha : v === 'poster' ? F.cartoes.poster : F.cartoes.lista;
  const h = lista.map((i, k) => f(i.img ? i : Object.assign({}, i, {img:'lux'}), k, t)).join('').replace(/url\(img\//g, 'url(../img/');
  return '<div class="s-cards' + (v === 'lista' ? ' vista-lista' : '') + '">' + h + '</div>';
};
const fvista = () => { const v = vista(); return '<span class="fvista" role="group" aria-label="Vista">' + [['cartoes', ICO_GRADE, 'Cartões'], ['lista', ICO_LISTA, 'Lista']].map(x => '<button type="button" data-vista="' + x[0] + '"' + (v === x[0] ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + ' title="' + x[2] + '">' + x[1] + '<span>' + x[2] + '</span></button>').join('') + '</span>'; };
const fres = (n, onde, lista) => { const g = GO && lista ? lista.filter(i => GO.tem(i.id)).length : 0; return '<p class="fres"><span><b>' + n + '</b> ' + (n === 1 ? 'evento' : 'eventos') + (onde ? ' · ' + esc(onde) : '') + '</span>' + (g ? '<span class="fgostos">' + GO.icone + g + '</span>' : '') + fvista() + '</p>'; };
const titulo = (eyebrow, h) => '<div class="s-top"><p class="s-eyebrow">' + eyebrow + '</p><h2 class="s-h h2s">' + h + '</h2></div>';
const tituloEm = s => { const w = esc(s).split(' '); if (w.length < 2) return '<em>' + w[0] + '</em>'; const u = w.pop(); return w.join(' ') + ' <em>' + u + '</em>'; };
const ofBotao = o => { const meu = OF.meus().find(v => v.oferta === o.id); if (meu) return btn('Ver o voucher', 'ghost', 'data-go="voucher/' + esc(meu.c) + '"'); return btn(OF.precisaSeguir(o) ? 'Seguir ' + esc(o.casa.nome) + ' e aceitar' : 'Aceitar · voucher', 'mint', 'data-act="aceitar" data-id="' + esc(o.id) + '"'); };

V.cidade = () => ({tab:0, html:bar(true, 'Onde estás a sair') + F.PAISES[0].cidades.filter(c => c.aberta).map(c => row(null, esc(c.nome), (c.eventos || 0) + ' eventos · ' + (c.lugares || 0) + ' lugares', [ls('streetfy:app-cidade', 'lisboa') === c.id ? '✓' : '', 'ac'], 'data-act="cidade" data-id="' + esc(c.id) + '"')).join('') + note('A cidade escolhida vale para Hoje, Eventos e Ofertas. O GPS só sugere trocar.')});

V.eventos = (p, q) => {
  const qd = q.get('quando') || ls('streetfy:app-quando', 'hoje'), tipo = q.get('tipo') || 'tudo', busca = ui.busca;
  const lista = eventosDe({quando:qd, tipo, q:busca}), vis = lista.slice(0, ui.mais);
  return {tab:1, html:
    bar(false, 'Eventos', esc(cidadeDe(ls('streetfy:app-cidade', 'lisboa')).nome) + ' · o que há para sair', icob('search', '', '', 'Procurar'))
    + '<label class="search">' + ico('search', 's') + '<input data-busca placeholder="Procurar lugar, evento ou bairro" value="' + esc(busca) + '" enterkeyhint="search"></label>'
    + chips([['hoje', 'Hoje'], ['amanha', 'Amanhã'], ['fds', 'Fim de semana'], ['todas', 'Todas']].map(([v, t]) => ({v, t, on:qd === v})), 'data-set-quando')
    + chips([['tudo', 'Tudo'], ['festa', 'Festas'], ['concerto', 'Concertos'], ['clube', 'Clubes'], ['bar', 'Bares'], ['restaurante', 'Restaurantes'], ['livre', 'Entrada livre']].map(([v, t]) => ({v, t, on:tipo === v})), 'data-set-tipo')
    + fres(lista.length, cidadeDe(ls('streetfy:app-cidade', 'lisboa')).nome, lista)
    + (vis.length ? cards(vis) : note('Nada com estes filtros. Tira o tipo ou muda o dia.'))
    + (lista.length > ui.mais ? btn('Mostrar mais ' + (lista.length - ui.mais), 'ghost', 'data-act="mais"') : '')};
};

V.evento = p => {
  const i = porId(p[0]); if (!i) return {tab:1, html:bar(true, 'Evento') + note('Este evento não está no catálogo.')};
  const k = chave(i), nome = i.lugar || i.titulo, sg = segue(k), livre = i.preco === 0, passou = !!(i.fim && i.fim < hoje()), vendaFechou = !!(i.vendaAte && new Date(i.vendaAte) <= new Date());
  const lote = loteAtivo(i), base = precoNum(i), qtd = qtdMem[i.id] || 2, taxa = livre ? 0 : Math.round((base * qtd * 0.06 + 0.5) * 100) / 100, total = base * qtd + taxa;
  const djs = (DJ ? DJ.lista : []).filter(d => (d.ids || []).includes(i.id) || (i.lineup || []).includes(d.id)), proms = PR.lista.filter(x => (x.ids || []).includes(i.id));
  const outros = C.itens.filter(x => chave(x) === k && x.id !== i.id && !(x.fim && x.fim < hoje())).slice(0, 3);
  let caixa;
  if (passou) caixa = field('Já passou', 'fica no histórico do lugar') + btn('Ver os próximos de ' + esc(nome), 'ghost', 'data-go="eventos"');
  else if (assumido(i) && !livre && vendaFechou) caixa = '<div class="warnbar">Vendas encerradas · a venda fechou ' + esc(dataTxt(i.vendaAte.slice(0, 10))) + ' às ' + esc(i.vendaAte.slice(11, 16)) + '. Quem já tem bilhete entra com o QR.</div>' + btn('Ver os próximos de ' + esc(nome), 'ghost', 'data-go="eventos"');
  else if (assumido(i) && i.soSeguidores && !sg) caixa = '<div class="guar">' + ico('shield', 's') + '<span><b>Só para seguidores</b>' + esc(nome) + ' abriu esta noite só a quem segue a casa. Segue com um toque e ' + (livre ? 'entra nos planos' : 'compra já') + '.</span></div>' + btn('Seguir ' + esc(nome) + (livre ? ' e entrar nos planos' : ' e comprar · ' + eur(base)), '', 'data-act="seguir-comprar" data-k="' + esc(k) + '"');
  else if (assumido(i) && livre) caixa = field('Entrada livre', 'chega e entra · check-in à porta') + btn(EV && EV.tem(i.id) ? 'Eu vou ✓ · nos teus planos' : 'Quero ir · entra nos planos', EV && EV.tem(i.id) ? 'mint' : '', 'data-act="euvou" data-id="' + esc(i.id) + '"');
  else if (assumido(i)) caixa = (i.lotes && i.lotes.length ? '<div class="slots">' + i.lotes.filter(l => +l.qtd > 0).map(l => '<div class="slot' + (l === lote ? ' on' : (l.ate && l.ate < hoje()) ? ' off' : '') + '">' + esc(l.nome) + '<b>€' + esc(l.preco) + '</b><small>' + (l === lote ? 'à venda' : (l.ate && l.ate < hoje()) ? 'esgotado' : 'a seguir') + '</small></div>').join('') + '</div>' : '')
    + '<div class="row"><div><div class="t">Bilhetes</div><div class="s">até 6 por compra · ' + eur(base) + ' cada</div></div><span class="end"><span class="seg" style="display:inline-flex;padding:2px"><button type="button" data-act="qtd" data-id="' + esc(i.id) + '" data-d="-1">−</button><button type="button" class="on" style="min-width:34px">' + qtd + '</button><button type="button" data-act="qtd" data-id="' + esc(i.id) + '" data-d="1">+</button></span></span></div>'
    + kv([[qtd + ' × ' + eur(base), eur(base * qtd)], ['Taxa de serviço (6% + €0,50)', eur(taxa)], ['Total', eur(total), true]])
    + (i.vendaAte ? '<p class="note">Venda até ' + esc(dataTxt(i.vendaAte.slice(0, 10))) + ' · ' + esc(i.vendaAte.slice(11, 16)) + '.</p>' : '')
    + btn('Comprar · ' + eur(total), '', 'data-go="comprar/' + esc(i.id) + '?qtd=' + qtd + '"');
  else caixa = field('Sem bilhete aqui', 'perfil gerido pela IA · a saída é a fonte') + (i.fonteLink || i.href ? '<a class="btn" href="' + esc(i.fonteLink || i.href) + '" target="_blank" rel="noopener">Bilhetes na fonte · ' + esc(String(i.fonte || 'origem').split(/ ·| /)[0]) + '</a>' : '') + btn('É o teu lugar? Assume o perfil', 'ghost', 'data-site="parceiros.html"');
  return {tab:1, html:
    bar(true, '', '', icob('share', '', '', 'Partilhar') )
    + '<div class="hero-ev"><div class="s-bg" style="background-image:url(' + esc(IMG(i.img)) + ')"></div><div class="s-tint"></div>'
      + '<span class="s-tag' + (livre ? ' mint' : '') + '">' + esc(F.tag(i)) + '</span>' + (i.origem === 'patrocinado' ? '<span class="s-pat">patrocinado</span>' : '')
      + (GO ? '<button type="button" class="s-gosto' + (GO.tem(i.id) ? ' on' : '') + '" data-f="gosto" data-v="' + esc(i.id) + '" aria-pressed="' + GO.tem(i.id) + '" aria-label="Gosto">' + GO.icone + '</button>' : '')
      + '<div class="hb"><p class="s-eyebrow">' + esc(quando(i)) + (horaDe(i) ? ' · ' + esc(horaDe(i)) : '') + (i.soSeguidores ? ' · só para seguidores' : i.origem === 'bot' ? ' · via ' + esc(String(i.fonte || 'fonte').split(/ ·| /)[0]) : '') + '</p>'
      + '<h1 class="s-h">' + tituloEm(i.titulo) + '</h1><p class="meta"><b>' + esc(nome) + '</b>' + (i.bairro ? ' · ' + esc(i.bairro) : '') + (i.estilo ? ' · ' + esc(cap(i.estilo)) : '') + (livre ? ' · entrada livre' : ' · ' + esc(precoDe(i))) + (i.aqui ? ' · <span style="color:var(--pink);font-weight:800">● ' + i.aqui + ' aqui agora</span>' : i.vao ? ' · ' + i.vao + ' vão' : '') + '</p></div></div>'
    + '<div class="stats">' + [[precoDe(i), 'entrada'], [i.estilo ? cap(i.estilo) : '—', 'estilo'], [i.aqui ? '● ' + i.aqui : (i.vao || 0) + '', i.aqui ? 'aqui agora' : 'vão'], [i.star ? '★ ' + i.star : '—', 'nota']].map(x => '<div><b>' + esc(x[0]) + '</b><small>' + x[1] + '</small></div>').join('') + '</div>'
    + (i.porNome ? who(PES('mariana-c'), 'por ' + esc(i.porNome) + ' · promoter', 'evento criado na página de ' + esc(nome), tag('aprovado pela casa', 'mint')) : '')
    + '<div class="sw">' + btn(sg ? 'A seguir ✓' : 'Seguir ' + esc(/^\d/.test(nome) ? i.titulo : nome.split(' ')[0]), sg ? 'mint' : 'ghost', 'data-act="seguir" data-k="' + esc(k) + '"') + btn('Partilhar', 'ghost', 'data-act="toast" data-t="Ligação copiada (simulado)"') + '</div>'
    + (!livre && assumido(i) ? btn(EV && EV.tem(i.id) ? 'Eu vou ✓' : 'Eu vou · avisa quem te segue', EV && EV.tem(i.id) ? 'mint' : 'ghost', 'data-act="euvou" data-id="' + esc(i.id) + '"') : '')
    + (i.pp || i.descricao ? '<p class="desc">' + esc(i.descricao || i.pp) + '</p>' : '')
    + lbl('Bilhete') + caixa
    + (djs.length || proms.length ? lbl('Listas de convidados', 'QR depois de a casa aprovar') + djs.map(d => row(IMG(d.foto), 'Lista do ' + esc(d.art), esc(DJ.NIVEL[d.nivel] || 'DJ') + ' · aprovação da casa', ['pedir ›', 'ac'], 'data-go="lista/' + esc(i.id) + '?dj=' + esc(d.id) + '"')).join('') + proms.map(x => row(IMG(x.foto), 'Lista da ' + esc(x.nome), 'promoter · ' + (x.comissao && x.comissao.includes(i.id) ? 'com comissão' : 'sem comissão'), ['pedir ›', 'ac'], 'data-go="lista/' + esc(i.id) + '?p=' + esc(x.id) + '"')).join('') : '')
    + (k === 'lisboa/lux fragil' && assumido(i) ? lbl('Mesa VIP') + row('../img/mesa.jpg', 'Reservar mesa', 'planta do Lux · preço por mesa e por noite', ['›', 'ac'], 'data-go="mesa"') : '')
    + (outros.length ? lbl('Outras noites em ' + esc(nome)) + cards(outros, 'lista') : '')
    + note('Casa cancela: devolução integral e automática. Sem direito de arrependimento (DL 24/2014, art. 17.º).')};
};

V.comprar = (p, q) => {
  const i = porId(p[0]); if (!i) return V.evento(p);
  const qtd = +q.get('qtd') || 2, base = precoNum(i), taxa = Math.round((base * qtd * 0.06 + 0.5) * 100) / 100, total = base * qtd + taxa;
  return {tab:1, html:
    bar(true, 'Comprar', esc(i.titulo) + ' · ' + esc(i.lugar || ''))
    + kv([[qtd + ' × ' + eur(base) + (loteAtivo(i) ? ' · ' + esc(loteAtivo(i).nome) : ''), eur(base * qtd)], ['Taxa de serviço (6% + €0,50)', eur(taxa)], ['Total', eur(total), true]])
    + lbl('Como pagas', 'simulado no protótipo') + seg([['apple', 'Apple Pay'], ['mbway', 'MB WAY'], ['cartao', 'Cartão']].map(([v, t]) => ({v, t, on:ui.metodo === v})), 'data-metodo')
    + lbl('Fatura', 'opcional') + '<input class="inp" data-nif inputmode="numeric" maxlength="9" placeholder="NIF para a fatura do bilhete (a casa emite)">'
    + note('O dinheiro fica retido até 2 dias depois do evento. Se a casa cancelar, devolve tudo, taxa incluída. O Xouty fatura só a taxa; o bilhete é faturado pela casa.')
    + btn('Pagar · ' + eur(total), '', 'data-act="pagar" data-id="' + esc(i.id) + '" data-qtd="' + qtd + '"')};
};

V.bilhete = p => {
  const b = bilhetes().find(x => x.id === p[0]); if (!b) return {tab:3, html:bar(true, 'Bilhete') + note('Bilhete não encontrado.')};
  const i = porId(b.ev) || {titulo:'Evento', lugar:''}, janela = Math.floor(Date.now() / 30000), falta = 30 - Math.floor((Date.now() % 30000) / 1000);
  return {tab:3, dark:true, after:() => { clearInterval(V._t); V._t = setInterval(() => { if (location.hash.includes('bilhete/' + b.id)) render(true); }, 1000); }, html:
    bar(true, 'O teu bilhete', esc(i.titulo) + ' · ' + esc(i.lugar || ''), icob('share', '', '', 'Partilhar'))
    + '<div class="qrbox' + (b.usado ? ' usado' : '') + '">' + EN.qrSvg(b.codigo + ':' + janela) + '<div class="codeline">' + esc(b.codigo) + '</div><small style="color:#666">QR muda em ' + falta + ' s · o código de 6 letras vale sem rede</small></div>'
    + kv([['Nome', EU], ['Bilhetes', b.qtd + ' × ' + eur(b.base)], ['Quando', esc(quando(i)) + (horaDe(i) ? ' · ' + esc(horaDe(i)) : '')], ['Pago', esc(hhmm(b.t)) + ' · ' + esc(b.metodo)]])
    + '<div class="okbar">Lido na porta, faz o check-in sozinho. Transferir a outra conta só até ao início.</div>'
    + '<div class="sw">' + btn('Transferir', 'ghost', 'data-act="toast" data-t="No protótipo não dá para transferir."') + btn('Abrir no Wallet', 'ghost', 'data-act="toast" data-t="Wallet: só no app nativo."') + '</div>'};
};

V.lista = (p, q) => {
  const i = porId(p[0]); if (!i) return V.evento(p);
  const d = q.get('dj') && DJ ? DJ.porId(q.get('dj')) : null, pr = q.get('p') ? PR.lista.find(x => x.id === q.get('p')) : null;
  const quem = d ? {id:'dj:' + d.id, nome:d.art, sub:DJ.NIVEL[d.nivel] || 'DJ', foto:IMG(d.foto), lista:'Lista do ' + d.art} : pr ? {id:'p:' + pr.id, nome:pr.nome, sub:'promoter · ' + pr.nivel, foto:IMG(pr.foto), lista:'Lista da ' + pr.nome} : {id:'casa', nome:i.lugar, sub:'lista da casa', foto:IMG(i.img), lista:'Lista da casa'};
  const k = chave(i), key = i.id + '|' + quem.id, est = pedidos()[key], sg = segue(k), gate = i.soSeguidores && !sg;
  const entrada = EN.minhas().find(e => e.lista === 'app:' + key);
  return {tab:1, html:
    bar(true, quem.lista, esc(i.titulo) + ' · ' + esc(i.lugar || ''))
    + who(quem.foto, esc(quem.nome), esc(quem.sub) + ' · lista com aprovação da casa', tag('restam 12', 'mint'))
    + kv([['Vagas', '30 · restam 12'], ['Fecha', 'às ' + esc(fechaTxt(i)) + ' · 30 min antes'], ['Benefício', 'entrada grátis até 1h30'], ['+1', 'podes levar uma pessoa']])
    + lbl('O teu pedido')
    + (entrada ? steps([['Pedido enviado', 'ok'], [esc(quem.nome) + ' aceitou', 'ok'], ['A casa aprovou a lista', 'ok'], ['Tens o QR na agenda', 'agora']]) + btn('Ver o QR de entrada', 'mint', 'data-go="qr/' + esc(entrada.c) + '"')
      : est === 'pedido' ? steps([['Pedido enviado · ' + esc(hhmm(Date.now())), 'ok'], [esc(quem.nome) + ' aceita', 'agora'], ['A casa aprova a lista', ''], ['Recebes o QR na agenda', '']]) + '<div class="sw">' + btn('Cancelar o pedido', 'ghost', 'data-act="lista-cancela" data-key="' + esc(key) + '"') + btn('Simular: aceite e aprovado', 'mint', 'data-act="lista-aprova" data-key="' + esc(key) + '" data-ev="' + esc(i.id) + '" data-nome="' + esc(quem.lista) + '"') + '</div>'
      : gate ? '<div class="guar">' + ico('shield', 's') + '<span><b>Só para seguidores</b>Esta noite é só para quem segue ' + esc(i.lugar) + '. Segue e pede o lugar.</span></div>' + btn('Seguir ' + esc(i.lugar) + ' e pedir lugar', '', 'data-act="lista-seguir-pedir" data-k="' + esc(k) + '" data-key="' + esc(key) + '"')
      : steps([['Pedes o lugar', 'agora'], [esc(quem.nome) + ' aceita', ''], ['A casa aprova a lista', ''], ['Recebes o QR na agenda', '']]) + btn('Pedir lugar na lista', 'mint', 'data-act="lista-pedir" data-key="' + esc(key) + '"'))
    + note('Só vês o teu nome e o QR depois de a casa aprovar. Pedidos recusados nunca aparecem a ninguém. Lido na porta, o QR fica usado e o check-in fica feito.')};
};
const fechaTxt = i => { const h = horaDe(i) || '23:00', m = h.match(/(\d{1,2}):(\d{2})/); if (!m) return '22:30'; const d = new Date(); d.setHours(+m[1], +m[2] - 30, 0, 0); return hhmm(d); };

V.mesa = () => {
  if (!ME) return {tab:1, html:bar(true, 'Mesa VIP') + note('Mesas indisponíveis.')};
  const lig = ME.ler(), noite = ME.noiteDe(ui.noite), o = ME.ocupacao(lig, ui.noite);
  const livres = ME.mesasDe(lig).filter(m => !o[m.nome] && !ME.foraDaNoite(ui.noite, m.nome));
  if (!ui.mesa || o[ui.mesa] || ME.foraDaNoite(ui.noite, ui.mesa)) ui.mesa = livres[0] ? livres[0].nome : '';
  const estado = (nome, e) => ME.foraDaNoite(ui.noite, nome) ? {cls:'ocupada', sub:'não hoje', titulo:'Mesa ' + nome + ' não está à venda nesta noite'} : o[nome] ? (o[nome].r && ME.estadoR(o[nome].r) === 'segura' ? {cls:'espera', sub:'em espera', fim:o[nome].r.t + ME.HOLD, titulo:'Mesa ' + nome + ' em espera'} : {cls:'ocupada', sub:'reservada', titulo:'Mesa ' + nome + ' já reservada'}) : {cls:'livre', sub:'€' + ME.precoMesa(lig, nome, ui.noite), clicavel:true, sel:nome === ui.mesa, titulo:'Mesa ' + nome + ' livre'};
  const m = ui.mesa ? ME.mesaDe(lig, ui.mesa) : null, preco = ui.mesa ? ME.precoMesa(lig, ui.mesa, ui.noite) : 0, z = ui.mesa ? ME.zonaDe(lig, ui.mesa) : null;
  return {tab:1, html:
    bar(true, 'Mesa VIP · Lux Frágil', 'consumo mínimo · IVA e serviço dentro')
    + chips(ME.NOITES.map(n => ({v:n.id, t:esc(n.dia.split(' ').slice(0, 2).join(' ')) + ' · ' + esc(n.nome), on:n.id === ui.noite})), 'data-noite')
    + '<div class="pl-wrap pub">' + ME.desenhaPlanta(lig, estado, 'data-mesa') + '</div>'
    + ME.legenda([['livre', 'livre'], ['sel', 'a tua escolha'], ['espera', 'em espera'], ['ocupada', 'reservada · não nesta noite']])
    + (ui.mesa ? kv([['Mesa ' + esc(ui.mesa), esc(z.nome) + (m && m.lugares ? ' · até ' + m.lugares : '')], ['Consumo mínimo', eur(preco)], ['Por pessoa (8)', eur(preco / 8) + ' · dividir pelo link'], ['Noite', esc(noite.dia) + ' · ' + esc(noite.nome)]]) + btn('Reservar mesa · ' + eur(preco), '', 'data-act="reservar" data-mesa="' + esc(ui.mesa) + '" data-preco="' + preco + '"') : note('Sem mesas livres nesta noite.'))
    + note('Mesa em espera: outra pessoa tem 30 minutos para pagar; se não pagar, volta a ficar livre. O mesmo stock serve o anúncio, os promoters e os concierges.')};
};

V.pessoas = (p, q) => {
  const t = q.get('t') || ui.tab; ui.tab = t;
  const segP = ls('streetfy:segue-promoters', {}), segD = ls('streetfy:segue-djs', {}), segC = ls('streetfy:segue-concierges', {});
  let corpo = '';
  if (t === 'amigos') corpo = lbl('Lá agora', 'só quem partilha contigo') + AMIGOS.filter(a => a.st === 'la').map(a => who(PES(a.id), esc(a.nome), esc(localDe(a.k).nome) + ' · há ' + a.min + ' min', act('Ir ter', 'data-go="pessoas/mapa"', a.prox ? 'on' : ''))).join('')
    + lbl('A caminho') + AMIGOS.filter(a => a.st === 'vai').map(a => who(PES(a.id), esc(a.nome), 'a caminho de ' + esc(localDe(a.k).nome), act('Avisar', 'data-act="toast" data-t="Aviso enviado a ' + esc(a.nome) + '"'))).join('')
    + btn('Abrir o mapa dos amigos', 'ghost', 'data-go="pessoas/mapa"')
    + row(null, 'As tuas conquistas', 'nível, selos, desafios e ranking entre amigos', ['›', 'ac'], 'data-go="conquistas"');
  if (t === 'promoters') corpo = PR.lista.map(x => who(IMG(x.foto), esc(x.nome), 'promoter · ' + esc(x.nivel) + ' · ' + esc(x.cidade) + ' · ★ ' + esc(x.nota) + ' · ' + esc((x.estilos || []).slice(0, 2).join(' · ')), act(segP[x.id] ? 'A seguir ✓' : 'Seguir', 'data-act="seg" data-k="streetfy:segue-promoters" data-id="' + esc(x.id) + '"', segP[x.id] ? 'on' : '') + act('Ver', 'data-go="promoter/' + esc(x.id) + '"'))).join('');
  if (t === 'djs') { const EST = ['techno', 'house', 'disco', 'kizomba', 'afro house', 'hip-hop']; const lst = DJ ? DJ.lista.filter(d => !ui.estilos.size || (d.estilos || []).some(e => ui.estilos.has(e))) : [];
    corpo = chips(EST.map(e => ({v:e, t:e, on:ui.estilos.has(e)})).concat([{v:'', t:'Limpar', on:false}]), 'data-estilo') + lst.map(d => who(IMG(d.foto), esc(d.art), esc(DJ.NIVEL[d.nivel]) + (d.casa ? ' · ' + esc(d.casa) : '') + ' · ' + esc((d.generos || []).slice(0, 2).join(' · ')) + ' · ★ ' + esc(d.nota), act(segD[d.id] ? 'A seguir ✓' : 'Seguir', 'data-act="seg" data-k="streetfy:segue-djs" data-id="' + esc(d.id) + '"', segD[d.id] ? 'on' : '') + act('Ver', 'data-go="dj/' + esc(d.id) + '"'))).join('') + note('Os estilos filtram em OU. As casas pedem booking pelo perfil do DJ.'); }
  if (t === 'concierges') corpo = CONC.map(c => who(IMG(c.foto), esc(c.nome), esc(c.sub), act(segC[c.id] ? 'A seguir ✓' : 'Seguir', 'data-act="seg" data-k="streetfy:segue-concierges" data-id="' + esc(c.id) + '"', segC[c.id] ? 'on' : ''))).join('') + btn('Falar com um concierge', 'ghost', 'data-site="concierge.html"');
  return {tab:2, html:bar(false, 'Pessoas', 'todos seguem todos', icob('search', 'eventos', '', 'Procurar')) + seg([['amigos', 'Amigos'], ['promoters', 'Promoters'], ['djs', 'DJs'], ['concierges', 'Concierges']].map(([v, tt]) => ({v, t:tt, on:t === v})), 'data-tabp') + corpo};
};

V['pessoas/mapa'] = () => {
  const modo = raw('streetfy:partilha-local', 'amigos').replace(/"/g, ''), eu = ls('streetfy:eu-a-caminho', null), euOk = eu && Date.now() - eu.t < 6 * 36e5;
  return {tab:2, after:() => mapaAmigos(), html:
    bar(true, 'Onde estão os amigos', 'só o local · apaga-se às 6h')
    + '<div class="mapa-el" id="mapa-el"></div>'
    + (euOk ? '<div class="okbar">Tu: ' + (eu.st === 'la' ? 'no ' : 'a caminho do ') + esc(localDe(eu.k).nome) + ' · ' + (modo === 'fantasma' ? 'invisível (modo fantasma)' : 'visível para ' + (modo === 'proximos' ? 'amigos próximos' : 'amigos')) + '</div>' : '')
    + AMIGOS.map(a => who(PES(a.id), esc(a.nome) + (a.prox ? ' · próximo' : ''), (a.st === 'la' ? esc(localDe(a.k).nome) + ' · há ' + a.min + ' min' : 'a caminho de ' + esc(localDe(a.k).nome)), act('Ir ter', 'data-act="irter" data-k="' + esc(a.k) + '"', a.st === 'la' ? 'on' : ''))).join('')
    + '<div class="tog"><span><span class="t">A minha partilha</span><span class="s">o local do teu check-in, até às 6h</span></span><span class="seg3">' + [['amigos', 'Amigos'], ['proximos', 'Próximos'], ['fantasma', 'Fantasma']].map(([v, tt]) => '<button type="button" class="' + (modo === v ? 'on' : '') + '" data-act="partilha" data-v="' + v + '">' + tt + '</button>').join('') + '</span></div>'
    + note('Nunca a morada nem a posição exata: só o local onde fizeste check-in, e só a quem partilha contigo.')};
};
function mapaAmigos(){
  const el = document.getElementById('mapa-el'); if (!el || !window.L) return;
  const m = L.map(el, {zoomControl:false, attributionControl:false}); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(m);
  const pts = [];
  AMIGOS.forEach(a => { const l = localDe(a.k); if (!l.lat) return; pts.push([l.lat, l.lng]); L.marker([l.lat, l.lng], {icon:L.divIcon({className:'', html:'<div class="pin-am' + (a.st === 'vai' ? ' vai' : '') + '">' + esc(a.nome.split(' ')[0].slice(0, 2).toUpperCase()) + '</div>', iconSize:[30, 30], iconAnchor:[15, 15]})}).addTo(m).bindPopup('<b>' + esc(a.nome) + '</b><br>' + esc(l.nome) + (a.st === 'la' ? ' · lá agora' : ' · a caminho')); });
  if (pts.length) m.fitBounds(pts, {padding:[24, 24], maxZoom:15}); else m.setView([38.712, -9.14], 14);
  setTimeout(() => m.invalidateSize(), 50);
}

V.dj = p => {
  const d = DJ && DJ.porId(p[0]); if (!d) return {tab:2, html:bar(true, 'DJ') + note('DJ não encontrado.')};
  const segD = ls('streetfy:segue-djs', {}), sets = DJ.setsDe(d);
  return {tab:2, html:
    '<div class="pc"><div class="im duo" style="background-image:url(' + esc(IMG(d.foto)) + ');height:200px"></div><div class="ov">' + tag(esc(DJ.NIVEL[d.nivel]) + (d.casa ? ' · ' + esc(d.casa) : ''), 'mint') + '<span class="poster-t">' + esc(d.art) + '</span><span style="font-size:12px">' + esc(d.nome) + ' · ' + esc(d.bio || '') + '</span></div></div>'
    + '<div class="bar" style="margin-top:-6px">' + icob('back', '', '', 'Voltar').replace('data-go=""', 'data-back') + '<div class="ttl"></div></div>'
    + '<div class="stats"><div><b>' + fmt(d.seg) + '</b><small>seguidores</small></div><div><b>' + d.sets + '</b><small>sets · 30 d</small></div><div><b>★ ' + esc(d.nota) + '</b><small>' + d.resp + ' notas</small></div></div>'
    + '<div class="sw">' + btn(segD[d.id] ? 'A seguir ✓' : 'Seguir', segD[d.id] ? 'mint' : '', 'data-act="seg" data-k="streetfy:segue-djs" data-id="' + esc(d.id) + '"') + (sets[0] ? btn('Pedir lugar na lista', 'ghost', 'data-go="lista/' + esc(sets[0].id) + '?dj=' + esc(d.id) + '"') : '') + '</div>'
    + lbl('Próximos sets') + (sets.length ? sets.map(i => row(IMG(i.img), esc(i.titulo), esc(i.lugar || '') + ' · ' + esc(quando(i)) + (horaDe(i) ? ' · ' + esc(horaDe(i)) : ''), ['›', 'ac'], 'data-go="evento/' + esc(i.id) + '"')).join('') : note('Sem sets marcados.'))
    + lbl('Mixes') + (d.mixes || []).map(x => row(null, esc(x[0]), x[1] + ' min · ' + esc(x[2]), ['▶', 'ac'], 'data-act="toast" data-t="A tocar no ' + esc(x[2]) + ' (simulado)"')).join('')
    + lbl('Rider técnico') + note('2 × CDJ-3000 em link · DJM-V10 ou DJM-900NXS2 · monitores de cabine · USB e SD · água na cabine')
    + note('Só a casa vê "Pedir booking", no portal. A lista do DJ passa pela aprovação da casa.')};
};

V.promoter = p => {
  const x = PR.lista.find(y => y.id === p[0]); if (!x) return {tab:2, html:bar(true, 'Promoter') + note('Promoter não encontrado.')};
  const segP = ls('streetfy:segue-promoters', {}), fs = PR.festasDe(x).slice(0, 5);
  return {tab:2, html:
    bar(true, esc(x.nome), 'promoter · ' + esc(x.nivel) + ' · ' + esc(x.cidade))
    + who(IMG(x.foto), esc(x.nome), esc(x.bio || ''), '')
    + '<div class="stats"><div><b>' + fmt(x.seg) + '</b><small>seguidores</small></div><div><b>' + fmt(x.pres) + '</b><small>presenças</small></div><div><b>★ ' + esc(x.nota) + '</b><small>' + x.resp + ' notas</small></div><div><b>' + esc(x.valeu) + '%</b><small>valeu</small></div></div>'
    + btn(segP[x.id] ? 'A seguir ✓' : 'Seguir', segP[x.id] ? 'mint' : '', 'data-act="seg" data-k="streetfy:segue-promoters" data-id="' + esc(x.id) + '"')
    + lbl('Festas que indica', 'só do catálogo') + fs.map(i => row(IMG(i.img), esc(i.titulo), esc(i.lugar || '') + ' · ' + esc(quando(i)) + ((x.comissao || []).includes(i.id) ? ' · com comissão' : ' · sem comissão'), ['lista ›', 'ac'], 'data-go="lista/' + esc(i.id) + '?p=' + esc(x.id) + '"')).join('')
    + note('A comissão é declarada pela casa por evento e aparece ao comprador. A nota vem só de quem fez check-in.')};
};

V.conquistas = () => {
  if (!G) return {tab:2, html:bar(true, 'Conquistas') + note('Indisponível.')};
  const ac = ls(G.AK, {lux:true}), rank = ls(G.RK, false), ganhos = G.SELOS.filter(s => s.ok).length;
  return {tab:2, html:
    bar(true, 'As tuas conquistas', 'só o verificado conta')
    + '<div class="ocard" style="background:#111;color:#fff;border-color:#111"><div class="hd3"><b style="color:var(--ac2)">Nível 7 · Noctívaga</b><span style="color:#cfcfcf">1 840 / 2 500 pontos' + (ui.pontos ? ' · +' + ui.pontos + ' hoje' : '') + '</span></div><div class="barra" style="background:#333"><i style="width:74%"></i></div><div class="it" style="color:#cfcfcf">Sequência: 6 semanas ✓✓✓✓✓✓ ? · sai até domingo para manter · não sair não castiga</div></div>'
    + lbl('Selos', ganhos + ' de ' + G.SELOS.length) + '<div class="selos">' + G.SELOS.map(s => '<button type="button" class="selo' + (s.ok ? ' ok' : '') + '" data-act="toast" data-t="' + esc(s.n + ': ' + s.d + (s.ok ? ' Ganho a ' + s.q + '.' : ' Faltam ' + (s.p[1] - s.p[0]) + '.')) + '" style="background:none;border:0;padding:0;cursor:pointer"><i>' + esc(s.ic) + '</i>' + esc(s.n) + (s.ok ? '' : '<span class="pb"><i style="width:' + (s.p[0] / s.p[1] * 100) + '%"></i></span>') + '</button>').join('') + '</div>'
    + lbl('Passaporte de bairros', 'Lisboa') + chips(G.BAIRROS.Lisboa.map(([b, ok]) => ({v:b, t:(ok ? '✓ ' : '') + b, on:!!ok})), 'data-noop', true)
    + lbl('Desafios das casas', 'aceita e conta sozinho com o check-in') + G.DESAFIOS().map(d => oc(esc(d.t), esc(d.casa) + ' · até ' + esc(d.fim), '→ ' + esc(d.premio), ac[d.id] ? '<div>' + barra(d.p[0] / d.p[1] * 100) + '<div class="it" style="margin-top:4px">' + d.p[0] + ' de ' + d.p[1] + '</div></div>' + btn('Aceite ✓ · sair', 'ghost', 'data-act="desafio" data-id="' + esc(d.id) + '"') : btn('Aceitar desafio', 'mint', 'data-act="desafio" data-id="' + esc(d.id) + '"'), ac[d.id] ? '' : 'um')).join('')
    + '<div class="tog"><span><span class="t">Ranking entre amigos</span><span class="s">' + (rank ? 'os amigos que participam veem os teus pontos' : 'desligado: ninguém vê os teus pontos') + '</span></span>' + swt(rank, 'data-act="rank"') + '</div>'
    + (rank ? G.AMIGOS.map(([id, n, pts, noites, eu], k) => who(PES(id === 'mariana-c' ? 'mariana-c' : id), (k + 1) + ' · ' + esc(n), noites + (noites > 1 ? ' noites' : ' noite') + ' esta semana', '<b style="font-family:var(--fd);font-size:20px">' + pts + '</b>')).join('') : '')
    + note('Pontos só de check-in, "Eu vou" cumprido, avaliação e amigo indicado que foi. Nada premia beber.')};
};

V.agenda = (p, q) => {
  const t = q.get('t') || 'proximos', bs = bilhetes(), ens = EN.minhas(), vs = OF ? (OF.carrega(), OF.meus()) : [], rs = reservas(), pd = Object.entries(pedidos()).filter(([, e]) => e === 'pedido'), ev = EV ? EV.ler() : [];
  const corpo = t === 'jafui' ? JA_FUI.map(([n, k, s, chk]) => row(IMG((porId(C.itens.find(i => chave(i) === k) ? C.itens.find(i => chave(i) === k).id : '') || {}).img), esc(n) + ' · Lisboa', esc(s), [chk ? 'check-in ✓' : 'estive lá', chk ? 'ac' : 'mu'], 'data-act="toast" data-t="Avaliar: só com check-in (em breve no app)"')).join('')
    : (lbl('Bilhetes') + (bs.length ? bs.map(b => { const i = porId(b.ev) || {}; return row(IMG(i.img), esc(i.titulo || 'Evento'), esc(i.lugar || '') + ' · ' + esc(quando(i)) + ' · ' + b.qtd + (b.qtd > 1 ? ' bilhetes' : ' bilhete'), ['QR', 'ac'], 'data-go="bilhete/' + esc(b.id) + '"'); }).join('') : note('Ainda sem bilhetes. Compra num evento.'))
    + lbl('Entradas em listas', 'QR depois de a casa aprovar') + (ens.length ? ens.map(e => row(IMG((C.itens.find(i => chave(i) === e.local) || {}).img), esc(e.listaNome), esc(e.localNome) + (e.quando ? ' · ' + esc(e.quando) : '') + (e.usado ? ' · usado ' + esc(EN.hhmm(e.usado)) : ''), [e.usado ? 'usado' : 'QR', e.usado ? 'mu' : 'ac'], 'data-go="qr/' + esc(e.c) + '"')).join('') : '') + pd.map(([key]) => { const [evId] = key.split('|'), i = porId(evId) || {}; return row(IMG(i.img), esc(i.titulo || 'Evento'), 'pedido enviado · à espera de aprovação', ['pendente', 'mu'], 'data-go="lista/' + esc(evId) + '?' + (key.split('|')[1].startsWith('dj:') ? 'dj=' + esc(key.split('|')[1].slice(3)) : key.split('|')[1].startsWith('p:') ? 'p=' + esc(key.split('|')[1].slice(2)) : '') + '"'); }).join('') + (!ens.length && !pd.length ? note('Pede lugar numa lista na página de um evento ou de um DJ.') : '')
    + lbl('Eu vou', 'avisaste quem te segue') + (ev.length ? ev.map(x => { const i = porId(x.id) || {}; return row(IMG(i.img), esc(i.titulo || 'Evento'), esc(i.lugar || '') + ' · ' + esc(quando(i)), ['›', 'ac'], 'data-go="evento/' + esc(x.id) + '"'); }).join('') : '')
    + lbl('Vouchers') + (vs.length ? vs.map(v => { const o = OF.estado().ofertas.find(x => x.id === v.oferta) || {casa:{nome:''}}; return row('../img/cocktail.jpg', esc(OF.oQue(o)), esc(o.casa.nome) + ' · vale até ' + esc(OF.hhmm(v.expira)) + (v.usado ? ' · usado' : ''), [v.usado ? 'usado' : 'QR', v.usado ? 'mu' : 'ac'], 'data-go="voucher/' + esc(v.c) + '"'); }).join('') : note('Aceita uma oferta perto de ti.'))
    + lbl('Reservas de mesa') + (rs.length ? rs.map(r => row('../img/mesa.jpg', 'Mesa ' + esc(r.mesa) + ' · Lux Frágil', esc(r.noite) + ' · ' + eur(r.preco) + ' · 8 pessoas', ['confirmada', 'ac'], 'data-act="toast" data-t="Reserva confirmada · o Lux vê-a na planta"')).join('') : ''));
  return {tab:3, html:bar(false, 'Os meus planos', 'os QR ficam no telemóvel, mesmo sem rede', icob('bell', 'site?p=notificacoes.html', '', 'Avisos')) + seg([['proximos', 'Próximos'], ['jafui', 'Já fui']].map(([v, tt]) => ({v, t:tt, on:t === v})), 'data-taba') + corpo};
};

V.qr = p => {
  const e = EN.de(p[0]); if (!e) return {tab:3, html:bar(true, 'Entrada') + note('Esta entrada não existe neste aparelho.')};
  const i = C.itens.find(x => chave(x) === e.local) || {};
  return {tab:3, dark:true, html:
    bar(true, 'Entrada · ' + esc(e.listaNome), esc(e.localNome), icob('share', '', '', 'Partilhar'))
    + '<div class="qrbox' + (e.usado ? ' usado' : '') + '">' + EN.qrSvg(e.c) + '<div class="codeline">' + esc(e.c) + '</div></div>'
    + kv([['Nome', esc(e.nome)], ['Lista', esc(e.listaNome)], ['Local', esc(e.localNome) + (e.quando ? ' · ' + esc(e.quando) : '')], ['Vale até', e.fechaEm ? esc(EN.hhmm(e.fechaEm)) + ' · a lista fecha antes do evento' : 'até à hora de fecho da lista'], ['Presença', 'conforme a tua escolha: ' + esc(VIS_T[visDe('presenca')])]])
    + (e.usado ? '<div class="warnbar">Usado às ' + esc(EN.hhmm(e.usado)) + (e.por ? ' · lido por ' + esc(e.por) : '') + ' · o check-in ficou feito.</div>' : '<div class="okbar">Lido na porta, fica usado e o check-in fica feito.</div>')
    + (i.id ? btn('Ver o evento', 'ghost', 'data-go="evento/' + esc(i.id) + '"') : '')};
};

V.voucher = p => {
  OF.carrega(); const v = OF.estado().vouchers[p[0]]; if (!v) return {tab:3, html:bar(true, 'Voucher') + note('Voucher não encontrado.')};
  const o = OF.estado().ofertas.find(x => x.id === v.oferta), l = localDe(o.casa.k);
  return {tab:3, dark:true, html:
    bar(true, 'O teu voucher', esc(o.casa.nome), icob('share', '', '', 'Partilhar'))
    + '<div class="qrbox' + (v.usado ? ' usado' : '') + '">' + EN.qrSvg(v.c) + '<div class="codeline">' + esc(v.c) + '</div></div>'
    + kv([['Oferta', esc(OF.oQue(o))], ['Casa', esc(o.casa.nome) + ' · ' + esc(o.casa.bairro || '')], ['Vale até', esc(OF.hhmm(v.expira))], ['Regra', (o.alcool ? '18+ · 1 oferta com álcool por noite' : 'mostra no bar ou na porta')]])
    + (v.usado ? '<div class="warnbar">Usado às ' + esc(OF.hhmm(v.usado)) + '.</div>' : '')
    + '<div class="sw"><a class="btn mint" href="https://www.google.com/maps/dir/?api=1&destination=' + l.lat + ',' + l.lng + '" target="_blank" rel="noopener">Como chegar</a>' + btn('Ver perfil', 'ghost', 'data-site="perfil.html#lugar=' + esc(encodeURIComponent(o.casa.k)) + '"') + '</div>'
    + note('Mostra no bar ou na porta; lido uma vez, fica usado. Não precisa de rede.')};
};

V.ofertas = () => {
  if (!OF) return {tab:0, html:bar(true, 'Ofertas') + note('Indisponível.')};
  ofertasFrescas(); const loc = locAtual(), zona = raw('streetfy:app-loc', 'Bairro Alto'), todas = OF.estado().ofertas.filter(o => OF.ativa(o)), perto = todas.filter(o => OF.dentro(o.zona, loc)), fora = todas.filter(o => !OF.dentro(o.zona, loc)), meus = OF.meus();
  return {tab:0, html:
    bar(true, 'Ofertas perto de ti', 'a posição nunca sai do telemóvel')
    + lbl('Onde estás', 'protótipo: escolhe a zona') + chips(OF.SIM.map(s => ({v:s[0], t:s[0], on:zona === s[0]})), 'data-loc')
    + '<div class="guar">' + ico('shield', 's') + '<span><b>A tua posição fica no telemóvel</b>O app compara-a com as zonas das ofertas aqui dentro; a casa só vê números agregados.</span></div>'
    + lbl('Nesta zona agora', perto.length + '') + (perto.length ? perto.map(o => oc(esc(OF.oQue(o)), esc(o.casa.nome), esc(OF.PUB[o.publico]) + ' · ' + esc(OF.estadoTxt(o)) + ' · restam ' + OF.restantes(o) + (o.alcool ? ' · 18+ · 1 com álcool por noite' : ''), ofBotao(o), 'um')).join('') : note('Nenhuma oferta ativa nesta zona.'))
    + (fora.length ? lbl('Noutras zonas') + fora.map(o => oc(esc(OF.oQue(o)), esc(o.casa.nome), 'só para quem está na zona da oferta · ' + esc(OF.estadoTxt(o)), '', '')).join('') : '')
    + lbl('Os meus vouchers', meus.length + '') + (meus.length ? meus.map(v => { const o = OF.estado().ofertas.find(x => x.id === v.oferta); return row('../img/cocktail.jpg', esc(OF.oQue(o)), esc(o.casa.nome) + ' · vale até ' + esc(OF.hhmm(v.expira)) + (v.usado ? ' · usado' : ''), [v.usado ? 'usado' : 'QR', v.usado ? 'mu' : 'ac'], 'data-go="voucher/' + esc(v.c) + '"'); }).join('') : note('Ainda nenhum.'))};
};

V.perfil = () => {
  const p = perfil(), func = FU ? FU.minhas(EU) : [], papel = raw('streetfy:sessao', 'utilizador'), selos = G ? G.SELOS.filter(s => s.ok).slice(0, 5) : [];
  return {tab:4, html:
    '<div style="display:flex;gap:12px;align-items:center"><span class="av" style="width:58px;height:58px;background-image:url(' + esc(IMG(p.foto)) + ');box-shadow:0 0 0 2.5px var(--ac)"></span><div style="min-width:0;flex:1"><div class="poster-t" style="font-size:24px">' + esc(p.nome) + '</div><div class="desc">@' + esc(p.user) + ' · ' + esc(p.cidade) + ' · <b>Nível 7 · Noctívaga</b></div></div>' + icob('set', 'site?p=editar.html', '', 'Editar perfil') + '</div>'
    + '<div class="stats"><div><b>112</b><small>eventos</small></div><div><b>48</b><small>lugares</small></div><div><b>320</b><small>seguidores</small></div><div><b>180</b><small>seguindo</small></div></div>'
    + '<div class="sw">' + btn('Editar perfil', 'ghost', 'data-site="editar.html"') + btn('Privacidade', 'ghost', 'data-go="perfil/privacidade"') + '</div>'
    + lbl('Nível e selos', tag(VIS_T[visDe('conquistas')], 'dim')) + '<div class="selos" style="grid-template-columns:repeat(5,1fr)">' + selos.map(s => '<div class="selo ok"><i>' + esc(s.ic) + '</i>' + esc(s.n) + '</div>').join('') + '</div>' + btn('Ver as conquistas', 'ghost', 'data-go="conquistas"')
    + lbl('Onde estive', tag(VIS_T[visDe('jaFui')], 'dim')) + JA_FUI.slice(0, 3).map(([n, k, s, chk]) => row(IMG((C.itens.find(i => chave(i) === k) || {}).img), esc(n) + ' · Lisboa', esc(s), [chk ? 'check-in ✓' : 'estive lá', chk ? 'ac' : 'mu'], 'data-site="perfil.html#lugar=' + esc(encodeURIComponent(k)) + '"')).join('')
    + lbl('O meu portal') + (func.length ? row(null, 'Modo porta · ' + esc(FU.CASA.nome), 'função ativa · ler QR, listas, vouchers', ['abrir ›', 'ac'], 'data-go="porta"') : '') + row(null, 'Os meus papéis', 'estás como ' + esc(papel) + ' · promoter, DJ, concierge, casa', ['›', 'ac'], 'data-go="perfil/papeis"') + row(null, 'Portal completo (web)', 'eventos, planta, menu, ofertas, repasses', ['›', 'ac'], 'data-go="site?p=portal.html"')
    + lbl('Conta') + row(null, 'Perfil profissional', 'promoter, concierge ou DJ', ['›', 'ac'], 'data-site="trabalhar.html"') + row(null, 'Avisos', '', ['›', 'ac'], 'data-go="site?p=notificacoes.html"') + row(null, 'Ajuda e denúncia', '', ['›', 'ac'], 'data-site="ajuda.html"') + row(null, 'Repor a demonstração', 'apaga o que fizeste neste aparelho', ['', 'mu'], 'data-act="repor"')
    + note('Fechado por omissão: o que não ligares na privacidade, ninguém vê.')};
};

V['perfil/privacidade'] = () => {
  const perg = ls('streetfy:app-perguntar', false), rank = G ? ls(G.RK, false) : false, modo = raw('streetfy:partilha-local', 'amigos').replace(/"/g, '');
  const B = [['aSeguir', 'A seguir'], ['jaFui', 'Já fui'], ['fotos', 'Fotos'], ['aval', 'Avaliações'], ['gostos', 'Gostos'], ['seguindo', 'Seguindo'], ['listas', 'Listas de convidados'], ['conquistas', 'Conquistas · nível e selos']];
  return {tab:4, html:
    bar(true, 'Quem vê o quê', 'muda aqui e vale também no site')
    + B.map(([k, t]) => '<div class="tog"><span><span class="t">' + t + '</span></span>' + seg3(visDe(k), 'data-act="vis" data-k="' + k + '"') + '</div>').join('')
    + '<div class="tog"><span><span class="t">Quem está aqui</span><span class="s">a tua presença, por noite</span></span>' + seg3(visDe('presenca'), 'data-act="vis" data-k="presenca"') + '</div>'
    + '<div class="tog"><span><span class="t">Perguntar sempre no check-in</span><span class="s">' + (perg ? 'o app pergunta a cada noite' : 'desligado: a porta aplica a tua escolha') + '</span></span>' + swt(perg, 'data-act="perguntar"') + '</div>'
    + '<div class="tog"><span><span class="t">Ranking entre amigos</span><span class="s">' + (rank ? 'os amigos que participam veem os teus pontos' : 'ninguém vê os teus pontos') + '</span></span>' + swt(rank, 'data-act="rank"') + '</div>'
    + '<div class="tog"><span><span class="t">Partilhar o local com amigos</span><span class="s">só o local · apaga-se às 6h · ' + esc(modo) + '</span></span>' + swt(modo !== 'fantasma', 'data-act="partilha" data-v="' + (modo === 'fantasma' ? 'amigos' : 'fantasma') + '"') + '</div>'
    + note('Exportar ou apagar a conta: em Editar perfil, no site.')};
};

V['perfil/papeis'] = () => {
  const s = raw('streetfy:sessao', 'utilizador');
  const R = [['utilizador', PES('mariana-c'), 'Mariana Costa', 'utilizadora · esta conta'], ['parceiro', '../img/lux.jpg', 'Lux Frágil', 'casa · aprovar listas e eventos, bookings, planta'], ['promoter', PES('carla-v'), 'Rita M.', 'promoter · listas, favoritos, os meus eventos'], ['dj', '../img/dj.jpg', 'NVRL', 'DJ · bookings, sets, faturação'], ['concierge', '../img/cocktail.jpg', 'Lara V.', 'concierge · propostas, mesas seguras']];
  return {tab:4, html:
    bar(true, 'Entrar como', 'uma conta, vários papéis')
    + R.map(([v, img, n, sub]) => who(img, esc(n), esc(sub), act(s === v ? '✓' : 'Entrar', 'data-act="sessao" data-v="' + v + '"', s === v ? 'on' : ''))).join('')
    + btn('Abrir o portal como ' + esc(R.find(r => r[0] === s)[2]), 'ink', 'data-go="site?p=portal.html"')
    + note('O portal abre na aba do papel escolhido. O app guarda o essencial da rua; o portal completo é web.')};
};

V.porta = () => {
  const ok = FU && FU.pode(EU, 'qr'), f = FU ? FU.minhas(EU)[0] : null;
  if (!ok) return {tab:4, html:bar(true, 'Modo porta') + '<div class="warnbar">Sem função ativa com "Ler QR na entrada". A casa dá a função no portal (Funcionários).</div>' + btn('Abrir o portal da casa', 'ghost', 'data-go="site?p=portal.html"')};
  return {tab:4, dark:true, html:
    bar(true, 'Porta · ' + esc(FU.CASA.nome), 'Portaria · ler QR, listas, vouchers')
    + '<div class="scan">aponta ao QR<br>XY- entradas · OF- vouchers · bilhetes<br><small>no protótipo escreve o código</small></div>'
    + '<div style="display:flex;gap:8px"><input class="inp" data-porta-in placeholder="XY-… ou OF-…" autocapitalize="characters" autocomplete="off" style="flex:1;text-transform:uppercase">' + btn('Ler', 'mint', 'data-act="porta-ler" style="width:auto;padding-inline:18px"') + '</div>'
    + ui.porta.map(r => '<div class="' + (r.ok ? 'okbar' : 'warnbar') + '">' + esc(r.h) + ' · <b>' + esc(r.t) + '</b>' + (r.s ? ' · ' + esc(r.s) : '') + '</div>').join('')
    + '<div class="stats"><div><b>' + (142 + ui.porta.filter(r => r.ok).length) + '</b><small>entraram</small></div><div><b>' + (9 + ui.porta.filter(r => !r.ok).length) + '</b><small>recusados</small></div><div><b>0</b><small>em fila · sem rede</small></div></div>'
    + note('A lista do dia já está no telemóvel: funciona sem rede e sobe quando voltar. Códigos de teste: os QR da tua agenda (XY-…) e os vouchers (OF-…).')};
};

V.site = (p, q) => ({tab:-1, html:bar(true, 'Xouty · site', esc(q.get('p') || '')) + '<iframe class="frame" src="' + esc(hrefSite(q.get('p') || 'index.html')) + '" title="Página do site"></iframe>'});
V.nada = () => ({tab:0, html:bar(true, 'Página não encontrada') + btn('Ir para o início', '', 'data-go=""')});

/* ---------- router ---------- */
function parse(){ const h = location.hash.replace(/^#\/?/, ''); const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean); return {parts, q:new URLSearchParams(qs || '')}; }
function render(semScroll){
  const {parts, q} = parse(); let name = parts[0] || 'inicio', params = parts.slice(1).map(decodeURIComponent);
  if (parts[0] === 'pessoas' && parts[1] === 'mapa') { name = 'pessoas/mapa'; params = []; }
  if (parts[0] === 'perfil' && parts[1]) { name = 'perfil/' + parts[1]; params = []; }
  const fn = V[name] || V.nada;
  let out; try { out = fn(params, q); } catch (e) { out = {tab:0, html:bar(true, 'Erro') + note(esc(e.message))}; console.error(e); }
  clearInterval(V._t);
  const y = window.scrollY;
  app.innerHTML = '<div class="scr' + (out.dark ? ' dark' : '') + (out.tab < 0 ? ' semtabs' : '') + '">' + out.html + '</div>';
  tabs.hidden = out.tab < 0;
  tabs.innerHTML = [['', 'home', 'Início'], ['eventos', 'cal', 'Eventos'], ['pessoas', 'users', ''], ['agenda', 'ticket', 'Agenda'], ['perfil', 'user', 'Perfil']].map((t, k) => '<a href="#/' + t[0] + '" class="' + (k === 2 ? 'mid' : '') + (out.tab === k ? ' on' : '') + '">' + ico(t[1]) + (t[2] ? '<span>' + t[2] + '</span>' : '') + '</a>').join('');
  if (semScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  if (out.after) out.after();
  document.title = 'Xouty' + (name !== 'inicio' ? ' · ' + name.split('/')[0] : '');
}
const go = h => { location.hash = '#/' + h; };
window.addEventListener('hashchange', () => render(false));

/* ---------- ações ---------- */
const pintaGosto = id => { const on = !!(GO && GO.tem(id)); app.querySelectorAll('[data-f="gosto"][data-v="' + CSS.escape(id) + '"]').forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); const a = b.closest('a[data-id]'); if (a) a.classList.toggle('gostado', on); }); };
app.addEventListener('click', ev => {
  const g = ev.target.closest('[data-f="gosto"]');
  if (g) { ev.preventDefault(); ev.stopPropagation(); if (GO) GO.alternar(g.dataset.v); pintaGosto(g.dataset.v); return; }
  const v = ev.target.closest('[data-vista]');
  if (v) { rawSet(VISTA_K, v.dataset.vista === 'lista' ? 'lista' : 'cartoes'); return render(true); }
  const a = ev.target.closest('a[data-id]');
  if (a && a.closest('.s-cards')) { ev.preventDefault(); go('evento/' + a.dataset.id); }
});
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-go],[data-back],[data-act],[data-site],[data-quando],[data-set-quando],[data-set-tipo],[data-tabp],[data-taba],[data-estilo],[data-noite],[data-mesa],[data-metodo],[data-loc]'); if (!b) return;
  const d = b.dataset;
  if (b.tagName === 'A' && b.hash && !d.go && !d.act) return;
  ev.preventDefault();
  if (d.back !== undefined) { if (history.length > 1) history.back(); else go(''); return; }
  if (d.go !== undefined) { go(d.go); return; }
  if (d.site) { location.href = hrefSite(d.site); return; }
  if (d.quando) { sv('streetfy:app-quando', d.quando); return render(true); }
  if (d.setQuando) { sv('streetfy:app-quando', d.setQuando); ui.mais = 30; return go('eventos?quando=' + d.setQuando + '&tipo=' + (parse().q.get('tipo') || 'tudo')); }
  if (d.setTipo) { ui.mais = 30; return go('eventos?quando=' + (parse().q.get('quando') || ls('streetfy:app-quando', 'hoje')) + '&tipo=' + d.setTipo); }
  if (d.tabp) return go('pessoas?t=' + d.tabp);
  if (d.taba) return go('agenda?t=' + d.taba);
  if (d.estilo !== undefined) { if (!d.estilo) ui.estilos.clear(); else if (ui.estilos.has(d.estilo)) ui.estilos.delete(d.estilo); else ui.estilos.add(d.estilo); return render(true); }
  if (d.noite) { ui.noite = d.noite; ui.mesa = ''; return render(true); }
  if (d.mesa) { ui.mesa = d.mesa; return render(true); }
  if (d.metodo) { ui.metodo = d.metodo; return render(true); }
  if (d.loc) { rawSet('streetfy:app-loc', d.loc); return render(true); }
  const a = d.act; if (!a) return;
  if (a === 'cidade') { sv('streetfy:app-cidade', d.id); return go(''); }
  if (a === 'mais') { ui.mais += 30; return render(true); }
  if (a === 'toast') return toast(d.t || 'Feito');
  if (a === 'gosto' && GO) { GO.alternar(d.id); return render(true); }
  if (a === 'euvou' && EV) { const i = porId(d.id); if (i) { const r = EV.alterna(i); if (r && r.erro) toast(r.erro); else toast(EV.tem(i.id) ? 'Eu vou ✓ · os teus seguidores vão saber' : 'Tirado dos planos'); } return render(true); }
  if (a === 'seguir') { seguirLugar(d.k, !segue(d.k)); toast(segue(d.k) ? 'A seguir ✓' : 'Deixaste de seguir'); return render(true); }
  if (a === 'seguir-comprar') { seguirLugar(d.k, true); toast('A seguir ✓ · já podes comprar'); return render(true); }
  if (a === 'seg') { const o = ls(d.k, {}); if (o[d.id]) delete o[d.id]; else o[d.id] = 1; sv(d.k, o); return render(true); }
  if (a === 'qtd') { const i = porId(d.id); const n = Math.max(1, Math.min(6, (qtdMem[d.id] || 2) + (+d.d))); qtdMem[d.id] = n; return render(true); }
  if (a === 'pagar') { const i = porId(d.id); if (!i) return; const nif = (app.querySelector('[data-nif]') || {}).value || ''; const base = precoNum(i), qtd = +d.qtd || 2, codigo = Array.from({length:6}, (_, k) => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[(Math.imul((Date.now() + k * 7919) >>> 0, 2654435761) >>> 8) % 24]).join('');
    const b = {id:'b' + Date.now().toString(36), ev:i.id, qtd, base, codigo, t:Date.now(), metodo:({apple:'Apple Pay', mbway:'MB WAY', cartao:'cartão'})[ui.metodo] || 'cartão', nif:nif ? '•••••' + nif.slice(-4) : ''}; const L = bilhetes(); L.unshift(b); sv(BK, L); if (EV && !EV.tem(i.id)) EV.alterna(i); toast('Pago (simulado) · bilhete na agenda'); return go('bilhete/' + b.id); }
  if (a === 'aceitar' && OF) { OF.carrega(); const o = OF.estado().ofertas.find(x => x.id === d.id); if (!o) return; if (OF.precisaSeguir(o)) OF.seguir(o); const r = OF.aceitar(d.id, locAtual()); if (!r.ok) return toast(r.txt); toast('Voucher aceite ✓'); return go('voucher/' + r.v.c); }
  if (a === 'lista-pedir') { const P = pedidos(); P[d.key] = 'pedido'; sv(PK, P); toast('Pedido enviado'); return render(true); }
  if (a === 'lista-seguir-pedir') { seguirLugar(d.k, true); const P = pedidos(); P[d.key] = 'pedido'; sv(PK, P); toast('A seguir ✓ · pedido enviado'); return render(true); }
  if (a === 'lista-cancela') { const P = pedidos(); delete P[d.key]; sv(PK, P); return render(true); }
  if (a === 'lista-aprova') { const i = porId(d.ev); if (!i) return; const l = localDe(chave(i)); EN.garante('app:' + d.key, d.nome + ' · ' + i.titulo, EU, l.k, l.nome, quando(i)); const P = pedidos(); P[d.key] = 'aceite'; sv(PK, P); toast('Aprovado · o QR está na agenda'); return render(true); }
  if (a === 'reservar') { const n = ME.noiteDe(ui.noite); const L = reservas(); L.unshift({id:'r' + Date.now().toString(36), mesa:d.mesa, preco:+d.preco, noite:n.dia + ' · ' + n.nome, t:Date.now()}); sv(RK, L); toast('Mesa ' + d.mesa + ' reservada (simulado)'); return go('agenda'); }
  if (a === 'irter') { const l = localDe(d.k); sv('streetfy:eu-a-caminho', {k:d.k, st:'caminho', t:Date.now()}); toast('A caminho do ' + l.nome + ' · os teus amigos veem'); window.open('https://www.google.com/maps/dir/?api=1&destination=' + l.lat + ',' + l.lng, '_blank'); return render(true); }
  if (a === 'partilha') { rawSet('streetfy:partilha-local', JSON.stringify(d.v)); return render(true); }
  if (a === 'desafio' && G) { const ac = ls(G.AK, {lux:true}); ac[d.id] = !ac[d.id]; sv(G.AK, ac); toast(ac[d.id] ? 'Desafio aceite · conta com o check-in' : 'Saíste do desafio'); return render(true); }
  if (a === 'rank' && G) { sv(G.RK, !ls(G.RK, false)); return render(true); }
  if (a === 'vis') { setVis(d.k, d.v); return render(true); }
  if (a === 'perguntar') { sv('streetfy:app-perguntar', !ls('streetfy:app-perguntar', false)); return render(true); }
  if (a === 'sessao') { rawSet('streetfy:sessao', d.v); toast('Agora és ' + d.v); return render(true); }
  if (a === 'porta-ler') { const inp = app.querySelector('[data-porta-in]'), c = String(inp ? inp.value : '').trim().toUpperCase(); if (!c) return; let r;
    if (c.startsWith('OF-')) { const x = OF ? OF.validar(c, EU + ' · Portaria (app)') : {ok:false, t:'Ofertas indisponíveis'}; r = {ok:x.ok, t:x.t, s:x.s}; }
    else { const e = EN.de(c); if (!e) r = {ok:false, t:'QR inválido', s:'este código não está em nenhuma lista'}; else if (e.local !== FU.CASA.k) r = {ok:false, t:'QR de outra casa', s:e.nome + ' · ' + e.localNome}; else { const x = EN.lerQR(c, EU + ' · Portaria (app)'); r = x.ok ? {ok:true, t:'Pode entrar: ' + e.nome, s:e.listaNome + ' · check-in feito'} : x.motivo === 'fechada' ? {ok:false, t:'Lista fechada', s:e.listaNome + ' fechou às ' + EN.hhmm(e.fechaEm)} : {ok:false, t:'QR já usado', s:e.nome + ' entrou às ' + EN.hhmm(e.usado)}; } }
    r.h = hhmm(Date.now()); ui.porta.unshift(r); ui.porta = ui.porta.slice(0, 6); if (r.ok) ui.pontos += 50; return render(true); }
  if (a === 'repor') { ['streetfy:bilhetes-app', 'streetfy:app-reservas', 'streetfy:pedidos-lista', 'streetfy:eu-a-caminho', 'streetfy:eu-vou', 'streetfy:ofertas', 'streetfy:gami-desafios', 'streetfy:gami-rank', 'streetfy:app-perguntar'].forEach(k => localStorage.removeItem(k)); Object.keys(localStorage).filter(k => k.startsWith('segue:') || k.startsWith('streetfy:entradas')).forEach(k => localStorage.removeItem(k)); toast('Demonstração reposta'); return go(''); }
});
document.addEventListener('input', ev => { const i = ev.target.closest('[data-busca]'); if (!i) return; ui.busca = i.value; clearTimeout(ui._b); ui._b = setTimeout(() => { const el = app.querySelector('[data-busca]'); const pos = el ? el.selectionStart : 0; render(true); const n = app.querySelector('[data-busca]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } }, 250); });
document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches('[data-porta-in]')) { ev.preventDefault(); const b = app.querySelector('[data-act="porta-ler"]'); if (b) b.click(); } if (ev.key === 'Enter' && ev.target.matches('[data-busca]')) ev.target.blur(); });
render(false);
})();
